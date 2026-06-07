// HTML — line 156:

<input type="text"
       id="dateOfBirth"
       class="custom-date-input"
       placeholder="Select"
       maxlength="10"
       formControlName="dateOfBirth"
       (input)="onDateInput($event)"
       (keydown)="onDateKeydown($event)">

       // TS — add two methods, nothing else:

       onDateInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let v = input.value.replace(/\D/g, '');
      
        if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
        if (v.length >= 6) v = v.substring(0, 5) + '/' + v.substring(5);
      
        v = v.substring(0, 10);
        input.value = v;
        this.searchForm.get('dateOfBirth')?.setValue(v, { emitEvent: false });
      }
      
      onDateKeydown(event: KeyboardEvent): void {
        const allowed = [
          'Backspace', 'Delete', 'Tab', 'Escape',
          'Enter', 'ArrowLeft', 'ArrowRight'
        ];
        if (allowed.includes(event.key)) return;
        if (!/^\d$/.test(event.key)) event.preventDefault();
      }