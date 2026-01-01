import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-payment-details-form',
  templateUrl: './payment-details-form.component.html',
  styleUrls: ['./payment-details-form.component.scss'],
  standalone: true
})
export class PaymentDetailsFormComponent {
  @Input() formGroup!: FormGroup;

  // Your dropdown data stays here
  eventTypes = [/* your array */];
  paymentTypes = [/* your array */];

  // Individual field validation logic - stays in this component
  isFieldInvalid(field: string): boolean {
    const control = this.formGroup.get(field);
    return !!control && control.invalid && control.touched;
  }
}