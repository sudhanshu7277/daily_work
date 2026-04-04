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
  creditorAgentPostalAddress?: string;
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
    creditorAgentPostalAddress: '',
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
