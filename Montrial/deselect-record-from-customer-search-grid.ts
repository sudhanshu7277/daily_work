// Looking at the screenshot — the parent has onRemove(profile: any, index: number) and selectedProfiles array. The deleted profile object is available so we match on ocifId.
//Here are the exact changes, file by file:

// Parent component TS — 3 additions:
// 1. Add deletedOcifId property:

deletedOcifId: string | null = null;

// 2. Update onRemove — add two lines after deleteByIndex:

onRemove(profile: any, index: number): void {
    console.log('Removing item at index:', index);
  
    if (index !== undefined && index > -1) {
      this.deleteByIndex(this.selectedProfiles, index);
  
      // ← ADD THESE TWO LINES
      this.deletedOcifId = profile.ocifId;
      setTimeout(() => this.deletedOcifId = null, 0);
  
      if (this.selectedProfiles.length === 0) {
        this.removeCachedItems('profilesSelected');
        this.clearCache();
      }
  
      this.cdr.detectChanges();
    }
  }


  // 3. Add handler for grid selection:

  onGridSelectionChanged(rows: any[]): void {
    this.selectedProfiles = rows;
  }

  //Parent component HTML — bind to the grid:

  <app-customer-search-grid
  [firstName]="firstName"
  [lastName]="lastName"
  [deselectByOcifId]="deletedOcifId"
  (selectionChanged)="onGridSelectionChanged($event)">
</app-customer-search-grid>

//customer-search-grid.component.ts — 2 additions:
//1. Add @Input setter after existing inputs:

@Input() firstName = '';
@Input() lastName  = '';

// Receives an ocifId when parent deletes a profile card.
// Automatically deselects the matching row in the grid.
@Input() set deselectByOcifId(ocifId: string | null) {
  if (!ocifId) return;
  this.deselectByOcif(ocifId);
}

//2. Add deselectByOcif() private method before emitSelected():

// Deselects a row by ocifId.
// Parent node  → deselects itself and cascades to all children.
// Child node   → deselects itself and bubbles up to parent.
private deselectByOcif(ocifId: string): void {
    let changed = false;
  
    for (const n of this.tree) {
  
      // Parent match
      if (n.ocifId === ocifId && n._selected) {
        n._selected = false;
        (n.children ?? []).forEach(c => c._selected = false);
        changed = true;
      }
  
      // Child match
      for (const c of (n.children ?? [])) {
        if (c.ocifId === ocifId && c._selected) {
          c._selected = false;
          n._selected = false; // parent unchecked — not all children selected
          changed = true;
        }
      }
    }
  
    if (changed) {
      this.refresh();       // re-renders grid, syncs header checkbox
      this.emitSelected();  // keeps parent selectedProfiles in sync
    }
  }

  // flow

  User clicks ✕ on profile card
  → onRemove(profile, index)
  → deleteByIndex removes from selectedProfiles
  → deletedOcifId = profile.ocifId        triggers @Input setter on grid
  → deselectByOcif(ocifId)                walks tree, deselects match + cascade
  → refresh()                             grid re-renders, checkbox unchecked
  → emitSelected()                        parent selectedProfiles stays in sync
  → setTimeout → deletedOcifId = null     resets so same ocifId works next time



  /////// TRIM PAYLOAD LOGIC
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      customerType: ['Individual'],
      // Add maxLength validators here
      firstName: ['', [Validators.required, Validators.maxLength(30)]],
      middleName: ['', [Validators.maxLength(30)]],
      lastName: ['', [Validators.required, Validators.maxLength(30)]],
      country: ['Canada'],
      streetNumber: [''],
      streetName: [''],
      unitNumber: [''],
      province: [''],
      city: ['', [Validators.maxLength(40)]], // City constraint added as well
      postalCode: [''],
      dateOfBirth: [''],
      phoneNumber: [''],
      emailAddress: ['']
    });
  }

  // 2. Add Error Messages to the Template Layout (search-customer.component.html)

  <div class="form-row three-cols">
  
  <div class="form-field-group">
    <label>{{ searchCustomerVerbiage.lastName | translate }} *</label>
    <input class="advanced-inputs" 
           [class.input-error]="searchForm.get('lastName')?.touched && searchForm.get('lastName')?.hasError('maxlength')"
           type="text" 
           formControlName="lastName" 
           placeholder="Last Name" />
    
    @if (searchForm.get('lastName')?.touched && searchForm.get('lastName')?.hasError('maxlength')) {
      <small class="error-text">Last Name cannot exceed 30 characters.</small>
    }
  </div>

  <div class="form-field-group">
    <label>Middle Name</label>
    <input class="advanced-inputs" 
           [class.input-error]="searchForm.get('middleName')?.touched && searchForm.get('middleName')?.hasError('maxlength')"
           type="text" 
           formControlName="middleName" 
           placeholder="Middle Name" />
    
    @if (searchForm.get('middleName')?.touched && searchForm.get('middleName')?.hasError('maxlength')) {
      <small class="error-text">Middle Name cannot exceed 30 characters.</small>
    }
  </div>

  <div class="form-field-group">
    <label>{{ searchCustomerVerbiage.firstName | translate }} *</label>
    <input class="advanced-inputs" 
           [class.input-error]="searchForm.get('firstName')?.touched && searchForm.get('firstName')?.hasError('maxlength')"
           type="text" 
           formControlName="firstName" 
           placeholder="First Name" />
    
    @if (searchForm.get('firstName')?.touched && searchForm.get('firstName')?.hasError('maxlength')) {
      <small class="error-text">First Name cannot exceed 30 characters.</small>
    }
  </div>

