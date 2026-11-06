//1. In search-legal-hold.component.ts
Add these three boolean flags to the class properties:

isHoldNameMaxExceeded = false;
  isEdiscoveryMaxExceeded = false;
  isLawyerEmailMaxExceeded = false;



  //Replace onBeforeInputCheck and add onInputChange:

  onBeforeInputCheck(event: Event, controlName: string, maxLen: number): void {
    const inputEvent = event as InputEvent;

    // 1. If deleting (Backspace / Delete)
    if (inputEvent.inputType === 'deleteContentBackward' || inputEvent.inputType === 'deleteContentForward') {
      const target = inputEvent.target as HTMLInputElement;
      const currentVal = target.value || '';
      const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
      const remainingLength = selectedLength > 0 ? currentVal.length - selectedLength : currentVal.length - 1;

      if (remainingLength < maxLen) {
        if (controlName === 'holdName') this.isHoldNameMaxExceeded = false;
        if (controlName === 'ediscoveryManager') this.isEdiscoveryMaxExceeded = false;
        if (controlName === 'lawyerEmail') this.isLawyerEmailMaxExceeded = false;
        this.cdr.markForCheck();
      }
      return;
    }

    if (!inputEvent.data) {
      return;
    }

    // 2. Prohibited character filtering
    if (controlName === 'holdName') {
      if (/[*,<>]/.test(inputEvent.data)) {
        inputEvent.preventDefault();
        return;
      }
    } else if (controlName === 'ediscoveryManager') {
      if (!/^[a-zA-Z0-9\s.'\-]+$/.test(inputEvent.data)) {
        inputEvent.preventDefault();
        return;
      }
    }

    // 3. Max length limit check
    const target = inputEvent.target as HTMLInputElement;
    const currentVal = target.value || '';
    const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
    const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;

    if (newTotalLength > maxLen) {
      inputEvent.preventDefault();

      if (controlName === 'holdName') this.isHoldNameMaxExceeded = true;
      if (controlName === 'ediscoveryManager') this.isEdiscoveryMaxExceeded = true;
      if (controlName === 'lawyerEmail') this.isLawyerEmailMaxExceeded = true;

      this.cdr.markForCheck();
    }
  }

  onInputChange(controlName: string, maxLen: number): void {
    const ctrl = this.searchForm.get(controlName);
    const val = ctrl?.value || '';

    // Automatically resets the flag if text is cut, pasted over, or deleted below max
    if (val.length < maxLen) {
      if (controlName === 'holdName') this.isHoldNameMaxExceeded = false;
      if (controlName === 'ediscoveryManager') this.isEdiscoveryMaxExceeded = false;
      if (controlName === 'lawyerEmail') this.isLawyerEmailMaxExceeded = false;
      this.cdr.markForCheck();
    }
  }


  //2. In search-legal-hold.component.html
// Update all three inputs and their error display conditions:

// A. Legal Hold Name


<input
  id="legal-hold-name"
  class="hold-name"
  [class.input-error]="(searchForm.get('holdName')?.invalid && searchForm.get('holdName')?.touched) || isHoldNameMaxExceeded"
  formControlName="holdName"
  [placeholder]="searchLegalHoldVerbiage.placeholderEnterHoldName | translate"
  (focus)="onHoldNameFocus(); shareDataInternally()"
  (beforeinput)="onBeforeInputCheck($event, 'holdName', 100)"
  (input)="onInputChange('holdName', 100)"
  [matAutocomplete]="autoHoldName"
  aria-required="true"
/>

@if (isHoldNameMaxExceeded || searchForm.get('holdName')?.hasError('maxlength')) {
  <small class="error-text hold-name-error-text" style="position: static;">
    {{ (searchLegalHoldVerbiage.legalHoldNameError || 'Legal Hold Name exceeds maximum allowed length') | translate }}
  </small>
}

//B. eDiscovery Project Manager

<input
  id="ediscovery-project-manager"
  class="ediscovery-project-manager"
  [class.input-error]="(searchForm.get('ediscoveryManager')?.invalid && searchForm.get('ediscoveryManager')?.touched) || isEdiscoveryMaxExceeded"
  formControlName="ediscoveryManager"
  [placeholder]="searchLegalHoldVerbiage.placeholderEdiscoveryProjectManager | translate"
  (beforeinput)="onBeforeInputCheck($event, 'ediscoveryManager', 50)"
  (input)="onInputChange('ediscoveryManager', 50)"
/>

@if (isEdiscoveryMaxExceeded || searchForm.get('ediscoveryManager')?.hasError('maxlength')) {
  <small class="error-text hold-name-error-text" style="position: static;">
    {{ (searchLegalHoldVerbiage.ediscoveryManagerError || 'eDiscovery Project Manager Name exceeds maximum allowed length') | translate }}
  </small>
}


//C. Responsible Lawyer Email

<input
  id="legal-hold-lawyer-email"
  class="lawyer-email"
  [class.input-error]="(searchForm.get('lawyerEmail')?.invalid && searchForm.get('lawyerEmail')?.touched) || isLawyerEmailMaxExceeded"
  formControlName="lawyerEmail"
  [placeholder]="searchLegalHoldVerbiage.placeholderEmail | translate"
  (beforeinput)="onBeforeInputCheck($event, 'lawyerEmail', 50)"
  (input)="onInputChange('lawyerEmail', 50)"
/>

<div class="email-error-message-wrapper">
  @if (searchForm.get('lawyerEmail')?.touched && searchForm.get('lawyerEmail')?.hasError('email')) {
    <span id="legal-hold-lawyer-email-error" class="email-error-message">
      Enter a valid email address
    </span>
  }
  @if (isLawyerEmailMaxExceeded || searchForm.get('lawyerEmail')?.hasError('maxlength')) {
    <small class="error-text hold-name-error-text" style="position: static;">
      {{ (searchLegalHoldVerbiage.lawyerEmailError || 'Responsible Lawyer Email exceeds maximum allowed length') | translate }}
    </small>
  }
</div>