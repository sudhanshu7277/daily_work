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
  chargesAmount: number;
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
  instructedAmount: number;
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
  taxIdNumber?: string;
  taxIdType?: string;
  purposeOfPayment?: string;
  taxPurposeCode?: string;
  regulatoryReportingCode?: string;
  invoiceReferenceNumber?: string;
  chargeBear?: string;
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
  'region'
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

export const ALWAYS_REQUIRED_FIELDS: string[] = PAIN001_MANDATORY_FIELDS;

export function createEmptyPain001(): Pain001Model {
  const empty: Record<string, any> = {};
  PAIN001_STRING_FIELDS.forEach(f => {
    empty[f] = '';
  });
  PAIN001_NUMERIC_FIELDS.forEach(f => {
    empty[f] = 0;
  });
  empty.applicationName = 'ADR';
  empty.applicationModule = 'ADR';
  return empty as Pain001Model;
}

export interface FormFieldConfig {
  fieldName: string;
  label: string;
  hidden?: boolean;
  required?: boolean;
  options?: any;
  type?: any;
  placeholder?: string;
  value?: string | number;
}

export const DEFAULT_FIELD_CONFIG: FormFieldConfig[] = [];

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

export interface MakerSubmitResponse {
  referenceId: string;
  status: string;
  message: string;
}

export const PAYMENT_METHOD_OPTIONS = ['CBT', 'BKT', 'DFT'] as const;
export const REGION_OPTIONS = ['EMEA', 'LATAM', 'APAC', 'NAM'] as const;
export const PAYMENT_TYPE_OPTIONS = ['CBT', 'BKT', 'DFT'] as const;
export const CHARGE_BEARER_OPTIONS = ['DEBT', 'CRED', 'SHAR', 'SLEV'] as const;

export interface FormValidityPayload {
  validForm: boolean;
  makerPayload: Record<string, unknown>;
}