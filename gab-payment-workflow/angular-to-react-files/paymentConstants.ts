/**
 * paymentConstants.ts
 * Typed constants, field definitions, and factory functions.
 */

import type {
  Pain001Model,
  PaymentComponentInput,
  PaymentMode,
  DualBlindKeyFlag,
  FieldDefinition,
  Pain001ValidationRules,
} from './payment.types';

/* ── Mode constants ─────────────────────────────────────── */
export const PAYMENT_MODES = {
  MAKER: 'maker' as PaymentMode,
  CHECKER: 'checker' as PaymentMode,
  REPAIR: 'repair' as PaymentMode,
} as const;

export const DBK_FLAG = {
  ON: 'Y' as DualBlindKeyFlag,
  OFF: 'N' as DualBlindKeyFlag,
} as const;

export const PAYMENT_METHODS = ['CBT', 'BKT', 'DFT'] as const;
export const CHARGE_BEARERS = ['DEBT', 'CRED', 'SHAR', 'SLEV'] as const;

/* ── Mandatory fields (Pain.001 spec) ───────────────────── */
export const MANDATORY_FIELDS: ReadonlyArray<keyof Pain001Model> = [
  'requestedExecutionDate',
  'debtorName',
  'debtorAccountNumber',
  'debtorAgentBIC',
  'instructedAmount',
  'instructedAmountCurrencyCode',
  'creditorName',
  'creditorAccount',
  'creditorAgentFinancialInstitutionBIC',
  'creditorAgentFinancialInstitutionName',
  'creditorAgentPostalAddress',
  'painPaymentMethodType',
];

export const NUMERIC_FIELDS: ReadonlyArray<keyof Pain001Model> = [
  'instructedAmount',
  'chargesAmount',
];

/* ── Field definitions (label, fieldName, M|O) ──────────── */
export const PAIN001_FIELD_DEFINITIONS: FieldDefinition[] = [
  ['Value Date', 'requestedExecutionDate', 'M'],
  ['Debtor Name', 'debtorName', 'M'],
  ['Debtor Account Number', 'debtorAccountNumber', 'M'],
  ['Debtor Agent BIC', 'debtorAgentBIC', 'M'],
  ['Charge Information', 'chargeBearer', 'O'],
  ['Charges Amount', 'chargesAmount', 'O'],
  ['Charges Agent BIC', 'chargesAgentBIC', 'O'],
  ['Debtor Address Lines 1-4', 'debtorAddressLines', 'O'],
  ['Debtor Street', 'debtorStreetName', 'O'],
  ['Debtor Building Number', 'debtorBuildingNumber', 'O'],
  ['Debtor Postal Code', 'debtorPostalCode', 'O'],
  ['Debtor Town / City Name', 'debtorTownName', 'O'],
  ['Debtor State', 'debtorCountrySubDivision', 'O'],
  ['Debtor Country', 'debtorCountryCode', 'O'],
  ['Debtor Sort Code', 'debtorSortCodeUK', 'O'],
  ['Debtor Sort Code (US)', 'debtorSortCodeUS', 'O'],
  ['Transaction Amount', 'instructedAmount', 'M'],
  ['Currency', 'instructedAmountCurrencyCode', 'M'],
  ['Creditor Name', 'creditorName', 'M'],
  ['Creditor Account Number', 'creditorAccount', 'M'],
  ['Creditor Agent BIC', 'creditorAgentFinancialInstitutionBIC', 'M'],
  ['Creditor Agent Bank Name', 'creditorAgentFinancialInstitutionName', 'M'],
  ['Creditor Address', 'creditorAgentPostalAddress', 'M'],
  ['Creditor Address Lines 1-4', 'creditorAddressLines', 'O'],
  ['Creditor Street', 'creditorStreetName', 'O'],
  ['Creditor Building Number', 'creditorBuildingNumber', 'O'],
  ['Creditor Postal Code', 'creditorPostalCode', 'O'],
  ['Creditor Town / City Name', 'creditorTownName', 'O'],
  ['Creditor State', 'creditorCountrySubDivision', 'O'],
  ['Creditor Country', 'creditorCountryCode', 'O'],
  ['Creditor Sort Code', 'creditorSortCodeUK', 'O'],
  ['Creditor Sort Code (US)', 'creditorSortCodeUS', 'O'],
  ['Remittance Information', 'ustrdPaymentDetails', 'O'],
  ['Payment Type (CBT, BKT, DFT)', 'painPaymentMethodType', 'M'],
  ['1st Intermediary Bank SWIFT Code', 'firstIntermediaryBankBIC', 'O'],
  ['1st Intermediary Bank Routing Code', 'firstIntermediaryBankRoutingCode', 'O'],
  ['1st Intermediary Bank Name', 'firstIntermediaryBankName', 'O'],
  ['1st Intermediary Bank Country Code', 'firstIntermediaryBankCountryCode', 'O'],
  ['1st Intermediary Account Number', 'firstIntermediaryBankAccountId', 'O'],
  ['2nd Intermediary Bank SWIFT Code', 'secondIntermediaryBankBIC', 'O'],
  ['2nd Intermediary Bank Routing Code', 'secondIntermediaryBankRoutingCode', 'O'],
  ['2nd Intermediary Bank Name', 'secondIntermediaryBankName', 'O'],
  ['2nd Intermediary Bank Country Code', 'secondIntermediaryBankCountryCode', 'O'],
  ['2nd Intermediary Account Number', 'secondIntermediaryBankAccountId', 'O'],
];

/* ── Factory functions ───────────────────────────────────── */
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
    region: '',
  };
}

type InputOverrides = Partial<Omit<PaymentComponentInput, 'paymentMode'>>;

export function createMakerInput(overrides: InputOverrides = {}): PaymentComponentInput {
  return {
    paymentMode: PAYMENT_MODES.MAKER,
    applicationName: '',
    applicationModule: '',
    currency: '',
    hideFieldsList: [],
    rejectedFieldList: [],
    dualBlindKeyFlag: DBK_FLAG.OFF,
    dualBlindKeyFields: [],
    paymentModel: null,
    hardcapLimitCheckBaseUrl: '',
    validationRules: null,
    ...overrides,
  };
}

export function createCheckerInput(
  paymentModel: Pain001Model | null,
  overrides: InputOverrides = {}
): PaymentComponentInput {
  return {
    paymentMode: PAYMENT_MODES.CHECKER,
    applicationName: '',
    applicationModule: '',
    currency: paymentModel?.instructedAmountCurrencyCode ?? '',
    hideFieldsList: [],
    rejectedFieldList: [],
    dualBlindKeyFlag: DBK_FLAG.OFF,
    dualBlindKeyFields: [],
    paymentModel,
    hardcapLimitCheckBaseUrl: '',
    validationRules: null,
    ...overrides,
  };
}

export function createRepairInput(
  paymentModel: Pain001Model | null,
  rejectedFieldList: string[] = [],
  overrides: InputOverrides = {}
): PaymentComponentInput {
  return {
    paymentMode: PAYMENT_MODES.REPAIR,
    applicationName: '',
    applicationModule: '',
    currency: paymentModel?.instructedAmountCurrencyCode ?? '',
    hideFieldsList: [],
    rejectedFieldList,
    dualBlindKeyFlag: DBK_FLAG.OFF,
    dualBlindKeyFields: [],
    paymentModel,
    hardcapLimitCheckBaseUrl: '',
    validationRules: null,
    ...overrides,
  };
}
