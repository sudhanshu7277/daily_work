//Step 1: Update search-customer.component.ts
//Add the isUsSelected state property inside the class body (e.g., around line 130):

isUsSelected = false;

//Combine the country change handling inside ngOnInit() (lines 195–198) so existing province list behavior is preserved and postal validation runs simultaneously:
// Place it right here:
this.updatePostalCodeValidation(this.searchForm.get('country')?.value);
this.searchForm.get('country')?.valueChanges.subscribe((country: string) => {
  this.updateProvinceList();
  this.searchForm.get('province')?.setValue('');
  this.updatePostalCodeValidation(country);
});


//Add the updatePostalCodeValidation method to toggle between the 9-digit US ZIP format and the Canadian postal code format:


updatePostalCodeValidation(country: string): void {
  const postalCodeControl = this.searchForm.get('postalCode');
  if (!postalCodeControl) return;

  this.isUsSelected = country === 'United States of America';

  if (this.isUsSelected) {
    // 9 digits for US ZIP Code
    postalCodeControl.setValidators([
      Validators.pattern(/^\d{9}$/)
    ]);
  } else {
    // Canadian Postal Code pattern (e.g. A1A 1A1 or A1A1A1)
    postalCodeControl.setValidators([
      Validators.pattern(/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/)
    ]);
  }

  postalCodeControl.updateValueAndValidity();
}


//Step 2: Update search-customer.component.html
//Find the Postal Code <input> element and replace its static maxlength and placeholder with dynamic bindings:

<input
  id="customer-postal-code"
  formControlName="postalCode"
  class="advanced-inputs"
  type="text"
  [placeholder]="isUsSelected ? '#########' : 'XXX XXX'"
  [maxlength]="isUsSelected ? 9 : 7"
  (beforeinput)="filterAlphaNumericAddress($event)"
/>



//

<input
  id="customer-postal-code"
  class="advanced-inputs"
  type="text"
  formControlName="postalCode"
  [placeholder]="isUsSelected ? '#########' : 'xxx xxx'"
  [maxlength]="isUsSelected ? 9 : (searchForm.get('postalCode')?.value?.includes(' ') ? 7 : 6)"
  (input)="!isUsSelected && formatPostalCode($event)"
  (beforeinput)="filterAlphaNumericAddress($event)"
/>