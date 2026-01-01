import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-input-maker',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [/* your imports including the children */]
})
export class InputComponent {
  paymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      // Payment Details fields
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

      // Creditor Details fields
      creditorType: ['N.A.'],
      creditorName: ['', Validators.required],
      creditorInformation: [''],
      comments: ['']
    });
  }

  // onSaveOrSubmit(): void {
  //   this.paymentForm.markAllAsTouched(); // Shows errors in BOTH children

  //   if (this.paymentForm.valid) {
  //     console.log('Form valid - ready to save/submit:', this.paymentForm.value);
  //     // Your save or submit API call
  //   } else {
  //     console.log('Form invalid - errors visible in red');
  //   }
  // }

  onSaveOrSubmit(): void {
    this.paymentForm.markAllAsTouched(); // Show red errors in both children if invalid
  
    console.log('=== FULL FORM VALUES ===');
    console.log('Raw form value:', this.paymentForm.value);
  
    // Print Payment Details section nicely
    console.log('\n--- Payment Details ---');
    console.log('Security ID:', this.paymentForm.get('securityId')?.value);
    console.log('Event Type:', this.paymentForm.get('eventType')?.value);
    console.log('Event Value Date:', this.paymentForm.get('eventValueDate')?.value);
    console.log('Coupon Number:', this.paymentForm.get('couponNumber')?.value);
    console.log('Event Record Date:', this.paymentForm.get('eventRecordDate')?.value);
    console.log('Entitlement:', this.paymentForm.get('entitlement')?.value);
    console.log('Payment Type:', this.paymentForm.get('paymentType')?.value);
    console.log('Payment Method:', this.paymentForm.get('paymentMethod')?.value);
    console.log('Payment Date:', this.paymentForm.get('paymentDate')?.value);
    console.log('Payment Amount:', this.paymentForm.get('paymentAmount')?.value);
    console.log('Presenter Position:', this.paymentForm.get('presenterPosition')?.value);
    console.log('Standard Payment:', this.paymentForm.get('standardPayment')?.value);
    console.log('Target:', this.paymentForm.get('targetPayment')?.value);
    console.log('Debit Payment:', this.paymentForm.get('debitPayment')?.value);
    console.log('Rebate:', this.paymentForm.get('rebate')?.value);
  
    // Print Creditor Details section nicely
    console.log('\n--- Creditor Details ---');
    console.log('Creditor Type:', this.paymentForm.get('creditorType')?.value);
    console.log('Creditor Name:', this.paymentForm.get('creditorName')?.value);
    console.log('Creditor Information:', this.paymentForm.get('creditorInformation')?.value);
    console.log('Comments:', this.paymentForm.get('comments')?.value);
  
    if (this.paymentForm.valid) {
      console.log('\n✅ Form is VALID - Ready to save/submit');
      // Your API call here
    } else {
      console.log('\n❌ Form is INVALID - Check required fields');
    }
  }
}