</div>

// 3. Add Error Styling (search-customer.component.scss)


.form-field-group {
    display: flex;
    flex-direction: column;
    position: relative;
    margin-bottom: 16px;
  
    /* Form control text input error highlight styling */
    .advanced-inputs.input-error {
      border-color: #a12000 !important; /* BMO Warning/Error Dark Red */
      box-shadow: 0 0 0 1px #a12000;
      
      &:focus {
        box-shadow: 0 0 0 2px #a12000;
      }
    }
  
    /* Text layout properties */
    .error-text {
      color: #a12000;
      font-size: 11px;
      font-weight: 500;
      margin-top: 4px;
      display: block;
      animate: fadeIn 0.2s ease-in-out;
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-2px); }
    to { opacity: 1; transform: translateY(0); }
  }


  // 1. Update the TypeScript Logic (search-customer.component.ts)

  private updateValidators(type: string): void {
    const last = this.searchForm.get('lastName');
    const first = this.searchForm.get('firstName');
    const middle = this.searchForm.get('middleName');
    const city = this.searchForm.get('city');
    const entity = this.searchForm.get('entityTradeName');
  
    if (type === 'Individual') {
      // Pass arrays containing BOTH required and maxLength rules
      last?.setValidators([Validators.required, Validators.maxLength(30)]);
      first?.setValidators([Validators.required, Validators.maxLength(30)]);
      middle?.setValidators([Validators.maxLength(30)]);
      city?.setValidators([Validators.maxLength(40)]);
      entity?.clearValidators();
    } else if (type === 'entity') {
      this.searchForm.get('customerType')?.patchValue('entity', { emitEvent: false });
      last?.clearValidators();
      first?.clearValidators();
      middle?.clearValidators();
      city?.setValidators([Validators.maxLength(40)]);
      entity?.setValidators([Validators.required]);
    }
  
    // Refresh status flags across the array collection
    [last, first, middle, city, entity].forEach(control => control?.updateValueAndValidity());
  }


  // 2. Update the Search Trigger (search-customer.component.ts)

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
  
    const rawFormValue = this.searchForm.getRawValue();
  
    // Unified trim engine for all fields
    const trimmedPayload = Object.keys(rawFormValue).reduce((acc, key) => {
      const value = rawFormValue[key];
      acc[key] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {} as any);
  
    if (trimmedPayload.customerType === 'Individual') {
      this.searchTriggered.emit({ ...trimmedPayload, searchType: 'SEARCH_CUSTOMER' });
    } else {
      this.searchTriggered.emit({ ...trimmedPayload, searchType: 'ENTITY_CUSTOMER' });
    }
  }

  // 3. Clean Template Binding Check (search-customer.component.html)

  <div class="form-field-group">
  <label>{{ searchCustomerVerbiage.lastName | translate }} *</label>
  <input class="advanced-inputs" 
         [class.input-error]="searchForm.get('lastName')?.touched && searchForm.get('lastName')?.hasError('maxlength')"
         type="text" 
         formControlName="lastName" 
         placeholder="Last Name" />
  
  @if (searchForm.get('lastName')?.touched && searchForm.get('lastName')?.hasError('maxlength')) {
    <small class="error-text">Last Name cannot exceed 30 characters.</small>
  }
</div>
