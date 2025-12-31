// payment-entry.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-entry', // or your actual selector
  templateUrl: './payment-entry.component.html',
})
export class PaymentEntryComponent {
  paymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      // Payment Details section
      securityId: ['', Validators.required],
      eventType: ['', Validators.required],
      eventValueDate: ['', Validators.required],
      couponNumber: [''],
      eventRecordDate: [''],
      entitlement: [''],
      paymentType: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      paymentDate: ['', Validators.required],
      paymentAmount: ['', [Validators.required, Validators.min(0)]],
      presenterPosition: [''],
      standardPayment: [false],
      targetPayment: [false],
      debitPayment: [false],
      rebate: [false],

      // Creditor Details section
      creditorType: [''],
      creditorName: ['', Validators.required],
      creditorInformation: [''],
      comments: [''],
      selectedFile: [null]  // if you have file upload
    });
  }

  onSave() {
    this.paymentForm.markAllAsTouched();

    if (this.paymentForm.valid) {
      console.log('Form is valid. Saving data:', this.paymentForm.value);
      // Call your service / API here
    } else {
      console.log('Form invalid. Errors shown in UI.');
      // Optional: global focus on first error
      setTimeout(() => {
        const firstInvalid = document.querySelector('.is-invalid, .ng-invalid');
        if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      }, 0);
    }
  }
}