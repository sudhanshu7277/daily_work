//1. In selection-panel.component.tsA. Update Form Initialization 
// (lines 133–137):Add Validators.maxLength(50) to both managerName and lawyerEmail:  


this.applyForm = this.formBuilder.group({
  holdName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[^*,<>]*$/)]],
  managerName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
  lawyerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(50)]]
});


//B. Align Flag Names in Methods:Use the exact property names declared on lines 120–122 (isHoldNameMaxExceeded, isEdiscoveryMaxExceeded, isLawyerEmailMaxExceeded):   

onBeforeInputCheck(event: Event, controlName: string, maxLen: number): void {
  const inputEvent = event as InputEvent;

  // 1. Backspace / Delete handling
  if (inputEvent.inputType === 'deleteContentBackward' || inputEvent.inputType === 'deleteContentForward') {
    const target = inputEvent.target as HTMLInputElement;
    const currentVal = target.value || '';
    const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
    const remainingLength = selectedLength > 0 ? currentVal.length - selectedLength : currentVal.length - 1;

    if (remainingLength < maxLen) {
      if (controlName === 'holdName') this.isHoldNameMaxExceeded = false;
      if (controlName === 'managerName') this.isEdiscoveryMaxExceeded = false;
      if (controlName === 'lawyerEmail') this.isLawyerEmailMaxExceeded = false;
      this.cdr.markForCheck();
    }
    return;
  }

  if (!inputEvent.data) {
    return;
  }

  // 2. Character filters
  if (controlName === 'holdName') {
    if (/[*,<>]/.test(inputEvent.data)) {
      inputEvent.preventDefault();
      return;
    }
  } else if (controlName === 'managerName') {
    if (!/^[a-zA-Z0-9\s.'\-]+$/.test(inputEvent.data)) {
      inputEvent.preventDefault();
      return;
    }
  }

  // 3. Max length enforcement
  const target = inputEvent.target as HTMLInputElement;
  const currentVal = target.value || '';
  const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
  const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;

  if (newTotalLength > maxLen) {
    inputEvent.preventDefault();

    if (controlName === 'holdName') this.isHoldNameMaxExceeded = true;
    if (controlName === 'managerName') this.isEdiscoveryMaxExceeded = true;
    if (controlName === 'lawyerEmail') this.isLawyerEmailMaxExceeded = true;

    this.cdr.markForCheck();
  }
}

onInputChange(controlName: string, maxLen: number): void {
  const ctrl = this.applyForm.get(controlName);
  const val = ctrl?.value || '';

  if (val.length < maxLen) {
    if (controlName === 'holdName') this.isHoldNameMaxExceeded = false;
    if (controlName === 'managerName') this.isEdiscoveryMaxExceeded = false;
    if (controlName === 'lawyerEmail') this.isLawyerEmailMaxExceeded = false;
    this.cdr.markForCheck();
  }
}


//2. In selection-panel.component.html
//Ensure the template conditions check these exact flag names:

//A. Legal Hold Name
// Remove maxlength="100" from <input id="apply-hold-name"> 
// so onBeforeInputCheck can catch the limit:


<input
  id="apply-hold-name"
  type="text"
  formControlName="holdName"
  placeholder="Name"
  (focus)="onHoldNameFocus()"
  (input)="onHoldNameChanged(); onInputChange('holdName', 100)"
  (beforeinput)="onBeforeInputCheck($event, 'holdName', 100)"
  [attr.aria-invalid]="showControlError(holdNameControl) || isHoldNameMaxExceeded"
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

@if (isHoldNameMaxExceeded || (showControlError(holdNameControl) && holdNameControl.hasError('maxlength'))) {
  <div id="apply-hold-name-maxlength-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Legal Hold Name exceeds maximum allowed length</span>
  </div>
}


//B. eDiscovery Project Manager

<input
  id="apply-manager-name"
  type="text"
  formControlName="managerName"
  placeholder="Name"
  aria-required="true"
  [attr.aria-invalid]="showControlError(managerNameControl) || isEdiscoveryMaxExceeded"
  [attr.aria-describedby]="showControlError(managerNameControl) && managerNameControl.hasError('required') ? 'apply-manager-name-error' : null"
  (beforeinput)="onBeforeInputCheck($event, 'managerName', 50)"
  (input)="onInputChange('managerName', 50)"
/>

@if (showControlError(managerNameControl) && managerNameControl.hasError('required')) {
  <div id="apply-manager-name-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Enter eDiscovery Project Manager Name</span>
  </div>
}

@if (showControlError(managerNameControl) && managerNameControl.hasError('pattern')) {
  <div id="apply-manager-name-pattern-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Special characters are not allowed</span>
  </div>
}

@if (isEdiscoveryMaxExceeded || (showControlError(managerNameControl) && managerNameControl.hasError('maxlength'))) {
  <div id="apply-manager-name-maxlength-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>eDiscovery Project Manager Name exceeds maximum allowed length</span>
  </div>
}


//C. Responsible Lawyer Email

<input
  id="apply-lawyer-email"
  type="email"
  formControlName="lawyerEmail"
  placeholder="example@bmo.com"
  aria-required="true"
  [attr.aria-invalid]="showControlError(lawyerEmailControl) || showEmailValidationErrors() || isLawyerEmailMaxExceeded"
  [attr.aria-describedby]="showControlError(lawyerEmailControl) && lawyerEmailControl.hasError('required') ? 'apply-lawyer-email-error' : null"
  (beforeinput)="onBeforeInputCheck($event, 'lawyerEmail', 50)"
  (input)="onInputChange('lawyerEmail', 50)"
/>

@if (showControlError(lawyerEmailControl) && lawyerEmailControl.hasError('required')) {
  <div id="apply-lawyer-email-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Enter Responsible Lawyer Email</span>
  </div>
}

@if (showControlError(lawyerEmailControl) && !lawyerEmailControl.hasError('required') && (lawyerEmailControl.hasError('email') || showEmailValidationErrors())) {
  <div id="apply-lawyer-email-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>{{ selectionPanelVerbiage.enter_valid_email_address | translate }}</span>
  </div>
}

@if (isLawyerEmailMaxExceeded || (showControlError(lawyerEmailControl) && lawyerEmailControl.hasError('maxlength'))) {
  <div id="apply-lawyer-email-maxlength-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Responsible Lawyer Email exceeds maximum allowed length</span>
  </div>
}



//works in selection-panel:   In selection-panel.component.html (line 255 of image_35.png), the Apply button uses [disabled]="dataLoading" (only disabled during an active network request) and calls submitApply(confirmTemplate: successModal).   In selection-panel.component.ts (lines 359–365 of image_34.png):

this.submitted = true;
    this.applyForm.markAllAsTouched();
    this.validateDuplicateHoldName();

    if (this.isApplyDisabled) {
      return;
    }


//Step 1: In selection-panel.component.ts
//Find where isApplyDisabled is defined (search for get isApplyDisabled() in selection-panel.component.ts).

//Update it to include the 3 max length flags:

get isApplyDisabled(): boolean {
  return (
    this.applyForm.invalid ||
    this.isHoldNameMaxExceeded ||
    this.isEdiscoveryMaxExceeded ||
    this.isLawyerEmailMaxExceeded
    // Keep any existing condition that was already here (such as duplicate checks or selection checks)
  );
}

//If isApplyDisabled is a regular method or property rather than a getter, guard submitApply() directly:

submitApply(confirmTemplate: TemplateRef<any>): void {
  if (this.dataLoading) {
    return;
  }

  this.submitted = true;
  this.applyForm.markAllAsTouched();
  this.validateDuplicateHoldName();

  if (
    this.isApplyDisabled ||
    this.applyForm.invalid ||
    this.isHoldNameMaxExceeded ||
    this.isEdiscoveryMaxExceeded ||
    this.isLawyerEmailMaxExceeded
  ) {
    return;
  }

  this.dataLoading = true;
  // ... payload and API call continue


  //Step 2: Keep the Apply button enabled in selection-panel.component.htmlIn selection-panel.component.html (lines 252–259 of image_35.png), keep the existing binding untouched so it is never disabled for validation:   


  <button
  mat-flat-button
  class="apply-pill"
  [disabled]="dataLoading"
  [attr.aria-busy]="dataLoading"
  (click)="submitApply(confirmTemplate: successModal)"
>
  {{ 'APPLY' }}
</button>

