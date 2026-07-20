// ============================================================================
// Ported from: pain001.model.ts, payment-component.model.ts (Angular library
// @citi-icg-179025/payment-flow-ui-lib and src/app/shared/components/payment-child/models)
// See memory: ss-payment-flow-pain001-model-capture.md
// ============================================================================

export type PaymentMode = 'maker' | 'checker' | 'repair';
export type DualBlindKeyFlag = 'Y' | 'N';

export interface Pain001Model {
  requestedExecutionDate: string;
  debtorName: string;
  debtorAccountNumber: string;
  debtorAgentBIC: string;
  debtorAgentBank?: string;
  chargeBearer: string;
  chargesAmount: number;
  chargesAgentBIC: string;

  // NOTE: both an unnumbered field AND numbered Lines1/Lines2 variants are
  // confirmed to exist on the real model (per capture UPDATE 3). Lines3/4 do
  // NOT exist anywhere in the source (dead in the .html too) — omitted here
  // deliberately, do not add them back in.
  debtorAddressLines: string;
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
  creditorAgentPostalAddress: string;
  creditorAddressLines: string;
  creditorAddressLines1: string;
  creditorAddressLines2: string;
  creditorStreetName: string;
  creditorBuildingNumber: string;
  creditorPostalCode: string;
  creditorTownName: string; // NOTE: child's own lookupCreditorAddress() writes the *typo'd* `dcreditorTownName` field — see PaymentChild.tsx comments
  creditorCountrySubDivision: string;
  creditorCountryCode: string;
  creditorState: string;
  creditorSortCodeUK: string;
  creditorSortCodeUS: string;

  ustrdPaymentDetails: string;
  painPaymentMethodType: string;

  firstIntermediaryBankBIC: string;
  firstIntermediaryBankRoutingCode: string;
  firstIntermediaryBankName: string;
  firstIntermediaryBankCountryCode: string;
  firstIntermediaryBankAccountId: string;

  secondIntermediaryBankBIC: string;
  secondIntermediaryBankRoutingCode: string;
  secondIntermediaryBankName: string;
  secondIntermediaryBankCountryCode: string;
  secondIntermediaryBankAccountId: string;

  applicationName: string;
  applicationModule: string;
  region: string;
}

// String / numeric / array field groupings, used by buildPain001FromForm /
// patchFormFromModel in the original .ts (PAIN001_STRING_FIELDS etc.)
export const PAIN001_NUMERIC_FIELDS: (keyof Pain001Model)[] = ['chargesAmount', 'instructedAmount'];

export const PAIN001_ARRAY_FIELDS: (keyof Pain001Model)[] = [];
// NOTE: no live array fields were confirmed in the captured source (this list
// existed as an import but no field was seen actually treated as an array
// through form-control patching); left empty deliberately rather than guessed.

export const PAIN001_STRING_FIELDS: (keyof Pain001Model)[] = [
  'requestedExecutionDate', 'debtorName', 'debtorAccountNumber', 'debtorAgentBIC', 'debtorAgentBank',
  'chargeBearer', 'chargesAgentBIC',
  'debtorAddressLines', 'debtorAddressLines1', 'debtorAddressLines2', 'debtorStreetName',
  'debtorBuildingNumber', 'debtorPostalCode', 'debtorTownName', 'debtorCountrySubDivision',
  'debtorCountryCode', 'debtorState', 'debtorSortCodeUK', 'debtorSortCodeUS',
  'instructedAmountCurrencyCode',
  'creditorName', 'creditorAccount', 'creditorAgentFinancialInstitutionBIC',
  'creditorAgentFinancialInstitutionName', 'creditorAgentPostalAddress',
  'creditorAddressLines', 'creditorAddressLines1', 'creditorAddressLines2', 'creditorStreetName',
  'creditorBuildingNumber', 'creditorPostalCode', 'creditorTownName', 'creditorCountrySubDivision',
  'creditorCountryCode', 'creditorState', 'creditorSortCodeUK', 'creditorSortCodeUS',
  'ustrdPaymentDetails', 'painPaymentMethodType',
  'firstIntermediaryBankBIC', 'firstIntermediaryBankRoutingCode', 'firstIntermediaryBankName',
  'firstIntermediaryBankCountryCode', 'firstIntermediaryBankAccountId',
  'secondIntermediaryBankBIC', 'secondIntermediaryBankRoutingCode', 'secondIntermediaryBankName',
  'secondIntermediaryBankCountryCode', 'secondIntermediaryBankAccountId',
  'applicationName', 'applicationModule', 'region',
] as (keyof Pain001Model)[];

export const PAIN001_MANDATORY_FIELDS: string[] = [
  'requestedExecutionDate', 'instructedAmountCurrencyCode', 'instructedAmount',
  'debtorName', 'debtorAccountNumber', 'debtorAgentBIC',
  'creditorName', 'creditorAccount', 'creditorAgentFinancialInstitutionBIC',
  'creditorAgentFinancialInstitutionName', 'creditorAddressLines',
  'chargeBearer',
];
export const ALWAYS_REQUIRED_FIELDS: string[] = PAIN001_MANDATORY_FIELDS;

export function createEmptyPain001(): Pain001Model {
  const empty = {} as Pain001Model;
  PAIN001_STRING_FIELDS.forEach((f) => { (empty as any)[f] = ''; });
  PAIN001_NUMERIC_FIELDS.forEach((f) => { (empty as any)[f] = 0; });
  empty.applicationName = 'ADR';
  empty.applicationModule = 'ADR';
  return empty;
}

export interface FormFieldConfig {
  fieldName: string;
  label: string;
  hidden: boolean;
  required: boolean;
  value?: string | number;
}

// Default field config used when the parent doesn't supply one (mirrors
// DEFAULT_FIELD_CONFIG import in the child .ts — not independently
// photographed; the parent ALWAYS supplies its own full fieldConfig[] in
// this app, so this default is a thin, mostly-unused fallback).
export const DEFAULT_FIELD_CONFIG: FormFieldConfig[] = [];

export interface PaymentComponentInput {
  applicationName: string;
  applicationModule: string;
  hideFieldsList: string[];
  currency: string;
  dualBlindKeyFields: string[];
  dualBlindKeyFlag: DualBlindKeyFlag;
  paymentModel: Pain001Model | null; // CONFIRMED name (not paymentMode1) — see payment-parent capture
  rejectedFieldList: string[];
  paymentMode: PaymentMode;
  hardcapLimitCheckBaseUrl: string;
}

export type DualBlindKeyResult = 'passed' | 'failed' | null;

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

export const PAYMENT_METHOD_OPTIONS = ['CBT', 'BKT', 'DFT'];
export const REGION_OPTIONS = ['EMEA', 'LATAM', 'APAC', 'NAM'];
export const PAYMENT_TYPE_OPTIONS = ['CBT', 'BKT', 'DFT'];
export const CHARGE_BEARER_OPTIONS = ['DEBT', 'CRED', 'SHAR', 'SLEV'];
// NOTE: pain001.model.ts also separately exports a 3-value object-shaped
// CHARGE_BEARER_OPTIONS which collides by name with this component-local
// 4-value string array. This app's component uses the LOCAL 4-value version
// (per capture) — flagged, not resolved; confirm with a fresh source check
// if the 3-value variant turns out to be the live one instead.

export interface FieldValidationResult {
  required?: boolean;
  visible?: boolean;
  patternMessage?: string;
}
