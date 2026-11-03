//1. In selection-panel.component.tsA. Update the pattern validator for holdName (line 130):Replace the current pattern on line 130 (/^[a-zA-Z0-9 ]*$/) with a pattern that allows anything except *, ,, <, and >:   

this.applyForm = this.formBuilder.group({
  holdName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^*,<>]*$/)]],
  managerName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
  lawyerEmail: ['', [Validators.required, Validators.email]]
});


//B. Add an input filtering handler to block those characters on typing/pasting:
// Add this method to SelectionPanelComponent:

filterHoldNameCharacters(event: Event): void {
  const inputEvent = event as InputEvent;
  if (!inputEvent.data) {
    return;
  }

  // Disallow *, ,, <, and >
  if (/[*,<>]/.test(inputEvent.data)) {
    inputEvent.preventDefault();
  }
}


//2. In selection-panel.component.html
// Find the input for holdName (around lines 145–155, right above managerName) and add (beforeinput):

(beforeinput)="filterHoldNameCharacters($event)"