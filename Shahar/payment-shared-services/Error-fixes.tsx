//1. src/app/core/factories/app-form.factory.ts (around line 214)
// Replace the siteCompartment validator pattern with the exact AlphaNumericPlusWithSlash character set:

siteCompartment: ['', [
    Validators.maxLength(40),
    Validators.pattern(/^[A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]*$/),
  ]],


//2. src/app/services/address.service.ts (around line 259)Update the duplicate siteCompartment form control definition to match:   

siteCompartment: ['', [
    Validators.maxLength(40),
    Validators.pattern(/^[A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]*$/),
  ]],


  // 3. src/app/components/additional-details-section/additional-details-section.component.ts
// Update onSiteCompartmentKeydown (line 41) and add an onSiteCompartmentInput handler 
// so pasted values also strip disallowed characters (like , or \):

private static readonly SITE_COMPARTMENT_CHAR_REGEX =
  /^[A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]$/;

private static readonly SITE_COMPARTMENT_DISALLOWED_REGEX =
  /[^A-Za-z0-9éèêëàâäîïôöùûüçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜÇÎÔÛ .'\-/]/g;

onSiteCompartmentKeydown(event: KeyboardEvent): void {
  const key = event.key;

  if (event.ctrlKey || event.metaKey || key.length > 1) return;

  if (!AdditionalDetailsSectionComponent.SITE_COMPARTMENT_CHAR_REGEX.test(key)) {
    event.preventDefault();
  }
}

onSiteCompartmentInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const sanitized = input.value.replace(
    AdditionalDetailsSectionComponent.SITE_COMPARTMENT_DISALLOWED_REGEX,
    '',
  );
  if (sanitized !== input.value) {
    input.value = sanitized;
    this.parentForm?.get('siteCompartment')?.setValue(sanitized, { emitEvent: false });
  }
}


//4. src/app/components/additional-details-section/additional-details-section.component.html 
// (around line 38)Bind (input)="onSiteCompartmentInput($event)" on the siteCompartment <input> element:  


<input
  type="text"
  class="input text"
  name="siteCompartment"
  id="siteCompartment"
  formControlName="siteCompartment"
  maxlength="40"
  (keydown)="onSiteCompartmentKeydown($event)"
  (input)="onSiteCompartmentInput($event)"
  aria-describedby="helper-siteCompartment"
/>

