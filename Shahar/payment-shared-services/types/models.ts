export type PaymentMode = 'maker' | 'checker' | 'repair';
export type DualBlindKeyFlag = 'Y' | 'N';
export type DualBlindKeyResult = 'passed' | 'failed' | null;

export interface Pain001Model {
  requestedExecutionDate: string;
  debtorName: string;
  debtorAccountNumber: string;
  debtorAgentBIC: string;
  debtorAgentBank?: string;
  chargeBearer: string;
  chargesAmount: number | string;
  chargesAgentBIC: string;
  debtorAddressLines?: string;
  debtorAddressLines1: string;
  debtorAddressLines2: string;
  debtorStreetName: string;
  debtorBuildingNumber: string;
  debtorPostalCode: string;
  debtorTownName: string;
  debtorCountrySubDivision: string;
  debtorCountryCode: string;
  debtorState: string;
  debtorSortCodeUK: string;
  debtorSortCodeUS: string;
  instructedAmount: number | string;
  instructedAmountCurrencyCode: string;
  creditorName: string;
  creditorAccount: string;
  creditorAgentFinancialInstitutionBIC: string;
  creditorAgentFinancialInstitutionName: string;
  creditorAgentPostalAddress?: string;
  creditorAddressLines?: string;
  creditorAddressLines1: string;
  creditorAddressLines2: string;
  creditorStreetName: string;
  creditorBuildingNumber: string;
  creditorPostalCode: string;
  creditorTownName: string;
  creditorCountrySubDivision: string;
  creditorCountryCode: string;
  creditorState: string;
  creditorSortCodeUK: string;
  creditorSortCodeUS: string;
  ustrdPaymentDetails: string;
  painPaymentMethodType: string;
  firstIntermediaryBankBIC?: string;
  firstIntermediaryBankRoutingCode?: string;
  firstIntermediaryBankName?: string;
  firstIntermediaryBankCountryCode?: string;
  firstIntermediaryBankAccountNumber?: string;
  secondIntermediaryBankBIC?: string;
  secondIntermediaryBankRoutingCode?: string;
  secondIntermediaryBankName?: string;
  secondIntermediaryBankCountryCode?: string;
  secondIntermediaryBankAccountNumber?: string;
  applicationName?: string;
  applicationModule?: string;
  region?: string;
  // 6 Tax Details Fields
  taxIdNumber: string;
  taxIdType: string;
  purposeOfPayment: string;
  taxPurposeCode: string;
  regulatoryReportingCode: string;
  invoiceReferenceNumber: string;
  [key: string]: unknown;
}

export const PAIN001_NUMERIC_FIELDS: (keyof Pain001Model)[] = ['chargesAmount', 'instructedAmount'];
export const PAIN001_ARRAY_FIELDS: (keyof Pain001Model)[] = [];

export const PAIN001_STRING_FIELDS: (keyof Pain001Model)[] = [
  'requestedExecutionDate',
  'debtorName',
  'debtorAccountNumber',
  'debtorAgentBIC',
  'debtorAgentBank',
  'chargeBearer',
  'chargesAgentBIC',
  'debtorAddressLines',
  'debtorAddressLines1',
  'debtorAddressLines2',
  'debtorStreetName',
  'debtorBuildingNumber',
  'debtorPostalCode',
  'debtorTownName',
  'debtorCountrySubDivision',
  'debtorCountryCode',
  'debtorState',
  'debtorSortCodeUK',
  'debtorSortCodeUS',
  'instructedAmountCurrencyCode',
  'creditorName',
  'creditorAccount',
  'creditorAgentFinancialInstitutionBIC',
  'creditorAgentFinancialInstitutionName',
  'creditorAgentPostalAddress',
  'creditorAddressLines',
  'creditorAddressLines1',
  'creditorAddressLines2',
  'creditorStreetName',
  'creditorBuildingNumber',
  'creditorPostalCode',
  'creditorTownName',
  'creditorCountrySubDivision',
  'creditorCountryCode',
  'creditorState',
  'creditorSortCodeUK',
  'creditorSortCodeUS',
  'ustrdPaymentDetails',
  'painPaymentMethodType',
  'firstIntermediaryBankBIC',
  'firstIntermediaryBankRoutingCode',
  'firstIntermediaryBankName',
  'firstIntermediaryBankCountryCode',
  'firstIntermediaryBankAccountNumber',
  'secondIntermediaryBankBIC',
  'secondIntermediaryBankRoutingCode',
  'secondIntermediaryBankName',
  'secondIntermediaryBankCountryCode',
  'secondIntermediaryBankAccountNumber',
  'applicationName',
  'applicationModule',
  'region',
  'taxIdNumber',
  'taxIdType',
  'purposeOfPayment',
  'taxPurposeCode',
  'regulatoryReportingCode',
  'invoiceReferenceNumber'
];

export const PAIN001_MANDATORY_FIELDS: string[] = [
  'requestedExecutionDate',
  'instructedAmountCurrencyCode',
  'instructedAmount',
  'debtorName',
  'debtorAccountNumber',
  'debtorAgentBIC',
  'creditorName',
  'creditorAccount',
  'creditorAgentFinancialInstitutionBIC',
  'creditorAgentFinancialInstitutionName',
  'creditorAddressLines1',
  'chargeBearer'
];

export function createEmptyPain001(): Pain001Model {
  const empty: Record<string, unknown> = {};
  PAIN001_STRING_FIELDS.forEach(f => {
    empty[f] = '';
  });
  PAIN001_NUMERIC_FIELDS.forEach(f => {
    empty[f] = '';
  });
  empty.applicationName = 'ADR';
  empty.applicationModule = 'ADR';
  empty.region = '';
  return empty as Pain001Model;
}

export interface FormFieldConfig {
  fieldName: string;
  label: string;
  hidden?: boolean;
  required?: boolean;
  options?: readonly string[] | string[];
  type?: 'text' | 'number' | 'date' | 'textarea' | string;
  placeholder?: string;
  value?: string | number;
}

export interface PaymentComponentInput {
  applicationName: string;
  applicationModule: string;
  hideFieldsList?: string[];
  currency?: string;
  dualBlindKeyFields?: string[];
  dualBlindKeyFlag?: DualBlindKeyFlag;
  paymentModel?: Partial<Pain001Model> | null;
  rejectedFieldList?: string[];
  paymentMode: PaymentMode;
  hardcapLimitCheckBaseUrl?: string;
  makerSubmitUrl?: string;
  region?: string;
  useMockApi?: boolean;
}

export interface PaymentComponentOutput {
  paymentData: Pain001Model;
  isValid: boolean;
  outputMessage: string;
  dualBlindKeyResult: DualBlindKeyResult;
  isDualBlindKeyPassed: boolean;
}

export interface HardcapCheckResponse {
  amountWithinLimit: boolean;
  hardCapValue: number;
}

export interface VerifyHardCapRequest {
  currency: string;
  paymentAmount: number;
  applicationName: string;
  applicationModule: string;
}

export interface FormValidityPayload {
  validForm: boolean;
  makerPayload: Record<string, unknown>;
}

export const PAYMENT_TYPE_OPTIONS = ['CBT', 'BKT', 'DFT'] as const;
export const CHARGE_BEARER_OPTIONS = ['DEBT', 'CRED', 'SHAR', 'SLEV'] as const;