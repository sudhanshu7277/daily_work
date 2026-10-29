//Exact Update in search-customer.component.ts
// Replace lines 137 to 139 with:

lastName: ['', [Validators.required, Validators.maxLength(90), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      middleName: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],


      lastName: ['', [Validators.required, Validators.maxLength(90), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      middleName: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],


      //In search-customer.component.ts, update line 145 (highlighted in the editor) to add the alphabet-only validator pattern:   

      city: ['', [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z]*$/)]],



      //1. In search-customer.component.html
//Find the City/Town <input> tag and add (beforeinput) (or (input)):

<input
  id="customer-city"
  formControlName="city"
  class="advanced-inputs"
  type="text"
  placeholder="City/Town"
  maxlength="40"
  (beforeinput)="filterCityCharacters($event)"
/>


//2. In search-customer.component.ts
//Add this method to block invalid key presses and pasted strings before they enter the input field:

filterCityCharacters(event: Event): void {
  const inputEvent = event as InputEvent;
  
  // Allow deletions, backspaces, undo, etc.
  if (!inputEvent.data) {
    return;
  }

  // Block any non-alphabet characters (only a-z and A-Z allowed)
  if (!/^[a-zA-Z]+$/.test(inputEvent.data)) {
    inputEvent.preventDefault();
  }
}


//In search-customer.component.ts and search-customer.component.html, implement an alphanumeric input filter function for the (beforeinput) event to block all special characters (e.g. @, #, $, %) as shown in the defect report.

filterAlphaNumericAddress(event: Event): void {
  const inputEvent = event as InputEvent;
  // Allow deletions, backspaces, undo, etc.
  if (!inputEvent.data) {
    return;
  }

  // Allow only alphanumeric characters (letters and digits) and spaces
  // Blocks special characters such as @, #, $, %, etc.
  if (!/^[a-zA-Z0-9\s]+$/.test(inputEvent.data)) {
    inputEvent.preventDefault();
  }
}

//2. In search-customer.component.html
//Attach (beforeinput)="filterAlphaNumericAddress($event)" to each corresponding <input> element:

<!-- Street Number -->
<input
  id="customer-street-number"
  formControlName="streetNumber"
  class="advanced-inputs"
  type="text"
  placeholder="#####"
  maxlength="40"
  (beforeinput)="filterAlphaNumericAddress($event)"
/>

<!-- Street Name -->
<input
  id="customer-street-name"
  formControlName="streetName"
  class="advanced-inputs"
  type="text"
  placeholder="Street Name"
  maxlength="40"
  (beforeinput)="filterAlphaNumericAddress($event)"
/>

<!-- Unit Number -->
<input
  id="customer-unit-number"
  formControlName="unitNumber"
  class="advanced-inputs"
  type="text"
  placeholder="####"
  maxlength="40"
  (beforeinput)="filterAlphaNumericAddress($event)"
/>

<!-- Postal Code -->
<input
  id="customer-postal-code"
  formControlName="postalCode"
  class="advanced-inputs"
  type="text"
  placeholder="XXX XXX"
  (beforeinput)="filterAlphaNumericAddress($event)"
/>

