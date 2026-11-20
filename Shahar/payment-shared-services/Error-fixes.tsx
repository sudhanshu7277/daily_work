//1. Define a Shared Constant (or Reuse in Form Factories)
// In your character-set constants file (or at the top of app-form.factory.ts and address.service.ts):

export const ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN =
  /^[A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]*$/;


  //src/app/core/factories/app-form.factory.ts (around line 219):   

  building: ['', [
    Validators.maxLength(30),
    Validators.pattern(ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN),
  ]],

  //src/app/services/address.service.ts (around line 264):   

  building: ['', [
    Validators.maxLength(30),
    Validators.pattern(ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN),
  ]],

  //2. src/app/components/additional-details-section/additional-details-section.component.ts

  private static readonly ALPHA_NUMERIC_SLASH_CHAR_REGEX =
  /^[A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]$/;

private static readonly ALPHA_NUMERIC_SLASH_DISALLOWED_REGEX =
  /[^A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]/g;

onAlphaNumericSlashKeydown(event: KeyboardEvent): void {
  const key = event.key;

  if (event.ctrlKey || event.metaKey || key.length > 1) return;

  if (!AdditionalDetailsSectionComponent.ALPHA_NUMERIC_SLASH_CHAR_REGEX.test(key)) {
    event.preventDefault();
  }
}

onAlphaNumericSlashInput(event: Event, controlName: string): void {
  const input = event.target as HTMLInputElement;
  const sanitized = input.value.replace(
    AdditionalDetailsSectionComponent.ALPHA_NUMERIC_SLASH_DISALLOWED_REGEX,
    '',
  );
  if (sanitized !== input.value) {
    input.value = sanitized;
    this.parentForm?.get(controlName)?.setValue(sanitized);
  }
}


//3. src/app/components/additional-details-section/additional-details-section.
// component.htmlUpdate both <input> elements (siteCompartment and building) to use the generalized handlers:   

<!-- Site / Compartment, Lot / Concession -->
<input
  type="text"
  class="input text"
  name="siteCompartment"
  id="siteCompartment"
  formControlName="siteCompartment"
  maxlength="40"
  (keydown)="onAlphaNumericSlashKeydown($event)"
  (input)="onAlphaNumericSlashInput($event, 'siteCompartment')"
  aria-describedby="helper-siteCompartment"
/>

<!-- Building -->
<input
  type="text"
  class="input text"
  name="building"
  id="building"
  formControlName="building"
  maxlength="30"
  (keydown)="onAlphaNumericSlashKeydown($event)"
  (input)="onAlphaNumericSlashInput($event, 'building')"
  aria-describedby="helper-building"
/>


