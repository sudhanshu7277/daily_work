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
  CHARGE_BEARER_OPTIONS,
  PAYMENT_METHOD_OPTIONS
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
  @Output() actionCompleted = new EventEmitter<CheckerActionResponse>();
  form!: FormGroup;
  isLoading    = true;
  loadError    = '';
  isActioning  = false;
  pendingAction: 'APPROVED' | 'REJECTED' | null = null;
  checkerData: CheckerGetResponse | null = null;
  showApprovedModal = false;
  showRejectedModal = false;
  showErrorModal    = false;
  actionResponse: CheckerActionResponse | null = null;
  errorMessage = '';

  readonly chargeBearerOptions  = CHARGE_BEARER_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  constructor(
    private fb:         FormBuilder,
    private apiService: CheckerApiService,
    private cdr:        ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initEmptyForm();
    this.loadData();
  }

  private initEmptyForm(): void {
    const disabled = (val: any) => ({ value: val, disabled: true });

    this.form = this.fb.group({
      debtorName:          [disabled('')],
      debtorAccountNumber: [disabled('')],
      debtorAgentBIC:      [disabled('')],
      debtorAddressLines:       [disabled('')],
      debtorAddressLines2:      [disabled('')],
      debtorStreetName:         [disabled('')],
      debtorBuildingNumber:     [disabled('')],
      debtorPostalCode:         [disabled('')],
      debtorTownName:           [disabled('')],
      debtorCountrySubDivision: [disabled('')],
      debtorCountryCode:        [disabled('')],
      debtorSortCodeUK:         [disabled('')],
      debtorSortCodeUS:         [disabled('')],
      firstIntermediaryBankBIC:          [disabled('')],
      firstIntermediaryBankRoutingCode:  [disabled('')],
      firstIntermediaryBankName:         [disabled('')],
      firstIntermediaryBankCountryCode:  [disabled('')],
      firstIntermediaryBankAccountId:    [disabled('')],
      secondIntermediaryBankBIC:         [disabled('')],
      secondIntermediaryBankRoutingCode: [disabled('')],
      secondIntermediaryBankName:        [disabled('')],
      secondIntermediaryBankCountryCode: [disabled('')],
      secondIntermediaryBankAccountId:   [disabled('')],
      creditorName:                          [disabled('')],
      creditorAccount:                       [disabled('')],
      creditorAgentFinancialInstitutionBIC:  [disabled('')],
      creditorAgentFinancialInstitutionName: [disabled('')],
      creditorAgentAccountNumber:            [disabled('')],
      creditorAddressLines:       [disabled('')],
      creditorAddressLines2:      [disabled('')],
      creditorStreetName:         [disabled('')],
      creditorBuildingNumber:     [disabled('')],
      creditorPostalCode:         [disabled('')],
      creditorTownName:           [disabled('')],
      creditorCountrySubDivision: [disabled('')],
      creditorCountryCode:        [disabled('')],
      creditorSortCodeUK:         [disabled('')],
      creditorSortCodeUS:         [disabled('')],
      ustrdPaymentDetails:   [disabled('')],
      painPaymentMethodType: [disabled('')],
      chargeBearer:    [disabled('')],
      chargesAmount:   [disabled(0)],
      chargesAgentBIC: [disabled('')],
      requestedExecutionDate:       [disabled('')],
      instructedAmount:             [disabled(0)],
      instructedAmountCurrencyCode: [disabled('')],
      applicationName:              [disabled('')],
      applicationModule:            [disabled('')],
      region:                       [disabled('')]
    });
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
    this.form.patchValue({
      debtorName:                          d.debtorName,
      debtorAccountNumber:                 d.debtorAccountNumber,
      debtorAgentBIC:                      d.debtorAgentBIC,
      debtorAddressLines:                  d.debtorAddressLines       ?? '',
      debtorAddressLines2:                 d.debtorAddressLines2      ?? '',
      debtorStreetName:                    d.debtorStreetName         ?? '',
      debtorBuildingNumber:                d.debtorBuildingNumber     ?? '',
      debtorPostalCode:                    d.debtorPostalCode         ?? '',
      debtorTownName:                      d.debtorTownName           ?? '',
      debtorCountrySubDivision:            d.debtorCountrySubDivision ?? '',
      debtorCountryCode:                   d.debtorCountryCode        ?? '',
      debtorSortCodeUK:                    d.debtorSortCodeUK         ?? '',
      firstIntermediaryBankBIC:            d.firstIntermediaryBankBIC          ?? '',
      firstIntermediaryBankRoutingCode:    d.firstIntermediaryBankRoutingCode  ?? '',
      firstIntermediaryBankName:           d.firstIntermediaryBankName         ?? '',
      firstIntermediaryBankCountryCode:    d.firstIntermediaryBankCountryCode  ?? '',
      firstIntermediaryBankAccountId:      d.firstIntermediaryBankAccountId    ?? '',
      secondIntermediaryBankBIC:           d.secondIntermediaryBankBIC         ?? '',
      secondIntermediaryBankRoutingCode:   d.secondIntermediaryBankRoutingCode ?? '',
      secondIntermediaryBankName:          d.secondIntermediaryBankName        ?? '',
      secondIntermediaryBankCountryCode:   d.secondIntermediaryBankCountryCode ?? '',
      secondIntermediaryBankAccountId:     d.secondIntermediaryBankAccountId   ?? '',
      creditorName:                        d.creditorName,
      creditorAccount:                     d.creditorAccount,
      creditorAgentFinancialInstitutionBIC:  d.creditorAgentFinancialInstitutionBIC,
      creditorAgentFinancialInstitutionName: d.creditorAgentFinancialInstitutionName,
      creditorAgentAccountNumber:            d.creditorAgentAccountNumber,
      creditorAddressLines:       d.creditorAddressLines       ?? '',
      creditorAddressLines2:      d.creditorAddressLines2      ?? '',
      creditorStreetName:         d.creditorStreetName         ?? '',
      creditorBuildingNumber:     d.creditorBuildingNumber     ?? '',
      creditorPostalCode:         d.creditorPostalCode         ?? '',
      creditorTownName:           d.creditorTownName           ?? '',
      creditorCountrySubDivision: d.creditorCountrySubDivision ?? '',
      creditorCountryCode:        d.creditorCountryCode        ?? '',
      creditorSortCodeUK:         d.creditorSortCodeUK         ?? '',
      ustrdPaymentDetails:        d.ustrdPaymentDetails        ?? '',
      painPaymentMethodType:      d.painPaymentMethodType,
      chargeBearer:               d.chargeBearer               ?? '',
      chargesAmount:              d.chargesAmount              ?? 0,
      chargesAgentBIC:            d.chargesAgentBIC            ?? '',
      requestedExecutionDate:     d.requestedExecutionDate,
      instructedAmount:           d.instructedAmount,
      instructedAmountCurrencyCode: d.instructedAmountCurrencyCode,
      applicationName:            d.applicationName            ?? '',
      applicationModule:          d.applicationModule          ?? '',
      region:                     d.region                     ?? ''
    }, { emitEvent: false });
  }

  onAction(action: 'APPROVED' | 'REJECTED'): void {
    if (!this.checkerData || this.isActioning) return;

    this.isActioning   = true;
    this.pendingAction = action;
    this.cdr.markForCheck();
    const formData: Pain001Model = this.form.getRawValue();

    const request = {
      transactionId: this.checkerData.transactionId,
      action,
      formData
    };

    this.apiService.submitCheckerAction(request, this.checkerInput).subscribe({
      next: (res: CheckerActionResponse) => {
        this.isActioning   = false;
        this.pendingAction = null;
        this.actionResponse = res;

        if (action === 'APPROVED') this.showApprovedModal = true;
        else                       this.showRejectedModal = true;

        this.actionCompleted.emit(res);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.isActioning   = false;
        this.pendingAction = null;
        this.errorMessage  = err.message || 'Action failed. Please try again.';
        this.showErrorModal = true;
        this.cdr.markForCheck();
      }
    });
  }

  retryLoad(): void {
    this.loadData();
  }

  closeModal(): void {
    this.showApprovedModal = false;
    this.showRejectedModal = false;
    this.showErrorModal    = false;
    this.cdr.markForCheck();
  }
}
