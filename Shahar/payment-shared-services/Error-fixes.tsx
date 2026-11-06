// 1. In search-legal-hold.component.ts
// Replace onBeforeInputCheck with this corrected logic:

onBeforeInputCheck(event: Event, controlName: string, maxLen: number): void {
  const inputEvent = event as InputEvent;
  const ctrl = this.searchForm.get(controlName);

  // 1. If it's a deletion (Backspace / Delete)
  if (inputEvent.inputType === 'deleteContentBackward' || inputEvent.inputType === 'deleteContentForward') {
    const target = inputEvent.target as HTMLInputElement;
    const currentVal = target.value || '';
    const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
    
    // Calculate remaining length after this deletion
    const remainingLength = selectedLength > 0 ? currentVal.length - selectedLength : currentVal.length - 1;

    // Only clear maxlength error if the value is truly within the valid limit
    if (remainingLength <= maxLen && ctrl?.hasError('maxlength')) {
      const { maxlength, ...rest } = ctrl.errors || {};
      ctrl.setErrors(Object.keys(rest).length ? rest : null);
      this.cdr.markForCheck();
    }
    return;
  }

  if (!inputEvent.data) {
    return;
  }

  // 2. Character filtering
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

  // 3. Max length check
  const target = inputEvent.target as HTMLInputElement;
  const currentVal = target.value || '';
  const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
  const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;

  if (newTotalLength > maxLen) {
    inputEvent.preventDefault();
    // Block the extra characters, but flag that the user tried to exceed max length
    ctrl?.setErrors({ ...(ctrl.errors || {}), maxlength: { requiredLength: maxLen, actualLength: newTotalLength } });
    ctrl?.markAsDirty();
    ctrl?.markAsTouched();
    this.cdr.markForCheck();
  } else if (ctrl?.hasError('maxlength')) {
    // If typing inside a selection and the new total fits, clear the error
    const { maxlength, ...rest } = ctrl.errors || {};
    ctrl.setErrors(Object.keys(rest).length ? rest : null);
    this.cdr.markForCheck();
  }
}



//2. Retain Error State on Blur/Focus
// When the user clicks out and clicks back in, Angular's default form validation runs whenever the control updates. To ensure Angular doesn't clear the maxlength error if the input is at max capacity and the user hit the ceiling, check the value length in (input) or on change detection.

// Add an (input) handler to keep form status synchronized:


onInputChange(controlName: string, maxLen: number): void {
  const ctrl = this.searchForm.get(controlName);
  const val = ctrl?.value || '';

  // If user edited/deleted below the limit, clear the manual maxlength error
  if (val.length < maxLen && ctrl?.hasError('maxlength')) {
    const { maxlength, ...rest } = ctrl.errors || {};
    ctrl.setErrors(Object.keys(rest).length ? rest : null);
    this.cdr.markForCheck();
  }
}


//In search-legal-hold.component.html:


<!-- Legal Hold Name -->
<input
  ...
  (beforeinput)="onBeforeInputCheck($event, 'holdName', 100)"
  (input)="onInputChange('holdName', 100)"
/>

<!-- eDiscovery Project Manager -->
<input
  ...
  (beforeinput)="onBeforeInputCheck($event, 'ediscoveryManager', 50)"
  (input)="onInputChange('ediscoveryManager', 50)"
/>

<!-- Lawyer Email -->
<input
  ...
  (beforeinput)="onBeforeInputCheck($event, 'lawyerEmail', 50)"
  (input)="onInputChange('lawyerEmail', 50)"
/>


