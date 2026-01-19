import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[numbersOnly]',
  standalone: true
})
export class NumbersOnlyDirective {
  // Allow navigation keys: backspace, delete, tab, escape, enter, decimal point
  private allowedKeys: Array<string> = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', '.'];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.allowedKeys.indexOf(event.key) !== -1) {
      return;
    }
    // Check if the key is a number
    const regEx = new RegExp(/[0-9]/);
    if (!regEx.test(event.key)) {
      event.preventDefault();
    }
  }
}

// updated payment amount input element

<div class="lmn-form-group lmn-col-6">
  <label class="lmn-form-label">Payment Amount</label>
  <input
    type="text"
    numbersOnly
    class="lmn-form-control"
    [class.is-invalid]="hardcapValidationPassed === false"
    formControlName="paymentAmount"
    placeholder="Enter amount"
  />
</div>

// payment amount field ts 

this.paymentForm = this.fb.group({
    paymentAmount: ['', [
      Validators.required, 
      Validators.pattern('^[0-9]*\\.?[0-9]*$'), // Allows decimals
      Validators.min(0)
    ]]
  });
  
  // Existing listener logic from your image
  private setupPaymentAmountListener(): void {
    const paymentAmountControl = this.paymentForm.get('paymentAmount');
    if (paymentAmountControl) {
      paymentAmountControl.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap(value => {
          // Strip non-numeric characters if pasted
          const cleanValue = String(value).replace(/[^0-9.]/g, '');
          if (value !== cleanValue) {
            paymentAmountControl.setValue(cleanValue, { emitEvent: false });
          }
          return of(cleanValue);
        })
      ).subscribe(value => {
        this.validateHardcap(value);
      });
    }
  }