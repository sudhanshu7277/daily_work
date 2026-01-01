import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-payment-details-form',
  standalone: true,
  templateUrl: './payment-details-form.component.html'
})
export class PaymentDetailsFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Output() formValidityChange = new EventEmitter<boolean>();

  eventTypes = [
    { value: '', label: 'Please Select' },
    { value: 'dividend', label: 'Dividend' },
    { value: 'interest', label: 'Interest' },
    { value: 'redemption', label: 'Redemption' },
    { value: 'maturity', label: 'Maturity' }
  ];

  paymentTypes = [
    { value: '', label: 'Please Select' },
    { value: 'regular', label: 'Regular' },
    { value: 'special', label: 'Special' },
    { value: 'final', label: 'Final' }
  ];

  isFieldInvalid(field: string): boolean {
    const control = this.formGroup.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}