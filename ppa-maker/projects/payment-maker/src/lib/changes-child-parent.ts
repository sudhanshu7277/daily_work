// child component changes

@Output() formChange         = new EventEmitter<Partial<Pain001Model>>();
@Output() amountChange       = new EventEmitter<number>();        // ← hardcap amount to parent
@Output() formValidityChange = new EventEmitter<boolean>();       // ← validity state to parent
@Output() formSubmit         = new EventEmitter<Pain001Model>();  // ← full payload to parent

@Input() set hardcapResult(response: HardcapCheckResponse | null) {
    if (response !== undefined) {
      this.hardcapResponse = response;
      this.hardcapChecking = false;
      // Manually re-evaluate validity since hardcap status changed
      // but form.status did not change
      this.formValidityChange.emit(this.isFormValid);
      this.cdr.markForCheck();
    }
  }

  ngOnInit(): void {
    this.resolvedConfig = (this.fieldConfig && this.fieldConfig.length > 0)
      ? this.fieldConfig
      : DEFAULT_FIELD_CONFIG;
  
    this.configMap.clear();
    this.resolvedConfig.forEach(cfg =>
      this.configMap.set(cfg.fieldName as string, cfg));
  
    this.buildForm();
    this.subscribeAmountChange();
  
    // Emit form value to parent on every change
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => this.formChange.emit(val));
  
    // Emit form validity to parent on every change
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const valid = this.form.valid &&
          (this.isHidden('instructedAmount') || this.hardcapResponse?.status === 'PASSED');
        this.formValidityChange.emit(valid);
        this.cdr.markForCheck();
      });
  }


  // DELETE entire subscribeHardcap() method
// ADD this instead:
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
        this.amountChange.emit(amount); // parent calls hardcap API
      } else {
        this.hardcapChecking = false;
        this.hardcapResponse = null;
        this.cdr.markForCheck();
      }
    });
  }

  get isFormValid(): boolean {
    if (!this.form.valid) return false;
    if (!this.isHidden('instructedAmount') && this.hardcapResponse?.status !== 'PASSED') return false;
    return true;
  }

  // parent component changes

  submitForm(): void {
    if (!this.isFormValid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
  
    this.isSubmitting = true;
    this.cdr.markForCheck();
  
    const payload: Pain001Model = this.form.getRawValue();
  
    this.apiService.submitMakerForm(payload, this.paymentInput).subscribe({
      next: (res: MakerSubmitResponse) => {
        this.isSubmitting     = false;
        this.submitResponse   = res;
        this.showSuccessModal = true;
        this.submitted.emit(res);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isSubmitting   = false;
        this.errorMessage   = err.message || 'Submission failed. Please try again.';
        this.showErrorModal = true;
        this.cdr.markForCheck();
      }
    });
  }

  import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MakerFormComponent,
  PaymentComponentInput,
  MakerSubmitResponse,
  MakerApiService,
  HardcapCheckResponse,
  HardcapCheckRequest,
  Pain001Model,
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
      (formSubmit)="onFormSubmit($event)"
      (formChange)="onFormChange($event)">
    </pm-maker-form>

    <!-- Submit button lives in parent -->
    <div class="pm-action-bar">
      <button
        [disabled]="!isFormValid || isSubmitting"
        (click)="onSubmitClick()"
        class="pm-btn-submit">
        {{ isSubmitting ? 'Submitting...' : 'Submit Payment' }}
      </button>
    </div>
  `
})
export class AppComponent {

  @ViewChild(MakerFormComponent) makerForm!: MakerFormComponent;

  isFormValid   = false;
  isSubmitting  = false;
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

  // ── Child emits validity on every form change ─────────────────
  // Drives the submit button enabled/disabled state
  onFormValidityChange(isValid: boolean): void {
    this.isFormValid = isValid;
  }

  // ── Child emits debounced amount ──────────────────────────────
  // Parent makes hardcap API call and passes result back to child
  onAmountChange(amount: number): void {
    const request: HardcapCheckRequest = {
      amount,
      currencyCode:      'USD',
      applicationName:   this.paymentInput.applicationName,
      applicationModule: this.paymentInput.applicationModule
    };

    this.apiService.checkHardcap(request, this.paymentInput).subscribe({
      next: (res: HardcapCheckResponse) => {
        this.hardcapResult = res; // flows back to child via [hardcapResult]
      },
      error: () => {
        this.hardcapResult = null;
      }
    });
  }

  // ── Parent button click ───────────────────────────────────────
  // Triggers child onSubmit() which validates and emits formSubmit
  onSubmitClick(): void {
    this.makerForm.onSubmit();
  }

  // ── Child emits full Pain001Model payload ─────────────────────
  // Parent makes the submit API call
  onFormSubmit(payload: Pain001Model): void {
    this.isSubmitting = true;

    this.apiService.submitMakerForm(payload, this.paymentInput).subscribe({
      next: (res: MakerSubmitResponse) => {
        this.isSubmitting = false;
        this.makerForm.onSubmitSuccess(res); // child shows success modal
        console.log('TXN:', res.transactionId);
        console.log('Message:', res.message);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.makerForm.onSubmitError(
          err.message || 'Submission failed. Please try again.'
        ); // child shows error modal
      }
    });
  }

  // ── Optional — react to every field change ────────────────────
  onFormChange(formData: Partial<Pain001Model>): void {
    // use if needed
  }
}


// add this to chold for evaluating validation

ngOnInit(): void {
    this.resolvedConfig = (this.fieldConfig && this.fieldConfig.length > 0)
      ? this.fieldConfig
      : DEFAULT_FIELD_CONFIG;
  
    this.configMap.clear();
    this.resolvedConfig.forEach(cfg =>
      this.configMap.set(cfg.fieldName as string, cfg));
  
    this.buildForm();
    this.subscribeAmountChange();
  
    // Single subscription — emits form data AND evaluates validity on every keystroke
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        this.formChange.emit(val);
        this.evaluateValidity();  // ← called on every field change
      });
  }

private evaluateValidity(): void {
    const valid =
      this.form.valid &&
      (this.isHidden('instructedAmount') || this.hardcapResponse?.status === 'PASSED');
  
    console.log('[Maker] evaluateValidity called:', {
      formValid:     this.form.valid,
      hardcapStatus: this.hardcapResponse?.status,
      result:        valid
    });
  
    this.formValidityChange.emit(valid);
    this.cdr.markForCheck();
  }