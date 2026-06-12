private setupPrecedenceListener(): void {
    const firstNameControl = this.customerSearchForm.get('firstName');
    const lastNameControl = this.customerSearchForm.get('lastName');
    const caseIdControl = this.customerSearchForm.get('caseId');

    // Regex pattern allowing letters, French characters, and single internal spaces
    const nameWithSpacesPattern = '^[a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+)*$';

    caseIdControl?.valueChanges.subscribe((value: string) => {
      if (!caseIdControl) return;

      // 1. STRIP ALPHABETS INSTANTLY: Keep only numbers 0-9
      const sanitizedValue = (value || '').replace(/[^0-9]/g, '');

      // 2. Overwrite the input text box quietly if letters were filtered out
      if (value !== sanitizedValue) {
        caseIdControl.setValue(sanitizedValue, { emitEvent: false });
        caseIdControl.markAsDirty();
        caseIdControl.markAsTouched();
        caseIdControl.updateValueAndValidity({ emitEvent: false });
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

        // Switch to Case Search Mode: Names are no longer required but must match regex if typed
        firstNameControl?.setValidators([Validators.pattern(nameWithSpacesPattern)]);
        lastNameControl?.setValidators([Validators.pattern(nameWithSpacesPattern)]);
      } else {
        // RESET STATE: If Case Search box is fully cleared, names become mandatory again
        firstNameControl?.setValidators([Validators.required, Validators.pattern(nameWithSpacesPattern)]);
        lastNameControl?.setValidators([Validators.required, Validators.pattern(nameWithSpacesPattern)]);
      }

      // 4. Force Angular to recalculate validity and perfectly update [disabled] states
      firstNameControl?.updateValueAndValidity({ emitEvent: false });
      lastNameControl?.updateValueAndValidity({ emitEvent: false });
    });
  }