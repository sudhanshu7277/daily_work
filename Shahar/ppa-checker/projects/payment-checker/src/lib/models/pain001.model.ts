export interface Pain001Model {
  requestedExecutionDate: string;
  debtorName: string;
  debtorAccountNumber: string;
  debtorAgentBIC: string;
  chargeBearer?: string;
  chargesAmount?: number;
  chargesAgentBIC?: string;
  debtorAddressLines?: string;
  debtorAddressLines2?: string;
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
  creditorAgentPostalAddress?: string;
  creditorAgentAccountNumber: string;
  creditorAddressLines?: string;
  creditorAddressLines2?: string;
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
}

export interface CheckerGetResponse {
  transactionId: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
  formData: Pain001Model;
}

export interface CheckerActionRequest {
  transactionId: string;
  action: 'APPROVED' | 'REJECTED';
  formData: Pain001Model;
}

export interface CheckerActionResponse {
  success: boolean;
  transactionId: string;
  action: 'APPROVED' | 'REJECTED';
  message: string;
  timestamp: string;
}

export interface CheckerComponentInput {
  applicationName: string;
  applicationModule: string;
  region?: string;
  checkerGetUrl: string;
  checkerActionUrl: string;
  headers?: Record<string, string>;
}

export interface SelectOption { value: string; label: string; }

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

export function createMockCheckerGetResponse(): CheckerGetResponse {
  return {
    transactionId: 'TXN-' + Date.now() + '-7842',
    submittedBy: 'maker.user@organisation.com',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'PENDING_CHECKER',
    formData: {
      requestedExecutionDate: '2025-04-15',
      debtorName: 'Acme Corporation Ltd',
      debtorAccountNumber: 'ACC-GB-001234567',
      debtorAgentBIC: 'CITIUS33XXX',
      chargeBearer: 'DEBT',
      chargesAmount: 0,
      chargesAgentBIC: '',
      debtorAddressLines: '1 Canary Wharf',
      debtorAddressLines2: 'Level 12',
      debtorStreetName: 'Canada Square',
      debtorBuildingNumber: '1',
      debtorPostalCode: 'E14 5AB',
      debtorTownName: 'London',
      debtorCountrySubDivision: 'England',
      debtorCountryCode: 'GB',
      debtorSortCodeUK: '40-22-90',
      debtorSortCodeUS: '',
      instructedAmount: 250000,
      instructedAmountCurrencyCode: 'USD',
      creditorName: 'Global Finance Partners Inc',
      creditorAccount: 'ACC-US-987654321',
      creditorAgentFinancialInstitutionBIC: 'CHASUS33XXX',
      creditorAgentFinancialInstitutionName: 'JPMorgan Chase Bank NA',
      creditorAgentPostalAddress: '383 Madison Avenue, New York',
      creditorAgentAccountNumber: 'AGT-ACC-001122',
      creditorAddressLines: '270 Park Avenue',
      creditorAddressLines2: 'Suite 5000',
      creditorStreetName: 'Park Avenue',
      creditorBuildingNumber: '270',
      creditorPostalCode: '10017',
      creditorTownName: 'New York',
      creditorCountrySubDivision: 'NY',
      creditorCountryCode: 'US',
      creditorSortCodeUK: '',
      creditorSortCodeUS: '021000021',
      ustrdPaymentDetails: 'Q1 2025 Investment Settlement Ref: INV-2025-001',
      painPaymentMethodType: 'CBT',
      firstIntermediaryBankBIC: 'DEUTDEFFXXX',
      firstIntermediaryBankRoutingCode: '200400600',
      firstIntermediaryBankName: 'Deutsche Bank AG',
      firstIntermediaryBankCountryCode: 'DE',
      firstIntermediaryBankAccountId: 'INT-ACC-DE-001',
      secondIntermediaryBankBIC: '',
      secondIntermediaryBankRoutingCode: '',
      secondIntermediaryBankName: '',
      secondIntermediaryBankCountryCode: '',
      secondIntermediaryBankAccountId: '',
      applicationName: 'ADR',
      applicationModule: 'ADR',
      region: 'US'
    }
  };
}

export interface FormFieldConfig {
  fieldName: keyof Pain001Model;
  hidden?: boolean;
  label?: string;
  value?: any;
}

export const ALWAYS_REQUIRED_FIELDS: (keyof Pain001Model)[] = [
  'debtorName', 'debtorAccountNumber', 'debtorAgentBIC',
  'creditorName', 'creditorAccount',
  'creditorAgentFinancialInstitutionBIC', 'creditorAgentFinancialInstitutionName',
  'painPaymentMethodType', 'requestedExecutionDate', 'instructedAmountCurrencyCode'
];

export const DEFAULT_CHECKER_FIELD_CONFIG: FormFieldConfig[] = [
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
  { fieldName: 'ustrdPaymentDetails', label: 'Remittance Information', hidden: false },
  { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false },
  { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false },
  { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false },
  { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false },
];
