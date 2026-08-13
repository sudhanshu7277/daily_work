// ============================================================================
// Types consumed by the real PaymentChild.tsx / PaymentParent.tsx.
// Field lists here are reverse-engineered from actual usage in those two
// files (every property read off Pain001Model / PaymentComponentInput /
// etc. is accounted for) — not independently re-captured from a models.ts
// source file, since that wasn't part of what was shared. Flag anything
// that looks off against your real types/models.ts if one exists.
// ============================================================================

export type PaymentMode = 'maker' | 'checker' | 'repair';
export type DualBlindKeyFlag = 'Y' | 'N';
export type DualBlindKeyResult = 'passed' | 'failed' | null;

export interface Pain001Model {
  requestedExecutionDate: string;
  debtorName: string;
  debtorAccountNumber: string;
  debtorAgentBIC: string;
  debtorAgentBank: string;
  chargeBearer: string;
  chargesAmount: number;
  chargesAgentBIC: string;

  debtorAddressLines: string;
  debtorAddressLines1: string;
  debtorAddressLines2: string;
  debtorStreetName: string;
  debtorBuildingNumber: string;
  debtorPostalCode: string;
  debtorTownName: string;
  debtorCountrySubDivision: string;
  debtorState: string;
  debtorCountryCode: string;
  debtorSortCodeUK: string;
  debtorSortCodeUS: string;

  instructedAmount: number;
  instructedAmountCurrencyCode: string;

  creditorName: string;
  creditorAccount: string;
  creditorAgentFinancialInstitutionBIC: string;
  creditorAgentFinancialInstitutionName: string;
  /**
   * The real field, confirmed by payloadPreperation() in PaymentParent.tsx
   * reading paymentData.creditorAgentPostalAddress directly.
   */
  creditorAgentPostalAddress: string;
  /**
   * A SEPARATE field rendered in PaymentChild.tsx
   * (renderField('creditorAgentAccountNumber', 'Creditor Agent Account
   * Number', ...)) with its own label, distinct from
   * creditorAgentPostalAddress above. Kept as its own field rather than
   * merged, since the real component clearly treats them as two different
   * inputs — but note buildPain001FromForm() below bridges
   * creditorAgentAccountNumber's entered value into
   * creditorAgentPostalAddress too, since payloadPreperation only reads the
   * latter. Flag if that bridging is wrong for your actual backend contract.
   */
  creditorAgentAccountNumber: string;

