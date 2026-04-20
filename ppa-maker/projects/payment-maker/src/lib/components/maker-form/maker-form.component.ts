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


/// CHANGES FOR HARDCAP API CALL AND FORM DATA TO PARENT COMPONENT

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  MakerFormComponent,
  PaymentComponentInput,
  MakerSubmitResponse,
  MakerApiService,
  HardcapCheckResponse,
  FormFieldConfig,
  DEFAULT_FIELD_CONFIG,
  Pain001Model
} from '@citi-icg-169779/payment-maker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MakerFormComponent],
  template: `
    <pm-maker-form
      [paymentInput]="paymentInput"
      [fieldConfig]="fieldConfig"
      [hardcapResult]="hardcapResult"
      (amountChange)="onAmountChange($event)"
      (formSubmit)="onFormSubmit($event)"
      (formChange)="onFormChange($event)">
    </pm-maker-form>
  `
})


import {
  Component, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MakerFormComponent,
  PaymentComponentInput,
  MakerSubmitResponse,
  MakerApiService,
  HardcapCheckResponse,
  FormFieldConfig,
  DEFAULT_FIELD_CONFIG
} from '@citi-icg-169779/payment-maker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MakerFormComponent],
  template: `
    <pm-maker-form
      [paymentInput]="paymentInput"
      [fieldConfig]="fieldConfig"
      [hardcapResult]="hardcapResult"
      (amountChange)="onAmountChange($event)"
      (formValidityChange)="onFormValidityChange($event)"
      (submitted)="onSubmitted($event)">
    </pm-maker-form>

    <!-- Submit button lives in parent -->
    <div class="action-bar">
      <button
        [disabled]="!isFormValid || isSubmitting"
        (click)="onSubmitClick()"
        class="submit-btn">
        {{ isSubmitting ? 'Submitting...' : 'Submit Payment' }}
      </button>
    </div>
  `
})
export class AppComponent {

  @ViewChild(MakerFormComponent) makerForm!: MakerFormComponent;

  isFormValid  = false;
  isSubmitting = false;
  hardcapResult: HardcapCheckResponse | null = null;

  paymentInput: PaymentComponentInput = {
    applicationName:   'YOUR_APP',
    applicationModule: 'YOUR_MODULE',
    region:            'US',
    useMockApi:        true,
    makerSubmitUrl:    'https://your-api.com/api/v1/pain001/maker/submit',
    hardcapCheckUrl:   'https://your-api.com/api/v1/pain001/hardcap/check',
  };

  fieldConfig: FormFieldConfig[] = DEFAULT_FIELD_CONFIG;

  constructor(private apiService: MakerApiService) {}

  // ── Form validity — emitted by component on every change ─────
  onFormValidityChange(isValid: boolean): void {
    this.isFormValid = isValid;
  }

  // ── Hardcap — parent makes API call, passes result back ──────
  onAmountChange(amount: number): void {
    this.apiService.checkHardcap(
      {
        amount,
        currencyCode:      'USD',
        applicationName:   this.paymentInput.applicationName,
        applicationModule: this.paymentInput.applicationModule
      },
      this.paymentInput
    ).subscribe({
      next: (response: HardcapCheckResponse) => {
        this.hardcapResult = response;
      },
      error: () => {
        this.hardcapResult = null;
      }
    });
  }

  // ── Parent button click — calls submitForm() on the child ────
  onSubmitClick(): void {
    this.isSubmitting = true;
    this.makerForm.submitForm();
  }

  // ── Submit response emitted back from child ──────────────────
  onSubmitted(res: MakerSubmitResponse): void {
    this.isSubmitting = false;
    console.log('TXN:', res.transactionId);
    console.log('Message:', res.message);
    // trigger checker
    this.showChecker = true;
  }
}

// Parent calls this after submit API responds successfully
showSuccess(response: MakerSubmitResponse): void {
  this.isSubmitting     = false;
  this.submitResponse   = response;
  this.showSuccessModal = true;
  this.cdr.markForCheck();
}

// Parent calls this if submit API fails
showError(message: string): void {
  this.isSubmitting   = false;
  this.errorMessage   = message;
  this.showErrorModal = true;
  this.cdr.markForCheck();
}

// CHANGES TO CHILD COMONENT (maker-form.component.ts):

// ADD these two new outputs
/** Fires (debounced 400ms) when user types Transaction Amount — parent calls hardcap API */
@Output() amountChange    = new EventEmitter<number>();

/** Fires on submit — parent receives full Pain001Model and calls maker submit API */
@Output() formSubmit      = new EventEmitter<Pain001Model>();

// ADD this input — parent passes hardcap response back in
@Input() set hardcapResult(response: HardcapCheckResponse | null) {
  if (response !== undefined) {
    this.hardcapResponse = response;
    this.hardcapChecking = false;
    this.cdr.markForCheck();
  }
}

// REMOVE this import
import { MakerApiService } from '../../services/maker-api.service';

// REMOVE from constructor
constructor(
  private fb:  FormBuilder,
  private cdr: ChangeDetectorRef
) {}

