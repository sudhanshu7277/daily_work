import { Component, Input, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-payment-details-form',
  templateUrl: './payment-details-form.component.html',
  styleUrls: ['./payment-details-form.component.scss'],
  standalone: true
})
export class PaymentDetailsFormComponent {
  @Input() formGroup!: FormGroup;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formGroup'] && this.formGroup) {
      // Optional: do something when formGroup arrives (rarely needed)
      console.log('FormGroup received in child');
    }
  }

  isFieldInvalid(field: string): boolean {
    if (!this.formGroup) return false; // Safety guard
    const control = this.formGroup.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}

  // Your dropdown data stays here
//   eventTypes = [/* your array */];
//   paymentTypes = [/* your array */];

  // Individual field validation logic - stays in this component
//   isFieldInvalid(field: string): boolean {
//     const control = this.formGroup.get(field);
//     return !!control && control.invalid && control.touched;
//   }
}