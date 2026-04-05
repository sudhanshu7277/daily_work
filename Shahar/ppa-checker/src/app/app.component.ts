import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CheckerFormComponent,
  CheckerComponentInput,
  CheckerActionResponse,
  FormFieldConfig
} from 'payment-checker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CheckerFormComponent],
  template: `
    <pc-checker-form
      [checkerInput]="checkerInput"
      [fieldConfig]="fieldConfig"
      (actionCompleted)="onActionCompleted($event)">
    </pc-checker-form>
  `
})
export class AppComponent {

  checkerInput: CheckerComponentInput = {
    applicationName: 'ADR',
    applicationModule: 'ADR',
    region: 'US',
    checkerGetUrl: '/api/v1/pain001/checker/get',
    checkerActionUrl: '/api/v1/pain001/checker/action',
  };

  fieldConfig: FormFieldConfig[] = [
    { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false },
    { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false },
    { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false },
    { fieldName: 'debtorName', label: 'Debtor Name', hidden: false },
    { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false },
    { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false },
    { fieldName: 'debtorAddressLines', label: 'Debtor Address Line 1', hidden: false },
    { fieldName: 'debtorStreetName', label: 'Debtor Street', hidden: false },
    { fieldName: 'debtorBuildingNumber', label: 'Debtor Building Number', hidden: false },
    { fieldName: 'debtorPostalCode', label: 'Debtor Postal Code', hidden: false },
    { fieldName: 'debtorTownName', label: 'Debtor Town / City Name', hidden: false },
    { fieldName: 'debtorCountrySubDivision', label: 'Debtor State', hidden: false },
    { fieldName: 'debtorCountryCode', label: 'Debtor Country', hidden: false },
    { fieldName: 'debtorSortCodeUK', label: 'Debtor Sort Code', hidden: false },
    { fieldName: 'debtorSortCodeUS', label: 'Debtor Sort Code (US)', hidden: false },
    { fieldName: 'firstIntermediaryBankBIC', label: '1st Intermediary Bank SWIFT Code', hidden: false },
    { fieldName: 'firstIntermediaryBankRoutingCode', label: '1st Intermediary Bank Routing Code', hidden: false },
    { fieldName: 'firstIntermediaryBankName', label: '1st Intermediary Bank Name', hidden: false },
    { fieldName: 'firstIntermediaryBankCountryCode', label: '1st Intermediary Bank Country Code', hidden: false },
    { fieldName: 'firstIntermediaryBankAccountId', label: '1st Intermediary Account Number', hidden: false },
    { fieldName: 'secondIntermediaryBankBIC', label: '2nd Intermediary Bank SWIFT Code', hidden: false },
    { fieldName: 'secondIntermediaryBankRoutingCode', label: '2nd Intermediary Bank Routing Code', hidden: false },
    { fieldName: 'secondIntermediaryBankName', label: '2nd Intermediary Bank Name', hidden: false },
    { fieldName: 'secondIntermediaryBankCountryCode', label: '2nd Intermediary Bank Country Code', hidden: false },
    { fieldName: 'secondIntermediaryBankAccountId', label: '2nd Intermediary Account Number', hidden: false },
    { fieldName: 'creditorName', label: 'Creditor Name', hidden: false },
    { fieldName: 'creditorAccount', label: 'Creditor Account Number', hidden: false },
    { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', hidden: false },
    { fieldName: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', hidden: false },
    { fieldName: 'creditorAgentPostalAddress', label: 'Creditor Agent Account Number', hidden: false },
    { fieldName: 'creditorAddressLines', label: 'Creditor Address Line 1', hidden: false },
    { fieldName: 'creditorStreetName', label: 'Creditor Street', hidden: false },
    { fieldName: 'creditorBuildingNumber', label: 'Creditor Building Number', hidden: false },
    { fieldName: 'creditorPostalCode', label: 'Creditor Postal Code', hidden: false },
    { fieldName: 'creditorTownName', label: 'Creditor Town / City Name', hidden: false },
    { fieldName: 'creditorCountrySubDivision', label: 'Creditor State', hidden: false },
    { fieldName: 'creditorCountryCode', label: 'Creditor Country', hidden: false },
    { fieldName: 'creditorSortCodeUK', label: 'Creditor Sort Code', hidden: false },
    { fieldName: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', hidden: false },
    { fieldName: 'ustrdPaymentDetails', label: 'Remittance Information', hidden: false },
    { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false },
    { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false },
    { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false },
    { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false },
  ];

  onActionCompleted(response: CheckerActionResponse): void {
    console.log('[App]', response.action, '— TXN:', response.transactionId);
  }
}
