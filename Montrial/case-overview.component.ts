this.customerSearchForm = this.fb.group({
    firstName: [
      '',
      [
        Validators.required,
        Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH),
      ],
    ],
    lastName: [
      '',
      [
        Validators.required,
        Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH),
      ],
    ],
    city: ['', Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)],
    province: [''],
    dob: [''],
    phone: ['', ValidatorUtils.phoneValidator],
    caseId: ['', [Validators.pattern('^[0-9]*$')]], // 🟢 FIXED: Removed the broken bracket typos
  });


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
        caseIdControl.markAsDirty();
        caseIdControl.markAsTouched();
        caseIdControl.updateValueAndValidity({ emitEvent: false });
      }

      // 3. SWITCH SEARCH MODE
      if (sanitizedValue && sanitizedValue.trim() !== '') {
        // Clear name fields out as per requirements
        this.customerSearchForm.patchValue({
          firstName: '',
          lastName: '',
          city: '',
          province: '',
          dob: '',
          phone: ''
        }, { emitEvent: false });

        // MODE: CASE SEARCH - Drop mandatory name flags
        firstNameControl?.setValidators([Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
        lastNameControl?.setValidators([Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
      } else {
        // MODE: NAME SEARCH - Restore original required rules
        firstNameControl?.setValidators([Validators.required, Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
        lastNameControl?.setValidators([Validators.required, Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]);
      }

      // 4. Force status updates so the Search button enables/disables flawlessly
      firstNameControl?.updateValueAndValidity({ emitEvent: false });
      lastNameControl?.updateValueAndValidity({ emitEvent: false });
    });
  }