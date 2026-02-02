import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-selection-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './selection-panel.component.html',
  styleUrls: ['./selection-panel.component.scss']
})
export class SelectionPanelComponent {
  @Input() selectedRows: any[] = [];
  @Output() removeRow = new EventEmitter<any>();
  @Output() applyAction = new EventEmitter<void>();
  @Output() releaseAction = new EventEmitter<void>();

  onRemove(row: any) {
    this.removeRow.emit(row);
  }

  onApply() {
    this.applyAction.emit();
  }

  onRelease() {
    this.releaseAction.emit();
  }
}

/// SELECTION PANEL MODEL CODE BLOW

import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// ... other imports ...

export class SelectionPanelComponent {
  @Input() selectedRows: any[] = [];
  
  // Modal Specific Properties
  holdName = '';
  managerName = '';
  lawyerEmail = '';
  filteredModalRows: any[] = [];
  private dialogRef?: MatDialogRef<any>;

  constructor(private dialog: MatDialog) {}

  openApplyModal(templateRef: TemplateRef<any>) {
    // Reset inputs and load the latest selected rows
    this.holdName = '';
    this.managerName = '';
    this.lawyerEmail = '';
    this.filteredModalRows = [...this.selectedRows];

    this.dialogRef = this.dialog.open(templateRef, {
      width: '950px',
      panelClass: 'bmo-custom-modal',
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
    console.log('Applying Hold:', {
      hold: this.holdName,
      manager: this.managerName,
      rows: this.filteredModalRows
    });
    this.closeModal();
  }
}