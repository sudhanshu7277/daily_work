private setupPrecedenceListener(): void {
    const firstNameControl = this.customerSearchForm.get('firstName');
    const lastNameControl = this.customerSearchForm.get('lastName');
    const caseIdControl = this.customerSearchForm.get('caseId');

    caseIdControl?.valueChanges.subscribe((value: string) => {
      if (!caseIdControl) return;

      // 1. Strip any character that isn't a number (0-9) immediately
      const sanitizedValue = (value || '').replace(/[^0-9]/g, '');

      // 2. If letters were entered, overwrite the text box cleanly
      if (value !== sanitizedValue) {
        caseIdControl.setValue(sanitizedValue, { emitEvent: false });
        
        // 🟢 DEPLOYMENT FIX: Force custom fdc-input component to repaint its UI on DEV
        caseIdControl.markAsDirty();
        caseIdControl.markAsTouched();
        caseIdControl.updateValueAndValidity({ emitEvent: false });
      }

      // 3. SWITCH MODE: If a valid number exists, drop name requirements
      if (sanitizedValue && sanitizedValue.trim() !== '') {
        // Clear out other fields as per requirements
        this.customerSearchForm.patchValue({
          firstName: '',
          lastName: '',
          city: '',
          province: '',
          dob: '',
          phone: ''
        }, { emitEvent: false });

        // MODE: CASE SEARCH - Names are no longer required
        firstNameControl?.setValidators([Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
        lastNameControl?.setValidators([Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
      } else {
        // MODE: NAME SEARCH - Restore mandatory requirements because Case Search is empty
        firstNameControl?.setValidators([Validators.required, Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
        lastNameControl?.setValidators([Validators.required, Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
      }

      // 4. Recalculate status so the template [disabled] state updates perfectly
      firstNameControl?.updateValueAndValidity({ emitEvent: false });
      lastNameControl?.updateValueAndValidity({ emitEvent: false });
    });
  }