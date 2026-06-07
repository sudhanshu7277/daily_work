// HTML — clean version:


<input type="date"
       id="dateOfBirth"
       class="custom-date-input"
       formControlName="dateOfBirth"
       (change)="onDateChange($event)">

       // Remove (input) and (keydown) bindings entirely.

// TS — replace onDateInput and onDateKeydown with one simple method:

// Converts selected date from yyyy-mm-dd to MM/DD/YYYY for display
onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value; // yyyy-mm-dd from native picker
  
    if (raw && raw.length === 10) {
      const [year, month, day] = raw.split('-');
      const formatted = `${month}/${day}/${year}`; // MM/DD/YYYY
      this.searchForm.get('dateOfBirth')?.setValue(formatted, { emitEvent: false });
    }
  }

  // SCSS — hide yyyy-mm-dd placeholder, show Select:

  .custom-date-input {
    // Hide browser default yyyy-mm-dd text when empty
    &:not(:valid) {
      color: transparent;
    }
  
    // Show "Select" as placeholder text
    &:not(:valid)::before {
      content: 'Select';
      color: #6b7a8a;
      position: absolute;
    }
  
    // Show date value normally when selected
    &:valid {
      color: #1c2333;
    }
  }

  // TS — on submit, convert MM/DD/YYYY back to yyyy-mm-dd for API:

  // In onSearch(), after const trimmedPayload (line 221):
if (trimmedPayload.dateOfBirth?.includes('/')) {
    const [month, day, year] = trimmedPayload.dateOfBirth.split('/');
    trimmedPayload.dateOfBirth = `${year}-${month}-${day}`;
  }