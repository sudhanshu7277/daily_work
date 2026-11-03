//1. In selection-panel.component.tsA. Update the pattern validator for holdName (line 130):Replace the current pattern on line 130 (/^[a-zA-Z0-9 ]*$/) with a pattern that allows anything except *, ,, <, and >:   

this.applyForm = this.formBuilder.group({
  holdName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^*,<>]*$/)]],
  managerName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
  lawyerEmail: ['', [Validators.required, Validators.email]]
});


//B. Add an input filtering handler to block those characters on typing/pasting:
// Add this method to SelectionPanelComponent:

filterHoldNameCharacters(event: Event): void {
  const inputEvent = event as InputEvent;
  if (!inputEvent.data) {
    return;
  }

  // Disallow *, ,, <, and >
  if (/[*,<>]/.test(inputEvent.data)) {
    inputEvent.preventDefault();
  }
}


//2. In selection-panel.component.html
// Find the input for holdName (around lines 145–155, right above managerName) and add (beforeinput):

(beforeinput)="filterHoldNameCharacters($event)"



//1. In search-legal-hold.component.ts
//A. Update HOLD_NAME_PATTERN on line 41:
//Change line 41 from /^[a-zA-Z0-9\s]*$/ to /^[^*,<>]*$/:

// search-legal-hold.component.ts (around line 40-41)
  /** Allows all characters except *, ,, <, and > */
  private static readonly HOLD_NAME_PATTERN = /^[^*,<>]*$/;


  //B. Add character filtering in onBeforeInputCheck (or update it if already present):
// In image_27.png line 20, the input calls (beforeinput)="onBeforeInputCheck($event, 
// 'holdName', 100)". Update onBeforeInputCheck in search-legal-hold.component.ts to
//  block those 4 characters before entry:

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

  // --- ADD THIS BLOCK ---
  if (controlName === 'holdName') {
    if (/[*,<>]/.test(inputEvent.data)) {
      inputEvent.preventDefault();
      return;
    }
  }
  // -----------------------

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