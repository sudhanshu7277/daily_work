
import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
import {
  Subject, EMPTY
} from 'rxjs';
import {
  debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError
} from 'rxjs/operators';
import {
  Pain001Model,
  PaymentComponentInput,
  MakerSubmitResponse,
  HardcapCheckResponse,
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
export class MakerFormComponent implements OnInit, OnDestroy {

  @Input() paymentInput!: PaymentComponentInput;
  @Input() initialData: Partial<Pain001Model> = {};
  @Output() submitted  = new EventEmitter<MakerSubmitResponse>();
  @Output() formChange = new EventEmitter<Partial<Pain001Model>>();

  form!: FormGroup;
  isSubmitting = false;
  showSuccessModal = false;
  showErrorModal   = false;
  submitResponse: MakerSubmitResponse | null = null;
  errorMessage = '';
  hardcapResponse: HardcapCheckResponse | null = null;
  hardcapChecking = false;

  readonly chargeBearerOptions  = CHARGE_BEARER_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;
  private destroy$ = new Subject<void>();

  constructor(
    private fb:         FormBuilder,
    private apiService: MakerApiService,
    private cdr:        ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.subscribeHardcap();
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => this.formChange.emit(val));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    const d  = { ...createEmptyPain001(), ...this.initialData };
    const pi = this.paymentInput || ({} as PaymentComponentInput);

    this.form = this.fb.group({
      requestedExecutionDate:       [d.requestedExecutionDate || '', Validators.required],
      instructedAmountCurrencyCode: [d.instructedAmountCurrencyCode || '', Validators.required],
      instructedAmount:             [d.instructedAmount || null, [Validators.required, Validators.min(0.01)]],
      debtorName:          [d.debtorName,          Validators.required],
      debtorAccountNumber: [d.debtorAccountNumber, Validators.required],
      debtorAgentBIC:      [d.debtorAgentBIC,      Validators.required],
      debtorAddressLines:       [d.debtorAddressLines       ?? ''],
      debtorAddressLines2:      [''],
      debtorStreetName:         [d.debtorStreetName         ?? ''],
      debtorBuildingNumber:     [d.debtorBuildingNumber     ?? ''],
      debtorPostalCode:         [d.debtorPostalCode         ?? ''],
      debtorTownName:           [d.debtorTownName           ?? ''],
      debtorCountrySubDivision: [d.debtorCountrySubDivision ?? ''],
      debtorCountryCode:        [d.debtorCountryCode        ?? ''],
      debtorSortCodeUK:         [d.debtorSortCodeUK         ?? ''],
      debtorSortCodeUS:         [d.debtorSortCodeUS         ?? ''],
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
      creditorName:                          [d.creditorName,                          Validators.required],
      creditorAccount:                       [d.creditorAccount,                       Validators.required],
      creditorAgentFinancialInstitutionBIC:  [d.creditorAgentFinancialInstitutionBIC,  Validators.required],
      creditorAgentFinancialInstitutionName: [d.creditorAgentFinancialInstitutionName, Validators.required],
      creditorAgentAccountNumber:            ['',                                       Validators.required],
      creditorAddressLines:       [d.creditorAddressLines       ?? ''],
      creditorAddressLines2:      [''],
      creditorStreetName:         [d.creditorStreetName         ?? ''],
      creditorBuildingNumber:     [d.creditorBuildingNumber     ?? ''],
      creditorPostalCode:         [d.creditorPostalCode         ?? ''],
      creditorTownName:           [d.creditorTownName           ?? ''],
      creditorCountrySubDivision: [d.creditorCountrySubDivision ?? ''],
      creditorCountryCode:        [d.creditorCountryCode        ?? ''],
      creditorSortCodeUK:         [d.creditorSortCodeUK         ?? ''],
      creditorSortCodeUS:         [d.creditorSortCodeUS         ?? ''],
      ustrdPaymentDetails:   [d.ustrdPaymentDetails ?? ''],
      painPaymentMethodType: [d.painPaymentMethodType, Validators.required],
      chargeBearer:    [d.chargeBearer    ?? ''],
      chargesAmount:   [d.chargesAmount   ?? 0],
      chargesAgentBIC: [d.chargesAgentBIC ?? ''],
      applicationName:   [(pi as any).applicationName   || ''],
      applicationModule: [(pi as any).applicationModule || ''],
      region:            [(pi as any).region            || ''],
      creditorAgentPostalAddress: [d.creditorAgentPostalAddress ?? '']
    });
  }

  private subscribeHardcap(): void {
    const amountCtrl = this.form.get('instructedAmount');
    if (!amountCtrl) return;
    amountCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(value => {
        this.hardcapChecking = true;
        this.hardcapResponse = null;
        this.cdr.markForCheck();
        const amount = parseFloat(value);
        return this.apiService.checkHardcap(
          {
            amount:            isNaN(amount) ? 0 : amount,
            currencyCode:      this.form.get('instructedAmountCurrencyCode')?.value || '',
            applicationName:   this.paymentInput?.applicationName   || '',
            applicationModule: this.paymentInput?.applicationModule || ''
          },
          this.paymentInput
        ).pipe(
          catchError(() => {
            this.hardcapChecking = false;
            this.cdr.markForCheck();
            return EMPTY;
          })
        );
      })
    ).subscribe(response => {
      this.hardcapChecking = false;
      this.hardcapResponse = response;
      this.cdr.markForCheck();
    });
  }

  get isFormValid(): boolean {
    return this.form.valid && this.hardcapResponse?.status === 'PASSED';
  }

  get hardcapPassed():  boolean { return this.hardcapResponse?.status === 'PASSED'; }
  get hardcapFailed():  boolean {
    return !!this.hardcapResponse && this.hardcapResponse.status !== 'PASSED';
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const errors = this.form.get(field)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required';
    if (errors['min'])      return 'Value must be greater than 0';
    return 'Invalid value';
  }

  onSubmit(): void {
    if (this.form.invalid || !this.hardcapPassed) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();
    const payload: Pain001Model = this.form.getRawValue();
    this.apiService.submitMakerForm(payload, this.paymentInput).subscribe({
      next: res => {
        this.isSubmitting    = false;
        this.submitResponse  = res;
        this.showSuccessModal = true;
        this.submitted.emit(res);
        this.cdr.markForCheck();
      },
      error: err => {
        this.isSubmitting  = false;
        this.errorMessage  = err.message || 'Submission failed. Please try again.';
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
