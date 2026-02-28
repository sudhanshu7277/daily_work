import { Component, Input, Output, EventEmitter, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-selection-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './selection-panel.component.html',
  styleUrls: ['./selection-panel.component.scss']
})
export class SelectionPanelComponent {
  @Input() selectedRows: any[] = [];
  @Output() removeProfile = new EventEmitter<any>();

  holdName = '';
  managerName = '';
  lawyerEmail = '';
  filteredModalRows: any[] = [];
  private dialogRef?: MatDialogRef<any>;
  private dialog = inject(MatDialog);

  onRemove(row: any) {
    this.removeProfile.emit(row);
  }

  openApplyModal(templateRef: TemplateRef<any>) {
    this.holdName = '';
    this.managerName = '';
    this.lawyerEmail = '';
    this.filteredModalRows = [...this.selectedRows];
    this.dialogRef = this.dialog.open(templateRef, {
      width: '1000px',
      maxWidth: '95vw',
      panelClass: 'bmo-apply-hold-dialog',
      autoFocus: false
    });
  }

  filterModalData() {
    const search = this.holdName.toLowerCase();
    this.filteredModalRows = this.selectedRows.filter(row => 
      row.legalName.toLowerCase().includes(search)
    );
  }

  closeModal() {
    this.dialogRef?.close();
  }

  confirmApply() {
    console.log('Confirmed:', this.holdName);
    this.closeModal();
  }
}