// The Complete Update (changedValueFromDopdown)
//Instead of just checking the validation state on dropdown switches, we will also subscribe to the otherReason input value stream right inside the 'other' condition. This will strip special characters instantly as the user types.

//Update your changedValueFromDopdown method to include this value interceptor loop:

changedValueFromDopdown(event: any) {
    this.other = event;
    const otherReasonControl = this.form.get('otherReason');

    if (!otherReasonControl) return;

    // Clean up any old subscription if the user changes dropdown selections to avoid leaks
    if (this.otherReasonSubscription) {
      this.otherReasonSubscription.unsubscribe();
    }

    if (this.form.controls.reason.value === 'other' || event === 'other') {
      // 1. Set the initial strict validation logic
      otherReasonControl.setValidators([
        Validators.required, 
        Validators.pattern('^[a-zA-Z0-9]*$')
      ]);

      // 2. 🟢 LIVE STRIPPER: Intercept typing and vaporize special characters immediately
      this.otherReasonSubscription = otherReasonControl.valueChanges.subscribe((value: string) => {
        if (!value) return;

        // Strip everything except letters (a-z, A-Z) and numbers (0-9)
        const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');

        if (value !== sanitized) {
          otherReasonControl.setValue(sanitized, { emitEvent: false });
        }
      });

    } else {
      // Revert back to baseline validation state when 'Other' is deselected
      otherReasonControl.setValidators([Validators.pattern('^[a-zA-Z0-9]*$')]);
      otherReasonControl.setValue('', { emitEvent: false });
    }

    otherReasonControl.updateValueAndValidity();
  }

  /// Component Cleanup Checklist
//Declare the Subscription Property:
//At the top of your component class (where you define properties like form: FormGroup; other: string;), add a line to store this new subscription reference so it cleans up safely:

otherReasonSubscription: any;

// Clean up on Destroy (Best Practice):
// If your component implements OnDestroy, make sure to unsubscribe cleanly when navigating away from this view layout:


ngOnDestroy(): void {
    if (this.otherReasonSubscription) {
      this.otherReasonSubscription.unsubscribe();
    }
  }

