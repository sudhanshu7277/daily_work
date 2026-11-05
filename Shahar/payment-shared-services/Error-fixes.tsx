//Update filterHoldNameCharacters to enforce the 100-character max length error:
//Just like in search-legal-hold.component.ts, set the maxlength error on the form control when the length exceeds 100 characters:

filterHoldNameCharacters(event: Event): void {
  const inputEvent = event as InputEvent;
  if (!inputEvent.data) {
    if (this.holdNameControl?.hasError('maxlength')) {
      const { maxlength, ...rest } = this.holdNameControl.errors || {};
      this.holdNameControl.setErrors(Object.keys(rest).length ? rest : null);
      this.cdr.markForCheck();
    }
    return;
  }

  // Disallow *, ,, <, and >
  if (/[*,<>]/.test(inputEvent.data)) {
    inputEvent.preventDefault();
    return;
  }

  // Max length error handling
  const target = inputEvent.target as HTMLInputElement;
  const currentVal = target.value || '';
  const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
  const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;

  if (newTotalLength > 100) {
    inputEvent.preventDefault();
    this.holdNameControl?.setErrors({ ...(this.holdNameControl.errors || {}), maxlength: true });
    this.holdNameControl?.markAsDirty();
    this.holdNameControl?.markAsTouched();
    this.cdr.markForCheck();
  }
}


//Step 2: Update selection-panel.component.html
// In selection-panel.component.html (lines 146–161 in image 32):

<input
  id="apply-hold-name"
  type="text"
  formControlName="holdName"
  placeholder="Name"
  (input)="onHoldNameChanged()"
  (beforeinput)="filterHoldNameCharacters($event)"
  [attr.aria-invalid]="showControlError(holdNameControl)"
  [attr.aria-describedby]="showControlError(holdNameControl) && holdNameControl.hasError('required') ? 'apply-hold-name-error' : null"
  aria-required="true"
/>

@if (showControlError(holdNameControl) && holdNameControl.hasError('required')) {
  <div id="apply-hold-name-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Enter Legal Hold Name</span>
  </div>
}

@if (showControlError(holdNameControl) && holdNameControl.hasError('pattern')) {
  <div id="apply-hold-name-pattern-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Special characters are not allowed</span>
  </div>
}

@if (showControlError(holdNameControl) && holdNameControl.hasError('maxlength')) {
  <div id="apply-hold-name-maxlength-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Legal Hold Name exceeds maximum allowed length</span>
  </div>
}

