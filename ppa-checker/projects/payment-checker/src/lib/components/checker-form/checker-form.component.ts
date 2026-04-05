import {
  Component, Input, Output, EventEmitter,
  OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  Pain001Model,
  CheckerComponentInput,
  CheckerGetResponse,
  CheckerActionResponse,
  FormFieldConfig,
  DEFAULT_CHECKER_FIELD_CONFIG,
  CHARGE_BEARER_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  createMockCheckerGetResponse
} from '../../models/pain001.model';
import { CheckerApiService } from '../../services/checker-api.service';

@Component({
  selector: 'pc-checker-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './checker-form.component.html',
  styleUrls: ['../../shared/checker-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckerFormComponent implements OnInit, OnChanges {

  @Input() checkerInput!: CheckerComponentInput;
  @Input() visible: boolean = false;
  @Input() fieldConfig: FormFieldConfig[] = [];
  @Output() actionCompleted = new EventEmitter<CheckerActionResponse>();

  form!: FormGroup;
  isLoading    = false;
  loadError    = '';
  isActioning  = false;
  pendingAction: 'APPROVED' | 'REJECTED' | null = null;
  checkerData: CheckerGetResponse | null = null;
  originalAmount: number = 0;
  showApprovedModal = false;
  showRejectedModal = false;
  showErrorModal    = false;
  actionResponse: CheckerActionResponse | null = null;
  errorMessage = '';

  get amountModified(): boolean {
    const current = parseFloat(this.form?.get('instructedAmount')?.value);
    return !isNaN(current) && current !== this.originalAmount;
  }

  readonly chargeBearerOptions  = CHARGE_BEARER_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  resolvedConfig: FormFieldConfig[] = [];
  private configMap = new Map<string, FormFieldConfig>();
  private formBuilt = false;

  constructor(
    private fb:         FormBuilder,
    private apiService: CheckerApiService,
    private cdr:        ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resolveConfig();
    if (this.visible) {
      this.buildForm();
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true && !changes['visible'].firstChange) {
      if (!this.formBuilt) {
        this.resolveConfig();
        this.buildForm();
      }
      this.loadData();
    }
  }

  private resolveConfig(): void {
    this.resolvedConfig = (this.fieldConfig && this.fieldConfig.length > 0)
      ? this.fieldConfig
      : DEFAULT_CHECKER_FIELD_CONFIG;
    this.configMap.clear();
    this.resolvedConfig.forEach(cfg => this.configMap.set(cfg.fieldName as string, cfg));
  }

  isHidden(fieldName: string): boolean {
    return this.configMap.get(fieldName)?.hidden === true;
  }

  getLabel(fieldName: string, defaultLabel: string): string {
    return this.configMap.get(fieldName)?.label ?? defaultLabel;
  }

  private buildForm(): void {
    const controls: Record<string, any> = {};

    for (const cfg of this.resolvedConfig) {
      const name         = cfg.fieldName as string;
      const initialValue = cfg.value ?? '';

      if (name === 'instructedAmount') {
        controls[name] = [initialValue, [Validators.required, Validators.min(0.01)]];
      } else {
        controls[name] = [{ value: initialValue, disabled: true }];
      }
    }

    if (!controls['debtorAddressLines2'])   controls['debtorAddressLines2']   = [{ value: '', disabled: true }];
    if (!controls['creditorAddressLines2']) controls['creditorAddressLines2'] = [{ value: '', disabled: true }];

    if (controls['creditorAgentPostalAddress'] && !controls['creditorAgentAccountNumber']) {
      controls['creditorAgentAccountNumber'] = [{ value: '', disabled: true }];
    }

    controls['applicationName']   = [{ value: '', disabled: true }];
    controls['applicationModule'] = [{ value: '', disabled: true }];
    controls['region']            = [{ value: '', disabled: true }];

    this.form     = this.fb.group(controls);
    this.formBuilt = true;
  }

  private loadData(): void {
    this.isLoading  = true;
    this.loadError  = '';
    this.checkerData = null;
    this.cdr.markForCheck();

    this.apiService.getCheckerData(this.checkerInput).subscribe({
      next: (data: CheckerGetResponse) => {
        this.checkerData    = data;
        this.originalAmount = data.formData.instructedAmount;
        this.populateForm(data.formData);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.loadError = err.message || 'Failed to load transaction data.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private populateForm(d: Pain001Model): void {
    const patch: Record<string, any> = {};

    for (const cfg of this.resolvedConfig) {
      const name  = cfg.fieldName as string;
      patch[name] = cfg.value !== undefined ? cfg.value : (d as any)[name] ?? '';
    }

    patch['debtorAddressLines2']   = (d as any)['debtorAddressLines2']   ?? '';
    patch['creditorAddressLines2'] = (d as any)['creditorAddressLines2'] ?? '';

    if (this.form.get('creditorAgentAccountNumber')) {
      patch['creditorAgentAccountNumber'] = (d as any)['creditorAgentPostalAddress'] ?? '';
    }

    patch['applicationName']   = d.applicationName   ?? '';
    patch['applicationModule'] = d.applicationModule ?? '';
    patch['region']            = d.region            ?? '';

    this.form.patchValue(patch, { emitEvent: false });
  }

  onAction(action: 'APPROVED' | 'REJECTED'): void {
    if (!this.checkerData || this.isActioning) return;

    this.isActioning   = true;
    this.pendingAction = action;
    this.cdr.markForCheck();

    const formData: Pain001Model = this.form.getRawValue();
    const hasMismatch = action === 'APPROVED' && this.amountModified;

    if (hasMismatch) {
      const modifiedAmount = parseFloat(this.form.get('instructedAmount')?.value);
      this.apiService.submitAmountMismatch(
        {
          transactionId:  this.checkerData.transactionId,
          originalAmount: this.originalAmount,
          modifiedAmount,
          formData
        },
        this.checkerInput
      ).pipe(
        catchError(err => {
          console.warn('[Checker] Amount mismatch notification failed:', err.message);
          return of(null);
        }),
        switchMap(() => this.apiService.submitCheckerAction(
          { transactionId: this.checkerData!.transactionId, action, formData },
          this.checkerInput
        ))
      ).subscribe({
        next:  res => this.handleActionSuccess(res, action),
        error: err => this.handleActionError(err)
      });

    } else {
      this.apiService.submitCheckerAction(
        { transactionId: this.checkerData.transactionId, action, formData },
        this.checkerInput
      ).subscribe({
        next:  res => this.handleActionSuccess(res, action),
        error: err => this.handleActionError(err)
      });
    }
  }

  private handleActionSuccess(res: CheckerActionResponse, action: 'APPROVED' | 'REJECTED'): void {
    this.isActioning    = false;
    this.pendingAction  = null;
    this.actionResponse = res;
    if (action === 'APPROVED') this.showApprovedModal = true;
    else                       this.showRejectedModal = true;
    this.actionCompleted.emit(res);
    this.cdr.markForCheck();
  }

  private handleActionError(err: Error): void {
    this.isActioning    = false;
    this.pendingAction  = null;
    this.errorMessage   = err.message || 'Action failed. Please try again.';
    this.showErrorModal = true;
    this.cdr.markForCheck();
  }

  retryLoad(): void { this.loadData(); }

  closeModal(): void {
    this.showApprovedModal = false;
    this.showRejectedModal = false;
    this.showErrorModal    = false;
    this.cdr.markForCheck();
  }
}
