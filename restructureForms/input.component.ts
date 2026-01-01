import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Import all child components
import { PaymentDetailsFormComponent } from '../payment-details-form/payment-details-form.component';
import { CreditorDetailsFormComponent } from '../creditor-details-form/creditor-details-form.component';
import { PaymentDetailsSummaryComponent, PaymentSummary } from '../payment-details-summary/payment-details-summary.component';
import { PaymentDenominationGridComponent, DenominationRow } from '../payment-denomination-grid/payment-denomination-grid.component';
import { TaxDetailsComponent, TaxDetailRow } from '../tax-details/tax-details.component';
import { TabConfig } from 'src/app/shared/components/tab/tab.component';

@Component({
  selector: 'app-input-maker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaymentDetailsFormComponent,
    CreditorDetailsFormComponent,
    PaymentDetailsSummaryComponent,
    PaymentDenominationGridComponent,
    TaxDetailsComponent
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  paymentForm!: FormGroup;
  isPaymentFormValid = false;

  // Data for static components (populated from form or API)
  denominationData: DenominationRow[] = [];
  taxDetailsData: TaxDetailRow[] = [];
  paymentSummary!: PaymentSummary;

  tabs: TabConfig[] = [
    { title: 'Input', key: 'input' },
    { title: 'Authorise-Checker 1', key: 'checker1' },
    { title: 'Authorise-Checker 2', key: 'checker2' }
  ];
  activeTabKey = 'input';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize shared FormGroup with ALL fields from both forms
    this.paymentForm = this.fb.group({
      // Payment Details Form fields
      securityId: ['', Validators.required],
      eventType: ['', Validators.required],
      eventValueDate: ['', Validators.required],
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

      // Creditor Details Form fields
      creditorType: [''],
      creditorName: ['', Validators.required],
      creditorInformation: [''],
      comments: ['']
    });

    // Subscribe to form validity changes
    this.paymentForm.statusChanges?.subscribe(() => {
      this.isPaymentFormValid = this.paymentForm.valid;
    });

    // Initialize with empty data (will be populated from form/API)
    this.onTabChange('input');
  }

  onTabChange(key: string): void {
    console.log('tab value received from tab component: ', key);
    this.activeTabKey = key;
  }

  onAddDenominationRow(): void {
    const newRow: DenominationRow = {
      originalDenom: '',
      currentDenom: '',
      noOfPieces: 0,
      ratePerPiece: 0,
      subTotalExclCcy: 0,
      subTotalInclCcy: 0
    };
    this.denominationData = [...this.denominationData, newRow];
  }

  onRemoveDenominationRow(index: number): void {
    if (index >= 0 && index < this.denominationData.length) {
      this.denominationData = this.denominationData.filter((_, i) => i !== index);
    } else if (this.denominationData.length > 0) {
      this.denominationData = this.denominationData.slice(0, -1);
    }
  }

  onPaymentFormValidityChange(isValid: boolean): void {
    this.isPaymentFormValid = isValid;
  }

  onSavePayment(): void {
    console.log('Saving payment data...');
    // Implement save logic
  }

  onSubmitPayment(): void {
    if (!this.isPaymentFormValid) {
      console.log('Form is invalid. Please fill all mandatory fields.');
      this.paymentForm.markAllAsTouched(); // Show all errors
      return;
    }
    console.log('Submitting payment...');
    // Implement submit logic
  }
}