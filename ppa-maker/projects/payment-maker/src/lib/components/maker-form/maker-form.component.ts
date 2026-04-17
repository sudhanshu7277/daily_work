// ============================================================
// maker-form.component.ts — payment-maker v1.0.0
//
// FORM FIELDS COME ENTIRELY FROM THE PARENT via [fieldConfig].
//
// buildForm() iterates over fieldConfig and creates one FormControl
// per entry. No field is hardcoded inside this component.
//
// Backward compatibility:
//   If parent passes fieldConfig = [] (or omits it), the component
//   falls back to DEFAULT_FIELD_CONFIG which includes every Pain001
//   field with its built-in defaults — same as the previous behaviour.
//
// How it works:
//   1. Parent passes FormFieldConfig[] describing every field it wants
//   2. buildForm() loops that array → one FormControl per entry
//   3. hidden: true  → control created with no validators, *ngIf hides it
//   4. required: true → Validators.required added (core fields always required)
//   5. label: 'x'    → shown in template via getLabel()
//   6. value: any    → used as the initial control value
// ============================================================

import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ValidatorFn, ReactiveFormsModule
} from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError } from 'rxjs/operators';
import {
  Pain001Model,
  PaymentComponentInput,
  MakerSubmitResponse,
  HardcapCheckResponse,
  FormFieldConfig,
  ALWAYS_REQUIRED_FIELDS,
  DEFAULT_FIELD_CONFIG,
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

  /**
   * Fields to show in the form. Each entry is a FormFieldConfig.
   * The form is built entirely from this array.
   * If empty or omitted → DEFAULT_FIELD_CONFIG is used (all fields shown).
   *
   * Example — show only core debtor + creditor fields:
   *   fieldConfig = [
   *     { fieldName: 'requestedExecutionDate',  hidden: false, required: true },
   *     { fieldName: 'instructedAmountCurrencyCode', hidden: false, required: true },
   *     { fieldName: 'instructedAmount',        hidden: false, required: true },
   *     { fieldName: 'debtorName',              hidden: false, required: true },
   *     { fieldName: 'debtorAccountNumber',     hidden: false, required: true },
   *     { fieldName: 'debtorAgentBIC',          hidden: false, required: true },
   *     { fieldName: 'creditorName',            hidden: false, required: true },
   *     { fieldName: 'creditorAccount',         hidden: false, required: true },
   *     { fieldName: 'creditorAgentFinancialInstitutionBIC',  hidden: false, required: true },
   *     { fieldName: 'creditorAgentFinancialInstitutionName', hidden: false, required: true },
   *     { fieldName: 'creditorAgentPostalAddress',            hidden: false, required: true },
   *     { fieldName: 'painPaymentMethodType',   hidden: false, required: true },
   *   ]
   *
   * Example — show all fields but override a label and hide one:
   *   fieldConfig = DEFAULT_FIELD_CONFIG.map(f =>
   *     f.fieldName === 'debtorName'
   *       ? { ...f, label: 'Sender Name' }
   *       : f.fieldName === 'debtorSortCodeUS'
   *       ? { ...f, hidden: true }
   *       : f
   *   )
   */
  @Input() fieldConfig: FormFieldConfig[] = [];

  @Output() submitted  = new EventEmitter<MakerSubmitResponse>();
  @Output() formChange = new EventEmitter<Partial<Pain001Model>>();

  form!: FormGroup;
  isSubmitting      = false;
  showSuccessModal  = false;
  showErrorModal    = false;
  submitResponse: MakerSubmitResponse | null = null;
  errorMessage      = '';
  hardcapResponse: HardcapCheckResponse | null = null;
  hardcapChecking   = false;

  readonly chargeBearerOptions  = CHARGE_BEARER_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  // The resolved config — either parent-supplied or the default
  resolvedConfig: FormFieldConfig[] = [];

  // Fast lookup: fieldName → config
  private configMap = new Map<string, FormFieldConfig>();

  private destroy$ = new Subject<void>();

  constructor(
    private fb:         FormBuilder,
    private apiService: MakerApiService,
    private cdr:        ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Resolve config: use parent input if non-empty, otherwise default
    this.resolvedConfig = (this.fieldConfig && this.fieldConfig.length > 0)
      ? this.fieldConfig
      : DEFAULT_FIELD_CONFIG;

    // Build fast lookup map
    this.configMap.clear();
    this.resolvedConfig.forEach(cfg => this.configMap.set(cfg.fieldName as string, cfg));

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

  // ── isHidden / getLabel — used by template ───────────────────
  isHidden(fieldName: string): boolean {
    return this.configMap.get(fieldName)?.hidden === true;
  }

  getLabel(fieldName: string, defaultLabel: string): string {
    return this.configMap.get(fieldName)?.label ?? defaultLabel;
  }

  // ── Build FormGroup from resolvedConfig ──────────────────────
  // This is the key change: we iterate resolvedConfig, not a
  // hardcoded list. Every control comes from what the parent gave us.
  private buildForm(): void {
    const empty  = createEmptyPain001();
    const pi     = this.paymentInput || ({} as PaymentComponentInput);
    const init   = this.initialData  || {};
    const controls: Record<string, any> = {};

    for (const cfg of this.resolvedConfig) {
      const name = cfg.fieldName as string;

      // Value priority: cfg.value → initialData → empty model
      const value = cfg.value !== undefined
        ? cfg.value
        : (init as any)[name] !== undefined
          ? (init as any)[name]
          : (empty as any)[name] ?? '';

      // Validators: hidden fields get none; visible fields respect required
      const validators: ValidatorFn[] = [];
      if (!cfg.hidden) {
        const alwaysRequired = ALWAYS_REQUIRED_FIELDS.includes(cfg.fieldName);
        if (alwaysRequired || cfg.required) {
          validators.push(Validators.required);
        }
        if (name === 'instructedAmount') {
          validators.push(Validators.min(0.01));
        }
      }

      controls[name] = [value, validators];
    }

    // Always add context fields (not in Pain001Model, never shown in UI)
    controls['applicationName']   = [(pi as any).applicationName   || ''];
    controls['applicationModule'] = [(pi as any).applicationModule || ''];
    controls['region']            = [(pi as any).region            || ''];

    // UI-only address line 2 fields (not in Pain001Model)
    if (!controls['debtorAddressLines2'])  controls['debtorAddressLines2']  = [''];
    if (!controls['creditorAddressLines2']) controls['creditorAddressLines2'] = [''];

    // creditorAgentAccountNumber is the UI name for creditorAgentPostalAddress
    // ensure it's present if the parent included creditorAgentPostalAddress
    // if (controls['creditorAgentPostalAddress'] && !controls['creditorAgentAccountNumber']) {
    //   controls['creditorAgentAccountNumber'] = controls['creditorAgentPostalAddress'];
    //   delete controls['creditorAgentPostalAddress'];
    // }

    if (controls['creditorAgentPostalAddress']) {
      const existing = controls['creditorAgentPostalAddress'];
      // Create creditorAgentAccountNumber with the value AND Validators.required explicitly
      controls['creditorAgentAccountNumber'] = [existing[0], [Validators.required]];
      delete controls['creditorAgentPostalAddress'];
    }

    this.form = this.fb.group(controls);
  }

  // ── Hardcap check — debounced on Transaction Amount ──────────
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

  // ── Submit gate ───────────────────────────────────────────────
  // Blocked if form invalid OR if Transaction Amount is visible and
  // hardcap has not passed

  // get isFormValid(): boolean {
  //   if (!this.form.valid) return false;
  //   if (!this.isHidden('instructedAmount') && this.hardcapResponse?.status !== 'PASSED') {return false;}
  //   return true;
  // }

  get isFormValid(): boolean {
    // Gate 1 — all required form controls must be filled
    if (!this.form.valid) return false;
  
    // Gate 2 — if Transaction Amount is visible, hardcap must have passed
    if (!this.isHidden('instructedAmount') && this.hardcapResponse?.status !== 'PASSED') return false;
  
    return true;
  }

  get hardcapPassed(): boolean { return this.hardcapResponse?.status === 'PASSED'; }
  get hardcapFailed(): boolean {
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
    if (!this.isFormValid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const payload: Pain001Model = this.form.getRawValue();

    this.apiService.submitMakerForm(payload, this.paymentInput).subscribe({
      next: (res: any) => {
        this.submitResponse = res;
        this.showSuccessModal = true;
        this.submitted.emit(res);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isSubmitting   = false;
        if(err.message || err.error || err.error.error) {
          this.errorMessage = err.message || err.error.error || JSON.stringify(err.error) || 'Submission failed. Please try again.';
        }
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
