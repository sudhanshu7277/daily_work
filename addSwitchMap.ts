private setupPaymentAmountListener(): void {
    const paymentAmountControl = this.paymentForm.get('paymentAmount');
  
    if (paymentAmountControl) {
      paymentAmountControl.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap(value => {
          // switchMap cancels previous if new value comes in quickly
          // We just pass the value downstream — no async work here
          return of(value);
        })
      ).subscribe(value => {
        // All side effects (validation, modal, errors) happen here
        this.validateHardcap(value);
      });
    }
  }