  creditorAddressLines: string;
  creditorAddressLines1: string;
  creditorAddressLines2: string;
  creditorStreetName: string;
  creditorBuildingNumber: string;
  creditorPostalCode: string;
  creditorTownName: string;
  creditorCountrySubDivision: string;
  creditorState: string;
  creditorCountryCode: string;
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

export function createEmptyPain001(): Pain001Model {
  return {
    requestedExecutionDate: '',
    debtorName: '',
    debtorAccountNumber: '',
    debtorAgentBIC: '',
    debtorAgentBank: '',
    chargeBearer: '',
    chargesAmount: 0,
    chargesAgentBIC: '',
    debtorAddressLines: '',
    debtorAddressLines1: '',
    debtorAddressLines2: '',
    debtorStreetName: '',
    debtorBuildingNumber: '',
    debtorPostalCode: '',
    debtorTownName: '',
    debtorCountrySubDivision: '',
    debtorState: '',
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
    creditorAgentAccountNumber: '',
    creditorAddressLines: '',
    creditorAddressLines1: '',
    creditorAddressLines2: '',
    creditorStreetName: '',
    creditorBuildingNumber: '',
    creditorPostalCode: '',
    creditorTownName: '',
    creditorCountrySubDivision: '',
    creditorState: '',
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
    applicationName: 'ADR',
    applicationModule: 'ADR',
    region: '',
  };
}

/**
 * Exact shape actually constructed by PaymentParent.tsx's `paymentInput`
 * useMemo — deliberately NOT the larger shape from earlier drafts in this
 * conversion (no addressLookupBaseUrl / makerSubmitUrl / useMockApi here;
 * the real component doesn't use them — address lookups in PaymentChild.tsx
 * hit a hardcoded endpoint string directly, not a paymentInput field).
 */
export interface PaymentComponentInput {
  applicationName: string;
  applicationModule: string;
  hideFieldsList: string[];
  currency: string;
  dualBlindKeyFields: string[];
  dualBlindKeyFlag: DualBlindKeyFlag;
  paymentModel: Pain001Model | null;
  rejectedFieldList: string[];
  paymentMode: PaymentMode;
  hardcapLimitCheckBaseUrl: string;
}

export interface PaymentComponentOutput {
  paymentData: Pain001Model;
  isValid: boolean;
  outputMessage: string;
  dualBlindKeyResult: DualBlindKeyResult;
  isDualBlindKeyPassed: boolean;
}

/** fieldName is plain `string` here, matching actual usage (configMap keyed by string, not keyof Pain001Model) throughout PaymentChild.tsx. */
export interface FormFieldConfig {
  fieldName: string;
  label?: string;
  hidden?: boolean;
  required?: boolean;
  value?: any;
  /**
   * ADDED (not part of the original captured type): for fields rendered
   * via the new dynamic "Additional Fields" section in PaymentChild.tsx —
   * if present, the field renders as a <select> with these as its options,
   * matching the same string[] shape renderField() already expects
   * (see CHARGE_BEARER_OPTIONS/PAYMENT_TYPE_OPTIONS). Omit for a plain
   * text input. Has no effect on any of the original 44 fixed fields.
   */
  options?: string[];
  /**
   * ADDED (not part of the original captured type): input type for
   * dynamically-rendered fields only. Ignored if `options` is set (that
   * always renders a <select> regardless of `type`). Defaults to 'text' —
   * has no effect on any of the original 44 fixed fields, which never set
   * this. Uses the SAME .form-field input/select/textarea CSS rules
   * already in payment-flow.css (type selectors like input[type=date]
   * aren't used there), so no styling changes needed for this to work.
   */
  type?: 'text' | 'number' | 'date' | 'textarea';
}

export interface HardcapCheckResponse {
  amountWithinLimit: boolean;
  hardCapValue: number;
}

/**
 * Imported by PaymentChild.tsx but not visibly referenced in the shown
 * render/logic code — likely used only in an omitted dead-code path.
 * Exported for import-safety; not otherwise load-bearing here.
 */
export const ALWAYS_REQUIRED_FIELDS: string[] = [
  'debtorName', 'debtorAccountNumber', 'debtorAgentBIC',
  'creditorName', 'creditorAccount',
  'creditorAgentFinancialInstitutionBIC', 'creditorAgentFinancialInstitutionName',
  'painPaymentMethodType', 'requestedExecutionDate',
  'instructedAmountCurrencyCode', 'instructedAmount',
  'creditorAgentAccountNumber',
];

/**
 * THE actual source of truth for mandatory-indicator asterisks and overall
 * form validity in PaymentChild.tsx (isMandatoryField, logMissingMandatoryFields,
 * emitOutput's mandatoryOk check all read this directly — fieldConfig[].required
 * is NOT consulted for this, confirmed by reading isMandatoryField's actual
 * implementation). Set to match PARENT_FIELD_CONFIG's required:true entries
 * in PaymentParent.tsx for consistency between the two.
 */
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
  'chargeBearer',
  'creditorAddressLines',
];

// renderField's `options` prop is `string[]` (plain option values, not
// {value,label} pairs — confirmed by <option key={opt} value={opt}>{opt}</option>
// in PaymentChild.tsx), so these are string arrays, not SelectOption objects.
export const CHARGE_BEARER_OPTIONS: string[] = ['DEBT', 'CRED', 'SHAR'];
export const PAYMENT_TYPE_OPTIONS: string[] = ['CBT', 'BKT', 'DFT'];

/**
 * Imported by PaymentChild.tsx but not visibly used in the shown render
 * code (PAYMENT_TYPE_OPTIONS is what's actually passed to the
 * painPaymentMethodType select). Possibly a duplicate/legacy import.
 * Exported for import-safety with the same values as PAYMENT_TYPE_OPTIONS
 * as a reasonable default — verify against your real source if this
 * matters for something not visible in the captured code.
 */
export const PAYMENT_METHOD_OPTIONS: string[] = ['CBT', 'BKT', 'DFT'];

/**
 * Imported by PaymentChild.tsx but not visibly used anywhere in the shown
 * code at all. No real data was available for this — placeholder empty
 * array so the import doesn't break. Flag if this needs real region codes.
 */
export const REGION_OPTIONS: string[] = [];
