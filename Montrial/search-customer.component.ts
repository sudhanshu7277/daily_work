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


  // phone number entry

  // 🟢 Update line 145 to use this precise pattern:
phoneNumber: ['', [Validators.pattern("^\\+?[1-9]\\d{10,12}$")]],

//

<div class="form-field-group">
  <label>{{searchCustomerVerbiage.phone | translate}}</label>
  <input 
    class="advanced-inputs" 
    type="text" 
    formControlName="phoneNumber" 
    placeholder="+14165551234"
    maxlength="14"
    (keydown)="filterPhoneCharacters($event)" 🟢 <!-- Added hardware interceptor -->
  />
</div>

// 

filterPhoneCharacters(event: KeyboardEvent): void {
    // 1. Allow functional navigation and modification keys
    const functionalKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (functionalKeys.includes(event.key)) {
      return;
    }

    // 2. Allow numbers (0-9) and the plus sign (+)
    const allowedPhoneRegex = /^[0-9+]$/;

    // 3. Prevent anything else from rendering in the field
    if (!allowedPhoneRegex.test(event.key)) {
      event.preventDefault();
    }
  }


  // updateValidators function


  private updateValidators(type: string): void {
    const last = this.searchForm.get('lastName');
    const first = this.searchForm.get('firstName');
    const middle = this.searchForm.get('middleName');
    const streetName = this.searchForm.get('streetName');
    const streetNumber = this.searchForm.get('streetNumber');
    const unitNumber = this.searchForm.get('unitNumber');
    const city = this.searchForm.get('city');
    const entity = this.searchForm.get('entityTradeName');
    const dob = this.searchForm.get('dateOfBirth');
    const postalCode = this.searchForm.get('postalCode');
    
    // 1. Grab references for our optional formatted fields
    const phone = this.searchForm.get('phoneNumber');
    const email = this.searchForm.get('emailAddress');

    if (type === 'Individual') {
      console.log('checking if we are landing in this block ....');
      last?.setValidators([Validators.required, Validators.maxLength(30)]);
      first?.setValidators([Validators.required, Validators.maxLength(30)]);
      middle?.setValidators([Validators.maxLength(30)]);
      streetName?.setValidators([Validators.maxLength(40)]);
      streetNumber?.setValidators([Validators.maxLength(40)]);
      unitNumber?.setValidators([Validators.maxLength(40)]);
      city?.setValidators([Validators.maxLength(40)]);
      postalCode?.setValidators([Validators.maxLength(7)]);
      
      entity?.clearValidators();

      // 2. Set format-only rules for optional fields (No Validators.required)
      phone?.setValidators([Validators.pattern("^\\+?[1-9]\\d{10,12}$")]);
      email?.setValidators([Validators.email]);

    } else if (type === 'entity') {
      // Note: your existing code has a patchValue loop here, keep it intact
      last?.clearValidators();
      first?.clearValidators();
      middle?.clearValidators();
      streetName?.setValidators([Validators.maxLength(40)]);
      streetNumber?.setValidators([Validators.maxLength(40)]);
      unitNumber?.setValidators([Validators.maxLength(40)]);
      city?.setValidators([Validators.maxLength(40)]);
      postalCode?.setValidators([Validators.maxLength(7)]);
      
      entity?.setValidators([Validators.required, Validators.maxLength(30)]);

      // 3. Keep format rules active for optional fields in entity mode too
      phone?.setValidators([Validators.pattern("^\\+?[1-9]\\d{10,12}$")]);
      email?.setValidators([Validators.email]);
    }

    // 4. Update validity loops at the bottom
    [
      last, first, middle, streetName, streetNumber, 
      unitNumber, city, entity, dob, postalCode, phone, email
    ].forEach(control => control?.updateValueAndValidity());
  }


  // html below

  <div class="form-field-group">
  <label>{{searchCustomerVerbiage.email | translate}}</label>
  <input 
    class="advanced-inputs" 
    type="email" 
    formControlName="emailAddress" 
    placeholder="example@123mail.com"
    [class.input-error]="searchForm.get('emailAddress')?.hasError('email') && searchForm.get('emailAddress')?.touched"
  />
  
  <!-- 🟢 Format Error Message block -->
  @if (searchForm.get('emailAddress')?.hasError('email') && searchForm.get('emailAddress')?.touched) {
    <small class="error-text">
      <!-- You can use your direct string or bind it to your translation file structure -->
      {{ 'Enter a valid email address' }}
    </small>
  }
