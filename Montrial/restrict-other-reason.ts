//1. Update the Constructor Form Initialization
//Add the alphanumeric pattern validator to the otherReason control during initialization so its baseline validation configuration expects only letters and numbers:

constructor() {
    this.form = new FormGroup<any>({
      reason: new FormControl('', [Validators.required]),
      otherReason: new FormControl('', [Validators.pattern('^[a-zA-Z0-9]*$')]) // 🟢 Only allow letters and numbers (alphanumeric)
    });
  }

  // 2. Update the Dropdown Change Handler (changedValueFromDopdown)
//When the user selects 'other', your code dynamically sets Validators.required. We must ensure that when we add the required rule, we do not clear out our alphanumeric constraint.

changedValueFromDopdown(event: any) {
    this.other = event;
    const otherReasonControl = this.form.get('otherReason');

    if (!otherReasonControl) return;

    if (this.form.controls.reason.value === 'other' || event === 'other') {
      // 🟢 Keep the alphanumeric pattern rule AND make it required
      otherReasonControl.setValidators([
        Validators.required, 
        Validators.pattern('^[a-zA-Z0-9]*$')
      ]);
    } else {
      // 🟢 Revert back to just the alphanumeric rule when it's not required
      otherReasonControl.setValidators([Validators.pattern('^[a-zA-Z0-9]*$')]);
    }

    // Force Angular to evaluate the validation status change immediately
    otherReasonControl.updateValueAndValidity();
  }

