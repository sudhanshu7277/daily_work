//In search-legal-hold.component.ts, update lines 131 and 133 inside this.searchForm = this.fb.group({ ... }) to include Validators.maxLength(50):   

lawyerEmail: ['', [Validators.email, Validators.maxLength(50)]],
    // ediscoveryManager: [''],
    ediscoveryManager: ['', [Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/), Validators.maxLength(50)]],


    //1. In search-legal-hold.component.tsUpdate onBeforeInputCheck to handle character filtering for ediscoveryManager and enforce the 50-character limit for both ediscoveryManager and lawyerEmail:   

    onBeforeInputCheck(event: Event, controlName: string, maxLen: number): void {
      const inputEvent = event as InputEvent;
      if (!inputEvent.data) {
        const ctrl = this.searchForm.get(controlName);
        if (ctrl?.hasError('maxlength')) {
          const { maxlength, ...rest } = ctrl.errors || {};
          ctrl.setErrors(Object.keys(rest).length ? rest : null);
          this.cdr.markForCheck();
        }
        return;
      }
  
      // Character validation
      if (controlName === 'holdName') {
        if (/[*,<>]/.test(inputEvent.data)) {
          inputEvent.preventDefault();
          return;
        }
      } else if (controlName === 'ediscoveryManager') {
        // Disallow special characters for eDiscovery Manager
        if (!/^[a-zA-Z0-9\s.'\-]+$/.test(inputEvent.data)) {
          inputEvent.preventDefault();
          return;
        }
      }
  
      // Max length enforcement
      const target = inputEvent.target as HTMLInputElement;
      const currentVal = target.value || '';
      const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
      const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;
  
      if (newTotalLength > maxLen) {
        inputEvent.preventDefault();
        const ctrl = this.searchForm.get(controlName);
        ctrl?.setErrors({ ...(ctrl.errors || {}), maxlength: true });
        ctrl?.markAsDirty();
        ctrl?.markAsTouched();
        this.cdr.markForCheck();
      }
    }


    //2. In search-legal-hold.component.html
// A. For ediscoveryManager (lines 44–58 in image 50)

<input
  id="ediscovery-project-manager"
  class="ediscovery-project-manager"
  [class.input-error]="searchForm.get('ediscoveryManager')?.invalid && searchForm.get('ediscoveryManager')?.touched"
  formControlName="ediscoveryManager"
  [placeholder]="searchLegalHoldVerbiage.placeholderEdiscoveryProjectManager | translate"
  (beforeinput)="onBeforeInputCheck($event, 'ediscoveryManager', 50)"
/>

@if (searchForm.get('ediscoveryManager')?.hasError('maxlength')) {
  <small class="error-text hold-name-error-text" style="position: static;">
    {{ (searchLegalHoldVerbiage.ediscoveryManagerError || 'eDiscovery Project Manager Name exceeds maximum allowed length') | translate }}
  </small>
}


//B. For lawyerEmail (lines 60–78 in image 50)Add (beforeinput)="onBeforeInputCheck($event, 'lawyerEmail', 50)" to <input id="legal-hold-lawyer-email"> and add the maxlength error message inside .email-error-message-wrapper:   


<input
  id="legal-hold-lawyer-email"
  class="lawyer-email"
  [class.input-error]="searchForm.get('lawyerEmail')?.invalid && searchForm.get('lawyerEmail')?.touched"
  formControlName="lawyerEmail"
  [placeholder]="searchLegalHoldVerbiage.placeholderEmail | translate"
  (beforeinput)="onBeforeInputCheck($event, 'lawyerEmail', 50)"
/>

<div class="email-error-message-wrapper">
  @if (searchForm.get('lawyerEmail')?.touched && searchForm.get('lawyerEmail')?.hasError('email')) {
    <span id="legal-hold-lawyer-email-error" class="email-error-message">
      Enter a valid email address
    </span>
  }
  @if (searchForm.get('lawyerEmail')?.hasError('maxlength')) {
    <small class="error-text hold-name-error-text" style="position: static;">
      {{ (searchLegalHoldVerbiage.lawyerEmailError || 'Responsible Lawyer Email exceeds maximum allowed length') | translate }}
    </small>
  }
</div>