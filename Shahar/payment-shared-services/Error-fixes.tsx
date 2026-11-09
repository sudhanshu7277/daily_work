//purge-pause.component.ts

onEditRecord(record: PurgePauseRecord): void {
  this.editingRecordId = record.id;
  this.editModalErrorMessage = null;
  this.isEditManagerMaxExceeded = false;
  this.isEditEmailMaxExceeded = false;

  this.editForm.patchValue({
    classActionProject: record.classActionProject,
    ediscoveryProjectManager: record.ediscoveryProjectManager,
    responsibleLawyerEmail: record.responsibleLawyerEmail
  });

  // 1. Add scoped class to body only while this modal is active
  document.body.classList.add('purge-pause-dialog-open');

  this.dialogRef = this.dialog.open(this.editClassActionDialog, {
    width: '780px',
    maxWidth: '90vw',
    panelClass: 'bmo-edit-dialog-panel',
    backdropClass: 'bmo-transparent-backdrop' // Makes the CDK backdrop transparent
  });

  // 2. Remove scoped class as soon as the dialog closes
  this.dialogRef.afterClosed().subscribe(() => {
    document.body.classList.remove('purge-pause-dialog-open');
  });
}


//2. In purge-pause.component.scss
// Add these rules at the bottom of purge-pause.component.scss:

// Scoped strictly to when Purge Pause modal is open
::ng-deep body.purge-pause-dialog-open {
  overflow-x: visible !important;

  // Overrides the CDK scrollblock that injects overflow rules
  &.cdk-global-scrollblock {
    overflow-x: visible !important;
  }
}

// Scoped transparent backdrop for the edit modal
::ng-deep .bmo-transparent-backdrop {
  background-color: transparent !important;
  opacity: 0 !important;
}