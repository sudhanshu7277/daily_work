// Replace lines 106–121 in customer-search-form.component.ts with this drop-in block:

this.customerSearchForm.get('caseId')?.valueChanges.subscribe((value: string) => {
    const control = this.this.customerSearchForm.get('caseId');
    if (!control || !value) return;

    // 1. Instantly strip any character that is NOT a number
    const sanitizedValue = value.replace(/[^0-9]/g, '');

    // 2. If alphabets were detected and stripped, update the input value box quietly
    if (value !== sanitizedValue) {
      control.setValue(sanitizedValue, { emitEvent: false });
    }

    // 3. Keep form validation clean
    if (sanitizedValue === '') {
      control.setErrors(null);
    }
  });