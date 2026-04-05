import {
  Component, Input, Output, EventEmitter,
  OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
export class CheckerFormComponent implements OnInit {

  @Input() checkerInput!: CheckerComponentInput;
  @Input() fieldConfig: FormFieldConfig[] = [];
  @Output() actionCompleted = new EventEmitter<CheckerActionResponse>();

  form!: FormGroup;
  isLoading = true;
  loadError = '';
  isActioning = false;
  pendingAction: 'APPROVED' | 'REJECTED' | null = null;
  checkerData: CheckerGetResponse | null = null;
  showApprovedModal = false;
  showRejectedModal = false;
  showErrorModal = false;
  actionResponse: CheckerActionResponse | null = null;
  errorMessage = '';

  readonly chargeBearerOptions = CHARGE_BEARER_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  resolvedConfig: FormFieldConfig[] = [];

  private configMap = new Map<string, FormFieldConfig>();

  constructor(
    private fb: FormBuilder,
    private apiService: CheckerApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.resolvedConfig = (this.fieldConfig && this.fieldConfig.length > 0)
      ? this.fieldConfig
      : DEFAULT_CHECKER_FIELD_CONFIG;

    this.configMap.clear();
    this.resolvedConfig.forEach(cfg => this.configMap.set(cfg.fieldName as string, cfg));

    this.buildForm();
    this.loadData();
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
      const name = cfg.fieldName as string;
      const initialValue = cfg.value ?? '';
      controls[name] = [{ value: initialValue, disabled: true }];
    }

    if (!controls['debtorAddressLines2']) controls['debtorAddressLines2'] = [{ value: '', disabled: true }];
    if (!controls['creditorAddressLines2']) controls['creditorAddressLines2'] = [{ value: '', disabled: true }];
    if (controls['creditorAgentPostalAddress'] && !controls['creditorAgentAccountNumber']) {
      controls['creditorAgentAccountNumber'] = [{ value: '', disabled: true }];
    }

    controls['applicationName'] = [{ value: '', disabled: true }];
    controls['applicationModule'] = [{ value: '', disabled: true }];
    controls['region'] = [{ value: '', disabled: true }];

    this.form = this.fb.group(controls);
  }

  private loadData(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.markForCheck();
    this.apiService.getCheckerData(this.checkerInput).subscribe({
      next: (data: CheckerGetResponse) => {
        this.checkerData = data;
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
      const name = cfg.fieldName as string;
      patch[name] = cfg.value !== undefined
        ? cfg.value
        : (d as any)[name] ?? '';
    }

    patch['debtorAddressLines2'] = (d as any)['debtorAddressLines2'] ?? '';
    patch['creditorAddressLines2'] = (d as any)['creditorAddressLines2'] ?? '';
    if (this.form.get('creditorAgentAccountNumber')) {
      patch['creditorAgentAccountNumber'] = (d as any)['creditorAgentPostalAddress'] ?? '';
    }

    patch['applicationName'] = d.applicationName ?? '';
    patch['applicationModule'] = d.applicationModule ?? '';
    patch['region'] = d.region ?? '';

    this.form.patchValue(patch, { emitEvent: false });
  }

  onAction(action: 'APPROVED' | 'REJECTED'): void {
    if (!this.checkerData || this.isActioning) return;

    this.isActioning = true;
    this.pendingAction = action;
    this.cdr.markForCheck();
    const formData: Pain001Model = this.form.getRawValue();
    this.apiService.submitCheckerAction(
      { transactionId: this.checkerData.transactionId, action, formData },
      this.checkerInput
    ).subscribe({
      next: (res: CheckerActionResponse) => {
        this.isActioning = false;
        this.pendingAction = null;
        this.actionResponse = res;
        if (action === 'APPROVED') this.showApprovedModal = true;
        else this.showRejectedModal = true;
        this.actionCompleted.emit(res);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.isActioning = false;
        this.pendingAction = null;
        this.errorMessage = err.message || 'Action failed. Please try again.';
        this.showErrorModal = true;
        this.cdr.markForCheck();
      }
    });
  }

  retryLoad(): void { this.loadData(); }

  closeModal(): void {
    this.showApprovedModal = false;
    this.showRejectedModal = false;
    this.showErrorModal = false;
    this.cdr.markForCheck();
  }
}
