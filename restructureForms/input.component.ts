import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-input-maker',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
  paymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      // Payment Details fields (add all from your template)
      securityId: ['', Validators.required],
      eventType: ['', Validators.required],
      eventValueDate: ['', Validators.required],
      couponNumber: [''],
      eventRecordDate: [''],
      entitlement: [''],
      paymentType: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      paymentDate: ['', Validators.required],
      paymentAmount: ['', Validators.required],
      presenterPosition: [''],
      standardPayment: [false],
      targetPayment: [false],
      debitPayment: [false],
      rebate: [false],

      // Creditor Details fields (add all from your template)
      creditorType: [''],
      creditorName: ['', Validators.required],
      creditorInformation: [''],
      comments: ['']
    });
  }

  onSavePayment(): void {
    this.paymentForm.markAllAsTouched(); // Triggers errors in BOTH children
    if (this.paymentForm.valid) {
      console.log('Saving valid data:', this.paymentForm.value);
      // API call
    } else {
      console.log('Form invalid - errors shown in red');
    }
  }

  onSubmitPayment(): void {
    this.paymentForm.markAllAsTouched(); // Triggers errors in BOTH children
    if (this.paymentForm.valid) {
      console.log('Submitting valid data:', this.paymentForm.value);
      // API call
    } else {
      console.log('Form invalid - errors shown in red');
    }
  }
}