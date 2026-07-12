ngOnInit(): void {
    this.searchForm = this.fb.group({
      customerType: ['Individual'],
      lastName: ['', [Validators.required, Validators.maxLength(30)]],
      middleName: ['', [Validators.maxLength(30)]],
      firstName: ['', [Validators.required, Validators.maxLength(30)]],
      country: ['Canada'],
      streetName: ['', [Validators.maxLength(40)]],
      streetNumber: ['', [Validators.maxLength(40)]],
      unitNumber: ['', [Validators.maxLength(40)]],
      province: [''],
      city: ['', [Validators.maxLength(40)]],
      postalCode: [''],
      dateOfBirth: [''],
      entityTradeName: ['', [Validators.maxLength(30)]],
      phoneNumber: ['', [Validators.pattern("^(((\\+91-)?)|0)?[0-9]{10}$")]],
      emailAddress: ['', [Validators.email]],
      lawyerEmail: ['', [Validators.email]],
      manager: ['']
    });

    // 🟢 FIXED: Removed the broken .pipe() typo 
    this.searchForm.get('customerType')?.valueChanges.subscribe((value: string) => {
      // 1. Run your existing custom dynamic validation swapping logic
      this.updateValidators(value);

      // 2. Clear out all advanced search input choices across layout toggles
      this.searchForm.patchValue({
        streetName: '',
        streetNumber: '',
        unitNumber: '',
        city: '',
        postalCode: '',
        dateOfBirth: '',
        phoneNumber: '',
        emailAddress: '',
        lawyerEmail: '',
        manager: '',
        country: 'Canada', // Reset back to default template selection state
        province: ''
      }, { emitEvent: false }); // Quietly update values without circular loops

      // 3. Reset type-specific fields so old data won't persist into the payload
      if (value === 'entity') {
        this.searchForm.get('lastName')?.reset('', { emitEvent: false });
        this.searchForm.get('middleName')?.reset('', { emitEvent: false });
        this.searchForm.get('firstName')?.reset('', { emitEvent: false });
      } else {
        this.searchForm.get('entityTradeName')?.reset('', { emitEvent: false });
      }
    });

    this.countriesList = this.countryProvinceService.getCountriesListUtility();
    this.canadianProvinceList = this.countryProvinceService.canadianProvinceListUtility();
    this.usaStatesList = this.countryProvinceService.usaStatesListUtility();
  }

  ///// on clear

  onClear(): void {
    // 1. Capture the currently selected tab type ('Individual' or 'entity')
    const currentCustomerType = this.searchForm.get('customerType')?.value || 'Individual';

    // 2. Pass the captured tab selection dynamically into the form reset layout
    this.searchForm.reset({ 
      customerType: currentCustomerType, 
      country: 'Canada' 
    });

    // 3. Keep your existing supporting state resets completely unchanged
    this.formattedDateDisplay = '';
    this.isDatePickerActive = false;
    this.searchTriggered.emit('');
  }