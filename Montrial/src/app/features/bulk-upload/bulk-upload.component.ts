import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss']
})
export class BulkUploadComponent {
  selectedFile: File | null = null;
  isDragging = false;
  uploadStatus: 'idle' | 'success' | 'error' = 'idle';

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.handleFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  private handleFile(file: File): void {
    // Only allow .csv or .xlsx
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['csv', 'xlsx'].includes(extension || '')) {
      this.selectedFile = file;
      this.uploadStatus = 'idle';
    } else {
      alert('Invalid file type. Please upload a CSV or XLSX file.');
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadStatus = 'idle';
  }

  uploadFile(): void {
    if (!this.selectedFile) return;
    console.log('Uploading:', this.selectedFile.name);
    // Simulate API call
    setTimeout(() => {
      this.uploadStatus = 'success';
    }, 1500);
  }
}