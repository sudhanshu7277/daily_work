//1. In purge-pause.component.ts
//Enable classActionProject in initForms() with 
// standard validators and character guards:

// 3. Edit Form (All 3 fields editable)
this.editForm = this.fb.group({
  classActionProject: ['', [
    Validators.required,
    Validators.maxLength(100),
    Validators.pattern(/^[^*,<>]*$/)
  ]],
  ediscoveryProjectManager: ['', [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)
  ]],
  responsibleLawyerEmail: ['', [
    Validators.required,
    Validators.email,
    Validators.maxLength(50)
  ]]
});


//Add the length-exceeded flag for the edit form's classActionProject:

isEditClassActionMaxExceeded = false;
  isEditManagerMaxExceeded = false;
  isEditEmailMaxExceeded = false;


  //Update setLimitFlag to track all three fields in the edit form:

  private setLimitFlag(formType: 'pause' | 'search' | 'edit', controlName: string, value: boolean): void {
    if (formType === 'pause') {
      if (controlName === 'classActionProject') this.isPauseClassActionMaxExceeded = value;
      if (controlName === 'ediscoveryProjectManager') this.isPauseManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isPauseEmailMaxExceeded = value;
    } else if (formType === 'search') {
      if (controlName === 'classActionProject') this.isSearchClassActionMaxExceeded = value;
      if (controlName === 'ediscoveryProjectManager') this.isSearchManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isSearchEmailMaxExceeded = value;
    } else {
      if (controlName === 'classActionProject') this.isEditClassActionMaxExceeded = value;
      if (controlName === 'ediscoveryProjectManager') this.isEditManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isEditEmailMaxExceeded = value;
    }
  }


  //Reset the flags in onEditRecord():

  onEditRecord(record: PurgePauseRecord): void {
    this.editingRecordId = record.id;
    this.editModalErrorMessage = null;
    this.isEditClassActionMaxExceeded = false;
    this.isEditManagerMaxExceeded = false;
    this.isEditEmailMaxExceeded = false;

    this.editForm.patchValue({
      classActionProject: record.classActionProject,
      ediscoveryProjectManager: record.ediscoveryProjectManager,
      responsibleLawyerEmail: record.responsibleLawyerEmail
    });

    document.body.classList.add('purge-pause-dialog-open');

    this.dialogRef = this.dialog.open(this.editClassActionDialog, {
      width: '780px',
      maxWidth: '90vw',
      panelClass: 'bmo-edit-dialog-panel',
      backdropClass: 'bmo-dimmed-backdrop',
      hasBackdrop: true,
      autoFocus: false
    });

    this.dialogRef.afterClosed().subscribe(() => {
      document.body.classList.remove('purge-pause-dialog-open');
    });
  }


  //Update onSaveEdit() to validate and persist the edited project name:

  onSaveEdit(): void {
    if (
      this.editForm.invalid ||
      this.isEditClassActionMaxExceeded ||
      this.isEditManagerMaxExceeded ||
      this.isEditEmailMaxExceeded
    ) {
      this.editForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const editValues = this.editForm.getRawValue();

    // Mock record update
    const target = this.MOCK_DATA.find(r => r.id === this.editingRecordId);
    if (target) {
      target.classActionProject = editValues.classActionProject.trim();
      target.ediscoveryProjectManager = editValues.ediscoveryProjectManager.trim();
      target.responsibleLawyerEmail = editValues.responsibleLawyerEmail.trim();
    }

    this.dialogRef?.close();

    this.dialogRef = this.dialog.open(this.editSuccessDialog, {
      width: '460px',
      panelClass: 'bmo-confirmation-dialog'
    });

    this.fetchPurgePauseRecords();
    this.cdr.markForCheck();
  }


  //2. In purge-pause.component.html
// Remove readonly and edit-input-readonly from the first input in 
// #editClassActionDialog, and attach input checking and validation:

<!-- 1. Class Action / Project (Now Fully Editable) -->
        <div class="edit-col">
          <label class="edit-label" for="edit-class-action">Class Action / Project *</label>
          <input
            id="edit-class-action"
            type="text"
            class="edit-input"
            [class.input-error]="(editForm.get('classActionProject')?.invalid && editForm.get('classActionProject')?.touched) || isEditClassActionMaxExceeded"
            formControlName="classActionProject"
            (beforeinput)="onBeforeInputCheck($event, 'edit', 'classActionProject', 100)"
            (input)="onInputChange('edit', 'classActionProject', 100)"
          />
          @if (editForm.get('classActionProject')?.touched && editForm.get('classActionProject')?.hasError('required')) {
            <small class="edit-field-error">Enter Class Action / Project Name</small>
          }
          @if (editForm.get('classActionProject')?.hasError('pattern')) {
            <small class="edit-field-error">Special characters are not allowed</small>
          }
          @if (isEditClassActionMaxExceeded || editForm.get('classActionProject')?.hasError('maxlength')) {
            <small class="edit-field-error">Name exceeds maximum allowed length</small>
          }
        </div>


//3. In purge-pause.component.scss
// Ensure .edit-input applies a standard pointer/text cursor with 
// a clean white background across all three columns:

.edit-input {
  background-color: #ffffff !important;
  border: 1px solid #767676;
  border-radius: 4px;
  height: 38px;
  padding: 6px 12px;
  font-size: 13px;
  color: #1a1a1a;
  box-sizing: border-box;
  width: 100%;
  outline: none;
  cursor: text;

  &:focus {
    border-color: #0079c1;
    box-shadow: 0 0 0 1px #0079c1;
  }

  &.input-error {
    border-color: #a12000 !important;
    box-shadow: 0 0 0 1px #a12000;
  }
}