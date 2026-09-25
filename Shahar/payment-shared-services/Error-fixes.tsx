//1. In search-customer.component.ts
// Add this helper method inside SearchCustomerComponent 
// to block input beyond the limit and trigger the Angular error state instantly:


onBeforeInputCheck(event: Event, controlName: string, maxLen: number): void {
  const inputEvent = event as InputEvent;

  // When deleting or clearing text, clear the custom maxlength error if length drops below limit
  if (!inputEvent.data) {
    const ctrl = this.searchForm.get(controlName);
    if (ctrl?.hasError('maxlength')) {
      const { maxlength, ...rest } = ctrl.errors || {};
      ctrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return;
  }

  const target = inputEvent.target as HTMLInputElement;
  const currentVal = target.value || '';
  const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
  const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;

  // When attempting to exceed the limit:
  if (newTotalLength > maxLen) {
    // Prevent the character from appearing in the input element
    inputEvent.preventDefault();

    // Immediately set the maxlength error so the UI error message displays
    const ctrl = this.searchForm.get(controlName);
    ctrl?.setErrors({ ...(ctrl.errors || {}), maxlength: true });
    ctrl?.markAsDirty();
  }
}



// 2. In search-customer.component.html
// Replace the native maxlength attributes with (beforeinput) on all three inputs:

// 1. Last Name (lines 22–24)


(focus)="sharedDataInternally()"
          (beforeinput)="onBeforeInputCheck($event, 'lastName', 90)"
          [placeholder]="searchCustomerVerbiage.lastNamePlaceholder | translate" />


//2. First Name (lines 83–85)


(focus)="sharedDataInternally()"
          (beforeinput)="onBeforeInputCheck($event, 'firstName', 30)"
          [placeholder]="searchCustomerVerbiage.firstNamePlaceholder | translate" />


//3. Entity/Trade Name (lines 121–123)


(focus)="sharedDataInternally()"
          (beforeinput)="onBeforeInputCheck($event, 'entityTradeName', 255)"
          [placeholder]="searchCustomerVerbiage.entityTradeNamePlaceholder | translate" />