// REMOVE entire subscribeHardcap() method
// REMOVE subscribeHardcap() call from ngOnInit()

// ADD this new method
private subscribeAmountChange(): void {
  const amountCtrl = this.form.get('instructedAmount');
  if (!amountCtrl) return;

  amountCtrl.valueChanges.pipe(
    debounceTime(400),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  ).subscribe(value => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      this.hardcapChecking = true;
      this.hardcapResponse = null;
      this.cdr.markForCheck();
      this.amountChange.emit(amount); // parent receives and calls API
    } else {
      this.hardcapChecking = false;
      this.hardcapResponse = null;
      this.cdr.markForCheck();
    }
  });
}

// ADD call in ngOnInit()
ngOnInit(): void {
  ngOnInit(): void {
    this.resolvedConfig = (this.fieldConfig && this.fieldConfig.length > 0)
      ? this.fieldConfig
      : DEFAULT_FIELD_CONFIG;
  
    this.configMap.clear();
    this.resolvedConfig.forEach(cfg => this.configMap.set(cfg.fieldName as string, cfg));
  
    this.buildForm();
    this.subscribeAmountChange();
  
    // Emit form value changes to parent
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => this.formChange.emit(val));
  
    // Emit form validity changes to parent — drives the submit button
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const valid = this.form.valid &&
          (this.isHidden('instructedAmount') || this.hardcapResponse?.status === 'PASSED');
        this.formValidityChange.emit(valid);
        this.cdr.markForCheck();
      });
  }
}

onSubmit(): void {
  if (!this.isFormValid) {
    this.form.markAllAsTouched();
    this.cdr.markForCheck();
    return;
  }
  // Emit full form data to parent — parent calls submit API
  const payload: Pain001Model = this.form.getRawValue();
  this.formSubmit.emit(payload);
}


// template change to parent to use child component outputs instead of calling API directly from child

  [paymentInput]="paymentInput"
  [fieldConfig]="fieldConfig"
  [hardcapResult]="hardcapResult"
  (amountChange)="onAmountChange($event)"
  (formSubmit)="onFormSubmit($event)"
  (formChange)="onFormChange($event)">
</pm-maker-form>:

// parent component with submit button outside the child component

import {
  Component, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MakerFormComponent,
  PaymentComponentInput,
  MakerSubmitResponse,
  MakerApiService,
  HardcapCheckResponse,
  FormFieldConfig,
  DEFAULT_FIELD_CONFIG
} from '@citi-icg-169779/payment-maker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MakerFormComponent],
  template: `
    <pm-maker-form
      [paymentInput]="paymentInput"
      [fieldConfig]="fieldConfig"
      [hardcapResult]="hardcapResult"
      (amountChange)="onAmountChange($event)"
      (formValidityChange)="onFormValidityChange($event)"
      (submitted)="onSubmitted($event)">
    </pm-maker-form>

    <!-- Submit button lives in parent -->
    <div class="action-bar">
      <button
        [disabled]="!isFormValid || isSubmitting"
        (click)="onSubmitClick()"
        class="submit-btn">
        {{ isSubmitting ? 'Submitting...' : 'Submit Payment' }}
      </button>
    </div>
  `
})
export class AppComponent {

  @ViewChild(MakerFormComponent) makerForm!: MakerFormComponent;

  isFormValid  = false;
  isSubmitting = false;
  hardcapResult: HardcapCheckResponse | null = null;

  paymentInput: PaymentComponentInput = {
    applicationName:   'YOUR_APP',
    applicationModule: 'YOUR_MODULE',
    region:            'US',
    useMockApi:        true,
    makerSubmitUrl:    'https://your-api.com/api/v1/pain001/maker/submit',
    hardcapCheckUrl:   'https://your-api.com/api/v1/pain001/hardcap/check',
  };

  fieldConfig: FormFieldConfig[] = DEFAULT_FIELD_CONFIG;

  constructor(private apiService: MakerApiService) {}

  // ── Form validity — emitted by component on every change ─────
  onFormValidityChange(isValid: boolean): void {
    this.isFormValid = isValid;
  }

  // ── Hardcap — parent makes API call, passes result back ──────
  onAmountChange(amount: number): void {
    this.apiService.checkHardcap(
      {
        amount,
        currencyCode:      'USD',
        applicationName:   this.paymentInput.applicationName,
        applicationModule: this.paymentInput.applicationModule
      },
      this.paymentInput
    ).subscribe({
      next: (response: HardcapCheckResponse) => {
        this.hardcapResult = response;
      },
      error: () => {
        this.hardcapResult = null;
      }
    });
  }

  // ── Parent button click — calls submitForm() on the child ────
  onSubmitClick(): void {
    this.isSubmitting = true;
    this.makerForm.submitForm();
  }

  // ── Submit response emitted back from child ──────────────────
  onSubmitted(res: MakerSubmitResponse): void {
    this.isSubmitting = false;
    console.log('TXN:', res.transactionId);
    console.log('Message:', res.message);
    // trigger checker
    this.showChecker = true;
  }
}
