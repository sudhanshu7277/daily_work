// ============================================================
// maker-form.component.ts — payment-maker v1.0.0
//
// Required fields (must be filled for Submit to enable):
//   - debtorName, debtorAccountNumber, debtorAgentBIC
//   - creditorName, creditorAccount
//   - creditorAgentFinancialInstitutionBIC (Agent BIC)
//   - creditorAgentFinancialInstitutionName (Agent Bank Name)
//   - creditorAgentAccountNumber (Agent Account Number)
//   - painPaymentMethodType (Payment Type)
//
// Fields validated but NOT shown in the design as visible inputs
// (requestedExecutionDate, instructedAmount, instructedAmountCurrencyCode)
// are passed via paymentInput from the parent and auto-populated.
//
// All other fields are optional.
// ============================================================

import {
  Component, Input, Output, EventEmitter,
  OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
import {
  Pain001Model,
  PaymentComponentInput,
  MakerSubmitResponse,
  createEmptyPain001,
  CHARGE_BEARER_OPTIONS,
  PAYMENT_METHOD_OPTIONS
} from '../../models/pain001.model';
import { MakerApiService } from '../../services/maker-api.service';

@Component({
  selector: 'pm-maker-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './maker-form.component.html',
  styleUrls: ['../../shared/maker-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakerFormComponent implements OnInit {

  /** Injected by parent — app context + API config */
  @Input() paymentInput!: PaymentComponentInput;

  /** Optional: pre-populate form (e.g. edit mode) */
  @Input() initialData: Partial<Pain001Model> = {};

  /** Fires after successful POST API response — carries transactionId */
  @Output() submitted = new EventEmitter<MakerSubmitResponse>();

  /** Fires on every form value change for external state tracking */
  @Output() formChange = new EventEmitter<Partial<Pain001Model>>();

  form!: FormGroup;
  isSubmitting = false;
  showSuccessModal = false;
  showErrorModal = false;
  submitResponse: MakerSubmitResponse | null = null;
  errorMessage = '';

  readonly chargeBearerOptions  = CHARGE_BEARER_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private apiService: MakerApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    // Emit every value change so parent can track state externally
    this.form.valueChanges.subscribe(val => this.formChange.emit(val));
  }

  private buildForm(): void {
    const d  = { ...createEmptyPain001(), ...this.initialData };
    const pi = this.paymentInput || ({} as PaymentComponentInput);

    this.form = this.fb.group({

      // ── DEBTOR INFORMATION ──────────────────────────────────
      // All 3 are REQUIRED — these drive the submit button state
      debtorName:          [d.debtorName,          Validators.required],
      debtorAccountNumber: [d.debtorAccountNumber, Validators.required],
      debtorAgentBIC:      [d.debtorAgentBIC,      Validators.required],

      // ── DEBTOR ADDRESS (all optional) ───────────────────────
      debtorAddressLines:       [d.debtorAddressLines       ?? ''],
      debtorAddressLines2:      [''],          // UI-only, not in Pain001Model
      debtorStreetName:         [d.debtorStreetName         ?? ''],
      debtorBuildingNumber:     [d.debtorBuildingNumber     ?? ''],
      debtorPostalCode:         [d.debtorPostalCode         ?? ''],
      debtorTownName:           [d.debtorTownName           ?? ''],
      debtorCountrySubDivision: [d.debtorCountrySubDivision ?? ''],
      debtorCountryCode:        [d.debtorCountryCode        ?? ''],
      debtorSortCodeUK:         [d.debtorSortCodeUK         ?? ''],
      debtorSortCodeUS:         [d.debtorSortCodeUS         ?? ''],

      // ── INTERMEDIARY BANKS (all optional) ───────────────────
      firstIntermediaryBankBIC:          [d.firstIntermediaryBankBIC          ?? ''],
      firstIntermediaryBankRoutingCode:  [d.firstIntermediaryBankRoutingCode  ?? ''],
      firstIntermediaryBankName:         [d.firstIntermediaryBankName         ?? ''],
      firstIntermediaryBankCountryCode:  [d.firstIntermediaryBankCountryCode  ?? ''],
      firstIntermediaryBankAccountId:    [d.firstIntermediaryBankAccountId    ?? ''],
      secondIntermediaryBankBIC:         [d.secondIntermediaryBankBIC         ?? ''],
      secondIntermediaryBankRoutingCode: [d.secondIntermediaryBankRoutingCode ?? ''],
      secondIntermediaryBankName:        [d.secondIntermediaryBankName        ?? ''],
      secondIntermediaryBankCountryCode: [d.secondIntermediaryBankCountryCode ?? ''],
      secondIntermediaryBankAccountId:   [d.secondIntermediaryBankAccountId   ?? ''],

      // ── CREDITOR INFORMATION ────────────────────────────────
      // All 5 are REQUIRED — these drive the submit button state
      creditorName:                          [d.creditorName,                          Validators.required],
      creditorAccount:                       [d.creditorAccount,                       Validators.required],
      creditorAgentFinancialInstitutionBIC:  [d.creditorAgentFinancialInstitutionBIC,  Validators.required],
      creditorAgentFinancialInstitutionName: [d.creditorAgentFinancialInstitutionName, Validators.required],
      creditorAgentAccountNumber:            ['',                                       Validators.required],

      // ── CREDITOR ADDRESS (all optional) ─────────────────────
      creditorAddressLines:       [d.creditorAddressLines       ?? ''],
      creditorAddressLines2:      [''],          // UI-only, not in Pain001Model
      creditorStreetName:         [d.creditorStreetName         ?? ''],
      creditorBuildingNumber:     [d.creditorBuildingNumber     ?? ''],
      creditorPostalCode:         [d.creditorPostalCode         ?? ''],
      creditorTownName:           [d.creditorTownName           ?? ''],
      creditorCountrySubDivision: [d.creditorCountrySubDivision ?? ''],
      creditorCountryCode:        [d.creditorCountryCode        ?? ''],
      creditorSortCodeUK:         [d.creditorSortCodeUK         ?? ''],
      creditorSortCodeUS:         [d.creditorSortCodeUS         ?? ''],

      // ── ADDITIONAL DETAILS ──────────────────────────────────
      ustrdPaymentDetails:   [d.ustrdPaymentDetails   ?? ''],        // optional remittance
      painPaymentMethodType: [d.painPaymentMethodType,  Validators.required], // REQUIRED

      // ── CHARGE DETAILS (all optional) ───────────────────────
      chargeBearer:    [d.chargeBearer    ?? ''],
      chargesAmount:   [d.chargesAmount   ?? 0],
      chargesAgentBIC: [d.chargesAgentBIC ?? ''],

      // ── CONTEXT (auto-populated from paymentInput, not editable by user) ──
      // These are included in the POST payload automatically
      requestedExecutionDate:       [pi.requestedExecutionDate       || new Date().toISOString().split('T')[0]],
      instructedAmount:             [pi.instructedAmount             || 0],
      instructedAmountCurrencyCode: [pi.instructedAmountCurrencyCode || ''],
      applicationName:              [pi.applicationName              || ''],
      applicationModule:            [pi.applicationModule            || ''],
      region:                       [pi.region                       || ''],
      creditorAgentPostalAddress:   [d.creditorAgentPostalAddress    ?? '']
    });
  }

  /** True only when all required fields pass — drives submit button */
  get isFormValid(): boolean {
    return this.form.valid;
  }

  /** Shows red border + error message only after user has interacted with field */
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  /** Returns appropriate error message for a field */
  getError(field: string): string {
    const errors = this.form.get(field)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required';
    if (errors['min'])      return 'Value must be greater than 0';
    return 'Invalid value';
  }

  /** Called when user clicks Submit Payment */
  onSubmit(): void {
    // Safety check — button should already be disabled if invalid
    if (this.form.invalid) {
      // Mark all fields touched so errors are visible
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    // Build the complete Pain001 payload from all form values
    // getRawValue() includes disabled controls too
    const payload: Pain001Model = this.form.getRawValue();

    // POST to makerSubmitUrl (mocked by default, plug in real URL via paymentInput)
    this.apiService.submitMakerForm(payload, this.paymentInput).subscribe({
      next: res => {
        this.isSubmitting = false;
        this.submitResponse = res;
        this.showSuccessModal = true;
        // Emit to parent — carries transactionId for checker flow
        this.submitted.emit(res);
        this.cdr.markForCheck();
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Submission failed. Please try again.';
        this.showErrorModal = true;
        this.cdr.markForCheck();
      }
    });
  }

  closeModal(): void {
    this.showSuccessModal = false;
    this.showErrorModal   = false;
    this.cdr.markForCheck();
  }
}
