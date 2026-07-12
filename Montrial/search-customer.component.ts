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

    // 🟢 UPDATED: Integrated reset logic cleanly inside your existing subscription
    this.searchForm.get('customerType')?.valueChanges.subscribe((value: string) => {
      // 1. Run your existing custom dynamic validation swapping logic
      this.updateValidators(value);

      // 2. Clear out all advanced search input choices across layout toggles
      this.searchForm.pipe(
        // Use a quiet patch value to prevent infinite event circular loops
      ).patchValue({
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
      }, { emitEvent: false });

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