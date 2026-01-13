import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-details-form',
  // ... other metadata
})
export class PaymentDetailsFormComponent implements OnDestroy {
  private _formGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  private amountSubscription?: Subscription;

  @Input({ required: true })
  set formGroup(group: FormGroup) {
    if (group) {
      this._formGroup = group;
      // Re-initialize the subscription whenever the group is provided/changed
      this.setupAmountSubscription();
    }
  }

  get formGroup(): FormGroup {
    return this._formGroup;
  }

  private setupAmountSubscription(): void {
    // 1. Clean up any existing subscription to prevent memory leaks
    if (this.amountSubscription) {
      this.amountSubscription.unsubscribe();
    }

    const amountControl = this.formGroup.get('paymentAmount');

    // 2. Safety check: Ensure the control exists within the group
    if (amountControl) {
      this.amountSubscription = amountControl.valueChanges.pipe(
        // 3. Performance: Wait for user to stop typing
        debounceTime(500),
        // 4. Optimization: Only trigger if the value actually changed
        distinctUntilChanged(),
        // 5. Lifecycle Management: Unsubscribe when component is destroyed
        takeUntil(this.destroy$)
      ).subscribe(value => {
        console.log('Payment Amount Changed:', value);
        // Add your logic here (e.g., calling a service or calculating fees)
      });
    }
  }

  ngOnDestroy(): void {
    // 6. Final cleanup to prevent ghost subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}








// import { Component, Input, SimpleChanges } from '@angular/core';
// import { FormGroup } from '@angular/forms';

// @Component({
//   selector: 'app-payment-details-form',
//   templateUrl: './payment-details-form.component.html',
//   styleUrls: ['./payment-details-form.component.scss'],
//   standalone: true
// })
// export class PaymentDetailsFormComponent {
//   @Input() formGroup!: FormGroup;

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['formGroup'] && this.formGroup) {
//       // Optional: do something when formGroup arrives (rarely needed)
//       console.log('FormGroup received in child');
//     }
//   }

//   isFieldInvalid(field: string): boolean {
//     if (!this.formGroup) return false; // Safety guard
//     const control = this.formGroup.get(field);
//     return !!control && control.invalid && (control.touched || control.dirty);
//   }
// }
// }