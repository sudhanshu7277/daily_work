<fdc-input
  [type]="'text'"
  formControlName="otherReason"
  [label]="'Please provide a reason:'"
  (keydown)="filterSpecialCharacters($event)">
</fdc-input>

filterSpecialCharacters(event: KeyboardEvent): void {
    // 1. Allow functional navigation keys (Backspace, Delete, Arrow keys, Tab, Enter)
    const functionalKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (functionalKeys.includes(event.key)) {
      return; 
    }

    // 2. Define our allowed baseline: Letters (A-Z, a-z), Numbers (0-9), and Spaces
    const alphanumericWithSpaceRegex = /^[a-zA-Z0-9 ]$/;

    // 3. Test the incoming character key
    if (!alphanumericWithSpaceRegex.test(event.key)) {
      // If it's a special character (e.g., !, @, #, *, ~), cancel the keyboard input entirely
      event.preventDefault();
    }
  }


  // text flowing out of the box

  <p class="body-3" style="word-break: break-all; overflow-wrap: break-word; white-space: normal; display: block; width: 100%;">
          {{ tasks[i].reason === "other" ? tasks[i].otherReason : 
             ("case.stage2.reasonOfIrregularity.options." + tasks[i].reason | translate) 
          }}
        </p>