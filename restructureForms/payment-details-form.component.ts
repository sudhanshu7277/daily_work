// payment-details-form.component.ts
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-payment-details-form',
  standalone: true,
  imports: [/* your existing imports */],
  templateUrl: './payment-details-form.component.html',
})
export class PaymentDetailsFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  // Keep your eventTypes, paymentTypes arrays here
  eventTypes = [ /* ... your array ... */ ];
  paymentTypes = [ /* ... your array ... */ ];

  // If you still want local helpers (optional)
  isFieldInvalid(field: string): boolean {
    const ctrl = this.formGroup.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  getFieldError(field: string): string | null {
    const ctrl = this.formGroup.get(field);
    if (ctrl?.errors?.['required']) return 'This field is required';
    return null;
  }
}