</div>


//Step 1: Update the Forms Group & updateValidators (TypeScript)
//We will use the regex pattern ^[a-zA-Z\s\-'\p{L}]+$ (or a simpler standard character pattern /^([^0-9]*)$/ which explicitly catches and invalidates any digit strings).
//  Let's use an explicit non-digit validation rule.

// 1. Update the initial configuration in ngOnInit():

this.searchForm = this.fb.group({
    customerType: ['Individual'],
    lastName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^([^0-9]*)$/)]], 🟢
    middleName: ['', [Validators.maxLength(30)]],
    firstName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^([^0-9]*)$/)]], 🟢
    // ... rest of your form fields stay exactly the same


    // 2. Update the dynamic rules inside your updateValidators() method:
//Make sure that when switching back and forth between "Individual" and "Entity", 
// the pattern validation stays appended when rebuilding validators:

if (type === 'Individual') {
    console.log('checking if we are landing in this block ....');
    last?.setValidators([Validators.required, Validators.maxLength(30), Validators.pattern(/^([^0-9]*)$/)]); 🟢
    first?.setValidators([Validators.required, Validators.maxLength(30), Validators.pattern(/^([^0-9]*)$/)]); 🟢
    // ... rest of the individual block configuration
}


// Step 2: Add the Visual Error Elements to the Layout (HTML)
//Now, let's update your template layout structure to display the exact error 
// text matching your configuration. Locate the lastName and firstName fields 
// inside search-customer.component.html:

// For lastName (Around lines 14–20):

<div class="form-field-group">
  <label class="input-label">
    {{searchCustomerVerbiage.lastName | translate}} <span class="required-star">*</span>
  </label>
  <input class="last-name"
         [class.input-error]="searchForm.get('lastName')?.invalid && searchForm.get('lastName')?.touched"
         type="text"
         formControlName="lastName"
         [placeholder]="searchCustomerVerbiage.lastNamePlaceholder | translate" />
  
  <!-- Maxlength Error -->
  @if (searchForm.get('lastName')?.hasError('maxlength')) {
    <small class="error-text">{{searchCustomerVerbiage.lastNameError | translate}}</small>
  }
  
  <!-- 🟢 Digit/Number Error Message Block -->
  @if (searchForm.get('lastName')?.hasError('pattern') && searchForm.get('lastName')?.touched) {
    <small class="error-text">Invalid characters entered in First/Last Name.</small>
  }
</div>

/// For firstName:
//Apply the exact same conditional block directly beneath your first 
// name template element:

<div class="form-field-group">
  <!-- Your first name layout elements -->
  <input class="first-name"
         [class.input-error]="searchForm.get('firstName')?.invalid && searchForm.get('firstName')?.touched"
         type="text"
         formControlName="firstName" />

  <!-- 🟢 Digit/Number Error Message Block -->
  @if (searchForm.get('firstName')?.hasError('pattern') && searchForm.get('firstName')?.touched) {
    <small class="error-text">Invalid characters entered in First/Last Name.</small>
  }
</div>

// fixing first name and last name error handling

<!-- Maxlength Error takes high priority -->
  @if (searchForm.get('lastName')?.hasError('maxlength')) {
    <small class="error-text">{{searchCustomerVerbiage.lastNameError | translate}}</small>
  }
  <!-- Only check pattern violation if length is valid -->
  @else if (searchForm.get('lastName')?.hasError('pattern') && searchForm.get('lastName')?.touched) {
    <small class="error-text">Invalid characters entered in First/Last Name.</small>
  }

  // first name

  <!-- Maxlength Error takes high priority -->
  @if (searchForm.get('firstName')?.hasError('maxlength')) {
    <small class="error-text">{{searchCustomerVerbiage.firstNameError | translate}}</small>
  }
  <!-- Only check pattern violation if length is valid -->
  @else if (searchForm.get('firstName')?.hasError('pattern') && searchForm.get('firstName')?.touched) {
    <small class="error-text">Invalid characters entered in First/Last Name.</small>
  }


