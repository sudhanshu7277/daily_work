// CASE ID ISOLATED SUBMISSION WATCHER
this.customerSearchForm.get('caseId')?.valueChanges.subscribe((value: string) => {
  const control = this.customerSearchForm.get('caseId');
  if (!control) return;

  if (value) {
    // Test if the string contains any non-numeric characters (letters, spaces, symbols)
    const containsIllegalChars = /[^0-9]/.test(value);

    if (containsIllegalChars) {
      // Force an invalid state to lock down the search button immediately
      control.setErrors({ pattern: true });
    } else {
      // If the entry contains only pure numbers, clear errors to unlock the button
      control.setErrors(null);
    }
  } else {
    // Clean baseline state when the input is completely empty
    control.setErrors(null);
  }
});