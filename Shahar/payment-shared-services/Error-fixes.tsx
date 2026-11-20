//Here is the complete, consolidated set of final changes across all 5 files for both 
// Site / Compartment, Lot / Concession (3.3.2) and Building (3.3.3):   
// 1. src/app/core/validators/address-field.validators.tsExport the shared AlphaNumericPlusWithSlash regex pattern:  

export const ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN =
  /^[A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]*$/;


  //2. src/app/core/factories/app-form.factory.tsImport ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN 
  // from ../validators/address-field.validators and update siteCompartment and building (lines 214–222):   

  siteCompartment: ['', [
    Validators.maxLength(40),
    Validators.pattern(ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN),
  ]],
  lotConcession: [''],
  building: ['', [
    Validators.maxLength(30),
    Validators.pattern(ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN),
  ]],


//3. src/app/services/address.service.ts
//Import ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN from ../core/validators/address-field.validators 
// and update siteCompartment and building (lines 259–267):

siteCompartment: ['', [
    Validators.maxLength(40),
    Validators.pattern(ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN),
  ]],
  lotConcession: [''],
  building: ['', [
    Validators.maxLength(30),
    Validators.pattern(ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN),
  ]],


//4. src/app/components/additional-details-section/additional-details-section.component.ts
// Replace onSiteCompartmentKeydown (lines 41–50) with generalized keydown and input sanitization 
// handlers for AlphaNumericPlusWithSlash

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


  //5. src/app/components/additional-details-section/additional-details-section.component.
  // htmlBind both (keydown) and (input) on siteCompartment and building (lines 38–65):   


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