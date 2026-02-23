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
    this.holdName = '';
    this.managerName = '';
    this.lawyerEmail = '';
    this.filteredModalRows = [...this.selectedRows];
    this.dialog.open(templateRef, {
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
    console.log('Applying Hold:', {
      hold: this.holdName,
      manager: this.managerName,
      rows: this.filteredModalRows
    });
    this.closeModal();
  }
}

// NEW CODE WITH STORE BELOW

import { Component, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as LegalHoldSelectors from '../../store/legal-hold/legal-hold.selectors';
import { LegalHoldActions } from '../../store/legal-hold/legal-hold.actions';

@Component({
  selector: 'app-selection-panel',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDialogModule, 
    FormsModule
  ],
  templateUrl: './selection-panel.component.html',
  styleUrls: ['./selection-panel.component.scss']
})
export class SelectionPanelComponent {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  // GLOBAL STATE: Automatically syncs with Results Grid and Bulk Upload
  public selectedRows = this.store.selectSignal(LegalHoldSelectors.selectSelectedProfiles);
  public selectedCount = this.store.selectSignal(LegalHoldSelectors.selectSelectedCount);

  // Modal Properties
  holdName = '';
  managerName = '';
  lawyerEmail = '';
  filteredModalRows: any[] = [];
  private dialogRef?: MatDialogRef<any>;

  // --- Actions ---

  onRemove(row: any) {
    // Filter out the specific row and update global store
    const updatedSelection = this.selectedRows().filter(r => r.ocifId !== row.ocifId);
    this.store.dispatch(LegalHoldActions.updateSelection({ 
      selectedProfiles: updatedSelection 
    }));
  }

  openApplyModal(templateRef: TemplateRef<any>) {
    this.holdName = '';
    this.managerName = '';
    this.lawyerEmail = '';
    this.filteredModalRows = [...this.selectedRows()]; // Snap current store state
    
    this.dialogRef = this.dialog.open(templateRef, {
      width: '1000px',
      maxWidth: '95vw',
      panelClass: 'bmo-apply-hold-dialog',
      autoFocus: false
    });
  }

  filterModalData() {
    const search = this.holdName.toLowerCase();
    this.filteredModalRows = this.selectedRows().filter(row => 
      row.legalName.toLowerCase().includes(search) || 
      row.ocifId.toLowerCase().includes(search)
    );
  }

  confirmApply() {
    // Example: Dispatch a CRUD action for the future API call
    console.log('Dispatching Apply Action:', {
      hold: this.holdName,
      manager: this.managerName,
      profiles: this.filteredModalRows
    });
    this.dialogRef?.close();
  }
}