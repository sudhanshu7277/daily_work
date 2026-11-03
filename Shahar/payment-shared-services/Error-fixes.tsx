//1. In selection-panel.component.ts
// Update managerName in applyForm (around line 56) to remove Validators.maxLength and keep only Validators.required and the regex pattern:


this.applyForm = this.formBuilder.group({
  holdName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9 ]*$/)]],
  managerName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
  lawyerEmail: ['', [Validators.required, Validators.email]]
});


//Add the (beforeinput) filter method to SelectionPanelComponent:

filterNameCharacters(event: Event): void {
  const inputEvent = event as InputEvent;
  if (!inputEvent.data) {
    return;
  }

  // Disallows special characters like @, #, $, %, etc. without imposing any length limit
  if (!/^[a-zA-Z0-9\s.'\-]+$/.test(inputEvent.data)) {
    inputEvent.preventDefault();
  }
}


//2. In selection-panel.component.html
// Attach (beforeinput)="filterNameCharacters($event)" to the input element (around line 165):


<input
  id="apply-manager-name"
  type="text"
  formControlName="managerName"
  placeholder="Name"
  required
  class="visually-hidden"
  aria-required="true"
  [attr.aria-invalid]="showControlError(managerNameControl)"
  [attr.aria-describedby]="showControlError(managerNameControl) && managerNameControl.hasError('required') ? 'apply-manager-name-error' : null"
  (beforeinput)="filterNameCharacters($event)"
/>


