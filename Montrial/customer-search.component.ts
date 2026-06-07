// 1. The HTML Template Update (search-customer.component.html)
//We will use a single input element. We change type="text" to type="date" dynamically using standard Angular focus events, and pass the selection straight into a form control mapping utility.

//Replace your active Date of Birth field group container with this block:

<div class="form-field-group date-picker-group">
  <label>{{ searchCustomerVerbiage.dob | translate }}</label>
  <div class="date-input-wrapper">
    <input #datePicker
           [type]="isDatePickerActive ? 'date' : 'text'"
           id="dateOfBirth"
           class="form-control custom-date-input"
           placeholder="Select"
           [value]="formattedDateDisplay"
           (focus)="activateDatePicker()"
           (blur)="deactivateDatePicker()"
           (change)="handleDateSelection($event)" />
    <span class="custom-calendar-icon" (click)="datePicker.focus()"></span>
  </div>
  <small class="date-picker-text" style="color: #a0a0a0;">MM/DD/YYYY</small>
</div>

// 2. The TypeScript Component Fix (search-customer.component.ts)
//Now we need to handle the state variables, transform the browser's YYYY-MM-DD value to MM/DD/YYYY right on selection, and keep your underlying reactive form instance securely updated.

//Step A: Add these class properties at the top of your component body

// Place this near your other declarations (around line 126)
isDatePickerActive = false;
formattedDateDisplay = '';

/// Step B: Add these exact state handler methods to your class body

activateDatePicker(): void {
    this.isDatePickerActive = true;
  }
  
  deactivateDatePicker(): void {
    // If no date was selected, revert back to text type to show the "Select" placeholder
    if (!this.formattedDateDisplay) {
      this.isDatePickerActive = false;
    }
  }
  
  handleDateSelection(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value; // Natively reads 'YYYY-MM-DD' from browser picker
  
    if (rawValue && rawValue.includes('-')) {
      const [year, month, day] = rawValue.split('-');
      
      // Convert to MM/DD/YYYY right away for visual display
      this.formattedDateDisplay = `${month}/${day}/${year}`;
      
      // Keep your underlying Reactive Form control updated with the required format payload
      this.searchForm.get('dateOfBirth')?.setValue(this.formattedDateDisplay, { emitEvent: false });
      
      // Switch input back to text mode so it natively displays the formatted string
      this.isDatePickerActive = false;
    } else {
      this.formattedDateDisplay = '';
      this.searchForm.get('dateOfBirth')?.setValue('', { emitEvent: false });
    }
  }


  // Step C: Update onClear() to reset the text display state
//Make sure //your clear method empties out our local tracking variable alongside the 
// //form context loop:

onClear(): void {
    this.searchForm.reset({ customerType: 'Individual', country: 'Canada' });
    this.formattedDateDisplay = '';
    this.isDatePickerActive = false;
    this.searchTriggered.emit();
  }

  // 3. The SCSS Style Update (search-customer.component.scss)
//Because we got rid of the dual-stacked elements, your stylesheet 
//stays minimal, clean, and has zero risk of layout shifts or breaking input containers.

.date-input-wrapper {
    position: relative;
    display: block;
    width: 100%;
  
    .custom-date-input {
      width: 100%;
      height: 40px; // Match your existing theme form styling height
      padding-right: 40px; // Reserve space so text never collides with the icon
      background-color: #ffffff;
      
      // Ensure native clear/spin controls don't mess up padding constraints
      &::-webkit-calendar-picker-indicator {
        cursor: pointer;
      }
    }
  
    .custom-calendar-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      z-index: 2;
    }
  }


  //1. The Template Pass (search-customer.component.html)
//We don't need to change any styling or structure. We just need to add a template reference variable (#dateInput) so our TypeScript code can directly command the element to show its picker.

//Update the input element to look exactly like this:

<div class="form-field-group date-picker-group">
  <label>{{ searchCustomerVerbiage.dob | translate }}</label>
  <div class="date-input-wrapper">
    <input #dateInput
           [type]="isDatePickerActive ? 'date' : 'text'"
           id="dateOfBirth"
           class="form-control custom-date-input"
           placeholder="Select"
           [value]="formattedDateDisplay"
           (focus)="activateDatePicker(dateInput)"
           (blur)="deactivateDatePicker()"
           (change)="handleDateSelection($event)" />
    <span class="custom-calendar-icon" (click)="dateInput.focus()"></span>
  </div>
  <small class="date-picker-text" style="color: #a0a0a0;">MM/DD/YYYY</small>
</div>


  //2. The TypeScript Fix (search-customer.component.ts)
//Modern browsers support a native JavaScript API method called showPicker(). By calling this method inside a microtask (setTimeout) immediately after switching the type, we force the browser to throw open the calendar dropdown instantly on that very first click.

//Update your activateDatePicker method, and keep the rest of your state handlers identical:

activateDatePicker(inputElement: HTMLInputElement): void {
    this.isDatePickerActive = true;
  
    // Run a microtask pass to let Angular switch the DOM element type to "date" first
    setTimeout(() => {
      try {
        // FORCE UNBLOCK: Instantly pops open the native calendar layout on click 1
        if (typeof inputElement.showPicker === 'function') {
          inputElement.showPicker();
        }
      } catch (error) {
        console.warn('Native picker popup fallback handled:', error);
      }
    }, 1);
  }
  
  deactivateDatePicker(): void {
    if (!this.formattedDateDisplay) {
      this.isDatePickerActive = false;
    }
  }
  
  handleDateSelection(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value;
  
    if (rawValue && rawValue.includes('-')) {
      const [year, month, day] = rawValue.split('-');
      this.formattedDateDisplay = `${month}/${day}/${year}`;
      
      // Updates your underlying validation search payload cleanly
      this.searchForm.get('dateOfBirth')?.setValue(this.formattedDateDisplay, { emitEvent: false });
      this.isDatePickerActive = false;
    } else {
      this.formattedDateDisplay = '';
      this.searchForm.get('dateOfBirth')?.setValue('', { emitEvent: false });
    }
  }