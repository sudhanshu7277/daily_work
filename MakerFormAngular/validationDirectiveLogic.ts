// Add a Public Method to Each Child Component to Trigger Validation

//payment-details-form.component.ts

import { Component, ElementRef, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({...})
export class PaymentDetailsFormComponent {
  @Input() paymentForm!: FormGroup;  // Assuming you pass it or create it here

  constructor(private elRef: ElementRef) {}

  // Public method to trigger validation from parent
  public triggerValidation() {
    const formElement = this.elRef.nativeElement.querySelector('form');
    if (formElement) {
      formElement.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }
}


//creditor-details-form.component.ts

import { Component, ElementRef, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({...})
export class CreditorDetailsFormComponent {
  @Input() creditorForm!: FormGroup;

  constructor(private elRef: ElementRef) {}

  public triggerValidation() {
    const formElement = this.elRef.nativeElement.querySelector('form');
    if (formElement) {
      const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });
      const dispatched = formElement.dispatchEvent(event);
      console.log('Submit event dispatched for this form:', dispatched);  // Debug: true if not canceled
    } else {
      console.log('Form element not found in this component');
    }
  }
}


// Call It from the Parent on "Save Payment Data" Click

//payment-entry-parent.component.ts (or wherever the button lives)

import { Component, ViewChild } from '@angular/core';
import { PaymentDetailsFormComponent } from '../payment-details-form/payment-details-form.component';
import { CreditorDetailsFormComponent } from '../creditor-details-form/creditor-details-form.component';

@Component({...})
export class PaymentEntryParentComponent {
  // @ViewChild(PaymentDetailsFormComponent) paymentFormComp!: PaymentDetailsFormComponent;
  // @ViewChild(CreditorDetailsFormComponent) creditorFormComp!: CreditorDetailsFormComponent;
  <app-payment-details-form #paymentComp></app-payment-details-form>
<app-creditor-details-form #creditorComp></app-creditor-details-form>

@ViewChild('paymentComp') paymentFormComp!: PaymentDetailsFormComponent;
@ViewChild('creditorComp') creditorFormComp!: CreditorDetailsFormComponent;

<button (click)="onSave()">Save Payment Data</button>

  onSave() {
    console.log('Payment Form Comp:', this.paymentFormComp);  // Should log the component object
    console.log('Creditor Form Comp:', this.creditorFormComp);  // If undefined or null, @ViewChild is failing
  
    this.paymentFormComp?.triggerValidation();
    this.creditorFormComp?.triggerValidation();
  
    const isValid = 
      this.paymentFormComp?.paymentForm?.valid && 
      this.creditorFormComp?.creditorForm?.valid;
  
    if (isValid) {
      console.log('Both forms valid → Saving...');
      // your save code
    } else {
      console.log('Validation failed');
    }
  }

// Parent Template (no change needed to button):

<button (click)="onSave()">Save Payment Data</button>















// // Payment Details Child Template (e.g., payment-details.component.html):

// <form #paymentForm="ngForm" [appFormValidator]="paymentForm">
//   <!-- Your existing fields, e.g. -->
//   <input name="securityId" ngModel required />
//   <!-- ... other inputs -->
// </form>



// // Creditor Details Child Template (e.g., creditor-details.component.html):

// <form #creditorForm="ngForm" [appFormValidator]="creditorForm">
//   <!-- Your existing fields, e.g. -->
//   <select name="creditorName" ngModel required></select>
//   <!-- ... other inputs -->
// </form>

// // Payment Details Child TS (payment-details.component.ts):

// import { Component, ViewChild } from '@angular/core';
// import { ElementRef } from '@angular/core';
// import { NgForm } from '@angular/forms';

// @Component({ ... })
// export class PaymentDetailsComponent {
//   @ViewChild('paymentForm', { static: true }) paymentForm!: NgForm;
//   @ViewChild('paymentForm', { read: ElementRef, static: true }) paymentFormEl!: ElementRef<HTMLFormElement>;
// }

// //Creditor Details Child TS (creditor-details.component.ts):

// import { Component, ViewChild } from '@angular/core';
// import { ElementRef } from '@angular/core';
// import { NgForm } from '@angular/forms';

// @Component({ ... })
// export class CreditorDetailsComponent {
//   @ViewChild('creditorForm', { static: true }) creditorForm!: NgForm;
//   @ViewChild('creditorForm', { read: ElementRef, static: true }) creditorFormEl!: ElementRef<HTMLFormElement>;
// }

// // Parent Input component
// //Parent TS (e.g., payment-entry-parent.component.ts):

// import { Component, ViewChild } from '@angular/core';
// import { PaymentDetailsComponent } from './payment-details.component'; // Adjust path
// import { CreditorDetailsComponent } from './creditor-details.component'; // Adjust path

// @Component({ ... })
// export class PaymentEntryParentComponent {
//   @ViewChild(PaymentDetailsComponent) paymentDetails!: PaymentDetailsComponent;
//   @ViewChild(CreditorDetailsComponent) creditorDetails!: CreditorDetailsComponent;

//   onSave() {
//     // Trigger directive on first form
//     this.paymentDetails.paymentFormEl.nativeElement.dispatchEvent(new Event('submit'));

//     // Trigger directive on second form
//     this.creditorDetails.creditorFormEl.nativeElement.dispatchEvent(new Event('submit'));

//     // Check validity after triggers (directive will have marked touched if invalid)
//     if (this.paymentDetails.paymentForm.valid && this.creditorDetails.creditorForm.valid) {
//       // Proceed with save logic (e.g., API call)
//       console.log('Both forms valid - saving data');
//     } else {
//       console.log('Validation failed - check forms');
//       // Optional: show a global error message
//     }
//   }
// }

// // Parent Template (e.g., payment-entry-parent.component.html):

// <app-payment-details></app-payment-details>
// <app-creditor-details></app-creditor-details>

// <button (click)="onSave()">Save Payment Data</button>