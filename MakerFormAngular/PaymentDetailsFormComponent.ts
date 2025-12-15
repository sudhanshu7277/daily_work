import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-payment-details-form',
  templateUrl: './payment-details-form.component.html',
  styleUrls: ['./payment-details-form.component.scss'],
  standalone: true,
  imports: [
    import('@angular/forms').then(f => f.ReactiveFormsModule),
    import('@angular/common').then(c => c.CommonModule),
  ],
})
export class PaymentDetailsFormComponent implements OnInit {
  form!: FormGroup;

  dropdowns = {
    eventTypes: [] as string[],
    eventValueDates: [] as string[],
    eventRecordDates: [] as string[],
    entitlements: [] as string[],
    paymentTypes: [] as string[],
    paymentMethods: [] as string[],
    creditorWords: [] as string[],
  };

  // Empty arrays for future grid data
  paymentDenominationGrid: any[] = [];
  taxDetailsGrid: any[] = [];

  // Dummy readonly fields (fixed) on right panel above synchronized fields
  readonlyFields = {
    securityName: 'Sample Security',
    securityDescription: 'Corporate Bond Sample Description',
    couponNumber: 'C12345',
    paymentCurrency: 'USD',
    taxCode: 'TX01',
    taxType: 'Type A',
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize reactive form with default values
    this.form = this.fb.group({
      securityNumber: [''],
      eventType: [''],
      eventValueDate: [''],
      eventRecordDate: [''],
      entitlement: [''],
      paymentType: [''],
      paymentMethod: [''],
      paymentDate: [''],
      paymentAmount: [''],
      presenterPosition: [''],
      standardPayment: [false],
      target: [false],
      creditPayment: [false],
      fedwire: [false],
      creditorEntity: [''],
      creditorWord: [''],
      creditorInformation: [''],
      comments: [''],
    });

    this.loadDropdownData();
  }

  // Simulate async fetch of dropdown options
  private async loadDropdownData(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // simulate delay
    this.dropdowns.eventTypes = ['Event Type 1', 'Event Type 2'];
    this.dropdowns.eventValueDates = ['2024-06-25', '2024-06-26'];
    this.dropdowns.eventRecordDates = ['2024-06-20', '2024-06-21'];
    this.dropdowns.entitlements = ['Entitlement A', 'Entitlement B'];
    this.dropdowns.paymentTypes = ['Payment Type 1', 'Payment Type 2'];
    this.dropdowns.paymentMethods = ['Method 1', 'Method 2'];
    this.dropdowns.creditorWords = ['Word 1', 'Word 2'];
  }

  // Format date string for display on right panel
  formatDate(value: string | null): string {
    if (!value) return '–';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  }

  // Format text or fallback
  formatText(value: string | null): string {
    return value && value.trim() !== '' ? value : '–';
  }

  // Handler for "Select File" button
  onSelectFile(): void {
    alert('Select File clicked (stub)');
  }
}
