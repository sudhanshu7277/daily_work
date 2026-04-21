export interface Pain001Model {
  requestedExecutionDate: string;
  debtorName: string;
  debtorAccountNumber: string;
  debtorAgentBIC: string;
  chargeBearer?: string;
  chargesAmount?: number;
  chargesAgentBIC?: string;
  debtorAddressLines?: string;
  debtorStreetName?: string;
  debtorBuildingNumber?: string;
  debtorPostalCode?: string;
  debtorTownName?: string;
  debtorCountrySubDivision?: string;
  debtorCountryCode?: string;
  debtorSortCodeUK?: string;
  debtorSortCodeUS?: string;
  instructedAmount: number;
  instructedAmountCurrencyCode: string;
  creditorName: string;
  creditorAccount: string;
  creditorAgentFinancialInstitutionBIC: string;
  creditorAgentFinancialInstitutionName: string;
  creditorAddressLines?: string;
  creditorStreetName?: string;
  creditorBuildingNumber?: string;
  creditorPostalCode?: string;
  creditorTownName?: string;
  creditorCountrySubDivision?: string;
  creditorCountryCode?: string;
  creditorSortCodeUK?: string;
  creditorSortCodeUS?: string;
  ustrdPaymentDetails?: string;
  painPaymentMethodType: string;
  firstIntermediaryBankBIC?: string;
  firstIntermediaryBankRoutingCode?: string;
  firstIntermediaryBankName?: string;
  firstIntermediaryBankCountryCode?: string;
  firstIntermediaryBankAccountId?: string;
  secondIntermediaryBankBIC?: string;
  secondIntermediaryBankRoutingCode?: string;
  secondIntermediaryBankName?: string;
  secondIntermediaryBankCountryCode?: string;
  secondIntermediaryBankAccountId?: string;
  applicationName?: string;
  applicationModule?: string;
  region?: string;
  creditorAgentAccountNumber?: string;
}

export function createEmptyPain001(): Pain001Model {
  return {
    requestedExecutionDate: '',
    debtorName: '',
    debtorAccountNumber: '',
    debtorAgentBIC: '',
    chargeBearer: '',
    chargesAmount: 0,
    chargesAgentBIC: '',
    debtorAddressLines: '',
    debtorStreetName: '',
    debtorBuildingNumber: '',
    debtorPostalCode: '',
    debtorTownName: '',
    debtorCountrySubDivision: '',
    debtorCountryCode: '',
    debtorSortCodeUK: '',
    debtorSortCodeUS: '',
    instructedAmount: 0,
    instructedAmountCurrencyCode: '',
    creditorName: '',
    creditorAccount: '',
    creditorAgentFinancialInstitutionBIC: '',
    creditorAgentFinancialInstitutionName: '',
    creditorAgentAccountNumber: '',
    creditorAddressLines: '',
    creditorStreetName: '',
    creditorBuildingNumber: '',
    creditorPostalCode: '',
    creditorTownName: '',
    creditorCountrySubDivision: '',
    creditorCountryCode: '',
    creditorSortCodeUK: '',
    creditorSortCodeUS: '',
    ustrdPaymentDetails: '',
    painPaymentMethodType: '',
    firstIntermediaryBankBIC: '',
    firstIntermediaryBankRoutingCode: '',
    firstIntermediaryBankName: '',
    firstIntermediaryBankCountryCode: '',
    firstIntermediaryBankAccountId: '',
    secondIntermediaryBankBIC: '',
    secondIntermediaryBankRoutingCode: '',
    secondIntermediaryBankName: '',
    secondIntermediaryBankCountryCode: '',
    secondIntermediaryBankAccountId: '',
    applicationName: '',
    applicationModule: '',
    region: ''
  };
}

export interface PaymentComponentInput {
  applicationName: string;
  applicationModule: string;
  region?: string;
  makerSubmitUrl: string;
  hardcapCheckUrl: string;
  headers?: Record<string, string>;
  useMockApi?: boolean;
}

export interface HardcapCheckRequest {
  amount: number;
  currencyCode: string;
  applicationName: string;
  applicationModule: string;
}

export type HardcapStatus = 'PASSED' | 'EXCEEDED' | 'REQUIRED' | 'MIN_ERROR';

export interface HardcapCheckResponse {
  status: HardcapStatus;
  message: string;
  limit?: number;
}

export interface MakerSubmitResponse {
  success: boolean;
  transactionId: string;
  message: string;
  timestamp: string;
  status: 'PENDING_CHECKER' | 'ERROR';
}

export interface SelectOption {
  value: string;
  label: string;
}

export const CHARGE_BEARER_OPTIONS: SelectOption[] = [
  { value: 'DEBT', label: 'DEBT' },
  { value: 'CRED', label: 'CRED' },
  { value: 'SHAR', label: 'SHAR' }
];

export const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'CBT', label: 'CBT' },
  { value: 'BKT', label: 'BKT' },
  { value: 'DFT', label: 'DFT' }
];

export interface FormFieldConfig {
  fieldName: keyof Pain001Model;
  hidden?: boolean;
  label?: string;
  required?: boolean;
  value?: any;
}



export const DEFAULT_FIELD_CONFIG: FormFieldConfig[] = [
  { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true },
  { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true },
  { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true },
  { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
  { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true },
  { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false, required: true },
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
  { fieldName: 'creditorName', label: 'Creditor Name', hidden: false, required: true },
  { fieldName: 'creditorAccount', label: 'Creditor Account Number', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', hidden: false, required: true },
  { fieldName: 'creditorAgentAccountNumber', label: 'Creditor Agent Account Number', hidden: false, required: true },
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
  { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: true },
  { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false },
  { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false },
  { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false },
];
