// Payment Details Child Template (e.g., payment-details.component.html):

<form #paymentForm="ngForm" [appFormValidator]="paymentForm">
  <!-- Your existing fields, e.g. -->
  <input name="securityId" ngModel required />
  <!-- ... other inputs -->
</form>



// Creditor Details Child Template (e.g., creditor-details.component.html):

<form #creditorForm="ngForm" [appFormValidator]="creditorForm">
  <!-- Your existing fields, e.g. -->
  <select name="creditorName" ngModel required></select>
  <!-- ... other inputs -->
</form>

// Payment Details Child TS (payment-details.component.ts):

import { Component, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({ ... })
export class PaymentDetailsComponent {
  @ViewChild('paymentForm', { static: true }) paymentForm!: NgForm;
  @ViewChild('paymentForm', { read: ElementRef, static: true }) paymentFormEl!: ElementRef<HTMLFormElement>;
}

//Creditor Details Child TS (creditor-details.component.ts):

import { Component, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({ ... })
export class CreditorDetailsComponent {
  @ViewChild('creditorForm', { static: true }) creditorForm!: NgForm;
  @ViewChild('creditorForm', { read: ElementRef, static: true }) creditorFormEl!: ElementRef<HTMLFormElement>;
}

// Parent Input component
//Parent TS (e.g., payment-entry-parent.component.ts):

import { Component, ViewChild } from '@angular/core';
import { PaymentDetailsComponent } from './payment-details.component'; // Adjust path
import { CreditorDetailsComponent } from './creditor-details.component'; // Adjust path

@Component({ ... })
export class PaymentEntryParentComponent {
  @ViewChild(PaymentDetailsComponent) paymentDetails!: PaymentDetailsComponent;
  @ViewChild(CreditorDetailsComponent) creditorDetails!: CreditorDetailsComponent;

  onSave() {
    // Trigger directive on first form
    this.paymentDetails.paymentFormEl.nativeElement.dispatchEvent(new Event('submit'));

    // Trigger directive on second form
    this.creditorDetails.creditorFormEl.nativeElement.dispatchEvent(new Event('submit'));

    // Check validity after triggers (directive will have marked touched if invalid)
    if (this.paymentDetails.paymentForm.valid && this.creditorDetails.creditorForm.valid) {
      // Proceed with save logic (e.g., API call)
      console.log('Both forms valid - saving data');
    } else {
      console.log('Validation failed - check forms');
      // Optional: show a global error message
    }
  }
}

// Parent Template (e.g., payment-entry-parent.component.html):

<app-payment-details></app-payment-details>
<app-creditor-details></app-creditor-details>

<button (click)="onSave()">Save Payment Data</button>