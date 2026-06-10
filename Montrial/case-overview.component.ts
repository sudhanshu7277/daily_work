private setupPrecedenceListener(): void {
    const firstNameControl = this.customerSearchForm.get('firstName');
    const lastNameControl = this.customerSearchForm.get('lastName');
    const caseIdControl = this.customerSearchForm.get('caseId');

    caseIdControl?.valueChanges.subscribe((value: string) => {
      if (!caseIdControl) return;

      // 1. STRIP ALPHABETS INSTANTLY: Keep only numbers 0-9
      const sanitizedValue = (value || '').replace(/[^0-9]/g, '');

      // 2. Overwrite the input text box quietly if letters were filtered out
      if (value !== sanitizedValue) {
        caseIdControl.setValue(sanitizedValue, { emitEvent: false });
      }

      // 3. PRECEDENCE TOGGLE: Check against the clean, sanitized numeric string
      if (sanitizedValue && sanitizedValue.trim() !== '') {
        // Clear all other optional fields as required by the design spec
        this.customerSearchForm.patchValue({
          firstName: '',
          lastName: '',
          city: '',
          province: '',
          dob: '',
          phone: ''
        }, { emitEvent: false });

        // Switch to Case Search Mode: Remove mandatory requirements from name inputs
        firstNameControl?.setValidators([Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
        lastNameControl?.setValidators([Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
      } else {
        // RESET STATE: If Case Search box is fully cleared, names become mandatory again
        firstNameControl?.setValidators([Validators.required, Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
        lastNameControl?.setValidators([Validators.required, Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
      }

      // 4. Force Angular to recalculate validity and perfectly update [disabled] states
      firstNameControl?.updateValueAndValidity({ emitEvent: false });
      lastNameControl?.updateValueAndValidity({ emitEvent: false });
    });
  }