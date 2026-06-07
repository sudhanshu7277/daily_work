// 1. The Component Template Update (search-customer.component.html)
//We will keep your native <input type="date"> inside the DOM so your calendar picker i
//nterface works perfectly, but we will make it completely invisible using opacity.

<div class="form-field-group date-picker-group">
  <label>{{ searchCustomerVerbiage.dob | translate }}</label>
  <div class="date-input-wrapper">
    
    <input type="text"
           class="form-control custom-date-display"
           placeholder="Select"
           [value]="formattedDateDisplay"
           readonly />

    <input type="date"
           id="dateOfBirth"
           class="custom-date-hidden-picker"
           formControlName="dateOfBirth"
           (change)="handleDateSelection($event)" />
           
    <span class="custom-calendar-icon"></span>
  </div>
  <small class="date-picker-text" style="color: #a0a0a0;">MM/DD/YYYY</small>
</div>


// 2. The Component Controller Fix (search-customer.component.ts)

// Step A: Declare a display tracker variable at the top of your class body

// Place this near your other component property declarations (e.g., around line 126)
formattedDateDisplay = '';


//Step B: Add the calculation intercept method inside your class body

handleDateSelection(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value; // Receives browser 'YYYY-MM-DD' natively
  
    if (rawValue) {
      const [year, month, day] = rawValue.split('-');
      
      // Convert right away to the required format
      this.formattedDateDisplay = `${month}/${day}/${year}`;
      
      // Explicitly update your Reactive Form value block to stay in sync
      this.searchForm.get('dateOfBirth')?.setValue(this.formattedDateDisplay, { emitEvent: false });
    } else {
      this.formattedDateDisplay = '';
    }
  }

  // Step C: Clear or adjust your payload loop inside onSearch()
//Since handleDateSelection now handles updating your Reactive Form 
// //control value directly into the exact string layout contract, 
// //
// you can completely simplify your payload mapping 
// loop inside onSearch() (lines 213–218). It can pass values naturally 
// without manual manipulation blocks:

const trimmedPayload = Object.keys(rawFormValue).reduce((acc, key) => {
    const value = rawFormValue[key];
    acc[key] = typeof value === 'string' ? value.trim() : value; // dateOfBirth is already MM/DD/YYYY here
    return acc;
  }, {} as any);

  //Step D: Update onClear() to reset the text display state
//Locate your onClear() method (around line 229) a
//nd make sure it resets your visual string string reference 
// //alongside the parent group:

onClear(): void {
    this.searchForm.reset({ customerType: 'Individual', country: 'Canada' });
    this.formattedDateDisplay = ''; // 👈 Clear the visual display input value box
    this.searchTriggered.emit();
  }

  // 3. The Stylesheet Fix (search-customer.component.scss)

  .date-input-wrapper {
    position: relative;
    display: block;
    width: 100%;
  
    // The visual text field block matching your Figma style properties
    .custom-date-display {
      width: 100%;
      background-color: #ffffff;
      cursor: pointer;
    }
  
    // The native browser input is made completely invisible but stretches over the display input
    .custom-date-hidden-picker {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0; // Completely un-rendered visually
      z-index: 5;  // Sits on top so clicking anywhere inside the field safely opens the calendar panel
      cursor: pointer;
  
      // Direct click mapping pass for standard Chromium configurations
      &::-webkit-calendar-picker-indicator {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        cursor: pointer;
      }
    }
  
    // Position your calendar icon span securely underneath the interactive click layer
    .custom-calendar-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none; // Allows click event propagation to leak down to the picker layer
      z-index: 2;
    }
  }


