// html

<div class="date-input-wrapper">
  <input type="date"
         id="dateOfBirth"
         class="custom-date-input"
         placeholder="Select"
         formControlName="dateOfBirth"
         (change)="onDateChange($event)">
</div>

// ts

onDateChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value; // yyyy-mm-dd
    if (raw?.length === 10) {
      const [y, m, d] = raw.split('-');
      // Set MM/DD/YYYY — matches the existing Validators.pattern
      this.searchForm.get('dateOfBirth')
        ?.setValue(`${m}/${d}/${y}`, { emitEvent: false });
    }
  }

  // TS — in onSearch() after trimmedPayload:

  if (trimmedPayload.dateOfBirth?.includes('/')) {
    const [m, d, y] = trimmedPayload.dateOfBirth.split('/');
    trimmedPayload.dateOfBirth = `${y}-${m}-${d}`;
  }

  // SCSS:

  .custom-date-input {
    &::-webkit-datetime-edit          { color: transparent; }
    &::-webkit-datetime-edit-fields-wrapper { color: transparent; }
  }

