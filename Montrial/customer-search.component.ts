// . The Template Fix (search-customer.component.html)
//We will update your date field block to bind a dynamic class helper condition. This hides the browser's default internal yyyy-mm-dd text placeholder whenever the field control is completely empty or untouched.

//Replace your current date field group block with this:

<div class="form-field-group date-picker-group">
  <label>{{ searchCustomerVerbiage.dob | translate }}</label>
  <div class="date-input-wrapper" [class.show-placeholder]="!searchForm.get('dateOfBirth')?.value">
    <input type="date"
           id="dateOfBirth"
           class="custom-date-input"
           placeholder="Select"
           formControlName="dateOfBirth"
           (change)="onDateChange($event)" />
    <span class="custom-calendar-icon"></span>
  </div>
  <small class="date-picker-text" style="color: #a0a0a0;">MM/DD/YYYY</small>
</div>


// 2. The Style Fix (search-customer.component.scss)
//Add this isolated CSS block to your component's stylesheet. When the input has no active value selection, this ruleset hides the browser's default shadow DOM text characters and places a custom pseudo-element overlay displaying your precise 
//Figma "Select" label right inside the container.

.date-input-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  
    &.show-placeholder {
      input[type="date"] {
        // Hide the native browser placeholder markers cleanly
        &::-webkit-datetime-edit-text,
        &::-webkit-datetime-edit-month-field,
        &::-webkit-datetime-edit-day-field,
        &::-webkit-datetime-edit-year-field {
          color: transparent !important;
        }
  
        // Drop in the clean Figma text placeholder mask
        ::after {
          content: "Select";
          position: absolute;
          left: 12px;
          color: #757575; 
          pointer-events: none;
        }
      }
    }
  
    input[type="date"] {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      
      // Ensure the native interactive calendar trigger button overlay stays fully active
      &::-webkit-calendar-picker-indicator {
        position: absolute;
        right: 12px;
        z-index: 2;
        opacity: 0; // Hides default icon to rely on your custom-calendar-icon span positioning
        cursor: pointer;
      }
    }
  }

  // 3. The Payload Formatting Fix (search-customer.component.ts)
//When a user selects a date via the calendar layout, standard browsers write a string formatted explicitly as YYYY-MM-DD directly into the template form engine.

//To convert this selection to MM/DD/YYYY across both your local UI component controls and your dynamic outgoing network dispatch model array payloads, locate your onSearch() function block. We will intercept the payload generation sweep inside your object reducer loop.

//Step A: Update the form payload generator inside onSearch()
//Update your active form serialization pass (around lines 207–227) to include a conversion check for the dateOfBirth property:

onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
  
    const rawFormValue = this.searchForm.getRawValue();
    const trimmedPayload = Object.keys(rawFormValue).reduce((acc, key) => {
      const value = rawFormValue[key];
      
      // --- START PRODUCTION payload TRANSFORMATION FIX ---
      if (key === 'dateOfBirth' && value) {
        // Convert browser default YYYY-MM-DD string format safely to MM/DD/YYYY
        const [year, month, day] = value.split('-');
        acc[key] = `${month}/${day}/${year}`;
      } else {
        acc[key] = typeof value === 'string' ? value.trim() : value;
      }
      // --- END PRODUCTION payload TRANSFORMATION FIX ---
  
      return acc;
    }, {} as any);
  
    if (trimmedPayload.customerType === 'Individual' && this.searchForm.valid) {
      this.searchTriggered.emit({ ...trimmedPayload, searchType: 'SEARCH_CUSTOMER' });
    } else if (trimmedPayload.customerType === 'entity' && this.searchForm.valid) {
      this.searchTriggered.emit({ ...trimmedPayload, searchType: 'ENTITY_CUSTOMER' });
    }
  }

  // Step B: Intercept user changes to keep the text display updated (Optional)
//If you need the literal control property string element value inside your application's reactive form controls stack tracking layer to match the network contract model configuration exactly at runtime as soon as 
//blur fields emit, drop this mapping function directly into your component body:

onDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value; // Receives 'YYYY-MM-DD' natively
  
    if (rawValue) {
      const [year, month, day] = rawValue.split('-');
      const formattedDate = `${month}/${day}/${year}`;
      
      // Allows internal validation routines to keep running using the exact Figma format mapping
      console.log('Formatted frontend selection string target created:', formattedDate);
    }
  }