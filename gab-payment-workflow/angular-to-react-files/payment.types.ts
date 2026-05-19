/**
 * payment.types.ts
 * Single source of truth for all Pain.001 TypeScript types used across the package.
 */

/* ── Modes & Flags ──────────────────────────────────────── */
export type PaymentMode = 'maker' | 'checker' | 'repair';
export type DualBlindKeyFlag = 'Y' | 'N';
export type DualBlindKeyResult = 'passed' | 'failed' | null;

/* ── Pain001 Model ──────────────────────────────────────── */
export interface Pain001Model {
  // Value Date & Core
  requestedExecutionDate: string;

  // Debtor
  debtorName: string;
  debtorAccountNumber: string;
  debtorAgentBIC: string;

  // Charges
  chargeBearer?: string;
  chargesAmount?: number;
  chargesAgentBIC?: string;

  // Debtor Address
  debtorAddressLines?: string;
  debtorStreetName?: string;
  debtorBuildingNumber?: string;
  debtorPostalCode?: string;
  debtorTownName?: string;
  debtorCountrySubDivision?: string;
  debtorCountryCode?: string;
  debtorSortCodeUK?: string;
  debtorSortCodeUS?: string;

  // Transaction
  instructedAmount: number;
  instructedAmountCurrencyCode: string;

  // Creditor
  creditorName: string;
  creditorAccount: string;
  creditorAgentFinancialInstitutionBIC: string;
  creditorAgentFinancialInstitutionName: string;
  creditorAgentPostalAddress: string;

  // Creditor Address
  creditorAddressLines?: string;
  creditorStreetName?: string;
  creditorBuildingNumber?: string;
  creditorPostalCode?: string;
  creditorTownName?: string;
  creditorCountrySubDivision?: string;
  creditorCountryCode?: string;
  creditorSortCodeUK?: string;
  creditorSortCodeUS?: string;

  // Remittance
  ustrdPaymentDetails?: string;

  // Payment Type
  painPaymentMethodType: string;

  // 1st Intermediary Bank
  firstIntermediaryBankBIC?: string;
  firstIntermediaryBankRoutingCode?: string;
  firstIntermediaryBankName?: string;
  firstIntermediaryBankCountryCode?: string;
  firstIntermediaryBankAccountId?: string;

  // 2nd Intermediary Bank
  secondIntermediaryBankBIC?: string;
  secondIntermediaryBankRoutingCode?: string;
  secondIntermediaryBankName?: string;
  secondIntermediaryBankCountryCode?: string;
  secondIntermediaryBankAccountId?: string;

  // Context (set by parent)
  applicationName?: string;
  applicationModule?: string;
  region?: string;
}

/* ── Component I/O ──────────────────────────────────────── */
export interface PaymentComponentInput {
  paymentMode: PaymentMode;
  applicationName: string;
  applicationModule: string;
  currency: string;
  hideFieldsList: string[];
  rejectedFieldList: string[];
  dualBlindKeyFlag: DualBlindKeyFlag;
  dualBlindKeyFields: string[];
  paymentModel: Pain001Model | null;
  hardcapLimitCheckBaseUrl: string;
  validationRules?: Pain001ValidationRules | null;
}

export interface PaymentComponentOutput {
  paymentData: Pain001Model;
  isValid: boolean;
  outputMessage: string;
  dualBlindKeyResult: DualBlindKeyResult;
  isDualBlindKeyPassed: boolean;
}

export interface DualBlindKeyEntry {
  fieldName: string;
  checkerValue: string;
}

/* ── Validation Rule Models ─────────────────────────────── */
export interface ValidationCondition {
  factor: 'country' | 'paymentType' | 'currency' | 'paymentMethod' | 'fieldValue';
  sourceField: string;
  derivation?: 'bicCountry';
  operator: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty';
  value?: string | string[];
}

export interface ValidationEffect {
  required?: boolean;
  visible?: boolean;
  pattern?: string;
  patternMessage?: string;
  maxLength?: number;
  decimalPlaces?: number;
}

export interface FieldValidationRule {
  priority: number;
  conditions: ValidationCondition[];
  effect: ValidationEffect;
}

export interface FormRule {
  id: string;
  description: string;
  watchFields: string[];
  conditions: ValidationCondition[];
  effects: Record<string, ValidationEffect>;
}

export interface Pain001ValidationRules {
  version: string;
  fields: Record<string, FieldValidationRule[]>;
  formRules: FormRule[];
}

export interface FieldValidationResult {
  fieldName: string;
  required: boolean;
  visible: boolean;
  pattern?: string;
  patternMessage?: string;
  maxLength?: number;
  decimalPlaces?: number;
}

/* ── Hardcap Models ─────────────────────────────────────── */
export interface VerifyHardCapRequest {
  currency: string;
  paymentAmount: number;
  applicationName: string;
  applicationModule: string;
}

export interface VerifyHardCapResponse {
  amountWithinLimit: boolean;
  hardCapValue: number;
}

/* ── Internal form state (split address lines for UI) ───── */
export interface InternalFormState extends Omit<Pain001Model, 'debtorAddressLines' | 'creditorAddressLines' | 'instructedAmount' | 'chargesAmount'> {
  debtorAddressLine1: string;
  debtorAddressLine2: string;
  creditorAddressLine1: string;
  creditorAddressLine2: string;
  instructedAmount: string;
  chargesAmount: string;
}

/* ── API response shapes ─────────────────────────────────── */
export interface SubmitPaymentResponse {
  transactionId: string;
  status: string;
  message: string;
}

export interface CheckerActionResponse {
  status: string;
  message: string;
  timestamp?: string;
  transactionId?: string;
}

export interface ApiError {
  type: 'fetch' | 'submit' | 'approve' | 'reject' | 'repair' | 'hardcap';
  message: string;
}

/* ── Field definition tuple ─────────────────────────────── */
export type FieldDefinition = [string, string, 'M' | 'O'];

/* ── PaymentParent props ─────────────────────────────────── */
export interface PaymentParentProps {
  mode?: PaymentMode;
  transactionId?: string | null;
  apiBaseUrl?: string;
  apiHeaders?: Record<string, string>;
  hardcapBaseUrl?: string;
  applicationName?: string;
  applicationModule?: string;
  currency?: string;
  region?: string;
  hideFieldsList?: string[];
  rejectedFieldList?: string[];
  dualBlindKeyFlag?: DualBlindKeyFlag;
  dualBlindKeyFields?: string[];
  initialPaymentData?: Pain001Model | null;
  validationRules?: Pain001ValidationRules | null;
  onMakerSubmit?: (output: PaymentComponentOutput & { serverResponse?: SubmitPaymentResponse }) => void;
  onCheckerApprove?: (output: PaymentComponentOutput & { serverResponse?: CheckerActionResponse }) => void;
  onCheckerReject?: (output: PaymentComponentOutput & { serverResponse?: CheckerActionResponse }) => void;
  onRepairSubmit?: (output: PaymentComponentOutput & { serverResponse?: SubmitPaymentResponse }) => void;
  onError?: (error: ApiError) => void;
  onModeChange?: (mode: PaymentMode) => void;
}

/* ── PaymentChildForm props ──────────────────────────────── */
export interface PaymentChildFormProps {
  mode?: PaymentMode;
  input?: PaymentComponentInput;
  onOutput?: (output: PaymentComponentOutput) => void;
  onApprove?: (output: PaymentComponentOutput) => void;
  onReject?: (output: PaymentComponentOutput) => void;
}
