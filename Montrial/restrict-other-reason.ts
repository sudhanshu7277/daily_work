// The Complete Update (changedValueFromDopdown)
//Instead of just checking the validation state on dropdown switches, we will also subscribe to the otherReason input value stream right inside the 'other' condition. This will strip special characters instantly as the user types.

//Update your changedValueFromDopdown method to include this value interceptor loop:

changedValueFromDopdown(event: any) {
    this.other = event;
    const otherReasonControl = this.form.get('otherReason');
    if (!otherReasonControl) return;

    // 1. Always clean up the previous subscription first to prevent memory leaks
    if (this.otherReasonSubscription) {
      this.otherReasonSubscription.unsubscribe();
    }

    // 2. If 'Other' is selected, handle validation and live character filtering
    if (this.form.controls.reason.value === 'other' || event === 'other') {
      
      // Set field as required
      otherReasonControl.setValidators([Validators.required]);

      // Listen to typing and strip out special characters instantly
      this.otherReasonSubscription = otherReasonControl.valueChanges.subscribe((value: string) => {
        if (!value) return;

        // Allow only lower case letters, upper case letters, numbers, and standard spaces
        const sanitized = value.replace(/[^a-zA-Z0-9 ]/g, '');

        if (value !== sanitized) {
          otherReasonControl.setValue(sanitized, { emitEvent: false });
        }
      });

    } else {
      // 3. Reset state completely if they select a different dropdown option
      otherReasonControl.clearValidators();
      otherReasonControl.setValue('', { emitEvent: false });
    }

    // Refresh control status
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

