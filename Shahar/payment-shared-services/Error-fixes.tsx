//additional-details-section.component.ts — form control setup (ya parent form jahan siteCompartment define hai):

siteCompartment: ['', [
    Validators.maxLength(40),
    Validators.pattern(/^[A-Za-z0-9/\s]*$/),
  ]],


  //Agar validators already kisi aur jagah (address form component) lag rahe hain, to wahan add karo. Pattern alphanumeric + / + space allow karta hai.

  <input
  type="text"
  class="input text"
  name="siteCompartment"
  id="siteCompartment"
  formControlName="siteCompartment"
  maxlength="40"
  aria-describedby="helper-siteCompartment"
/>