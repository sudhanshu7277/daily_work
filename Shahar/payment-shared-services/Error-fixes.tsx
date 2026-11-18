//1. address.service.ts — createAddressForm() mein:

siteCompartment: ['', [
    Validators.maxLength(40),
    Validators.pattern(/^[A-Za-z0-9/\s.\\,]*$/),
  ]],


  //2. app-form.factory.ts — same:

  siteCompartment: ['', [
    Validators.maxLength(40),
    Validators.pattern(/^[A-Za-z0-9/\s.\\,]*$/),
  ]],



  //3. additional-details-section.component.html — input:

  <input
  type="text"
  class="input text"
  name="siteCompartment"
  id="siteCompartment"
  formControlName="siteCompartment"
  maxlength="40"
  (keydown)="onSiteCompartmentKeydown($event)"
  aria-describedby="helper-siteCompartment"
/>


//4. additional-details-section.component.ts — method add:

onSiteCompartmentKeydown(event: KeyboardEvent): void {
    const allowed = /^[A-Za-z0-9/\s.\\,]$/;
    const key = event.key;
  
    if (event.ctrlKey || event.metaKey || key.length > 1) return;
  
    if (!allowed.test(key)) {
      event.preventDefault();
    }
  }