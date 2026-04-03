// ============================================================
// models/pain001.model.ts
// Full Pain001Model interface — all fields from images:
//   child-input-interface-01.jpeg  (lines 1–38)
//   child-input-interface-02.jpeg  (lines 30–62)
//   parent-to-child-interface-01   (paymentDetailsRequest fields)
//   parent-to-child-interface-02   (full field list)
//   parent-to-child-properties-01  (createEmptyPain001 part 1)
//   parent-to-child-properties-02  (createEmptyPain001 part 2)
// ============================================================

// ── Main data model ─────────────────────────────────────────
export interface Pain001Model {

  // ── Value Date & Core ────────────────────────────────────
  requestedExecutionDate: string;            // required

  // ── Debtor ───────────────────────────────────────────────
  debtorName:          string;               // required
  debtorAccountNumber: string;               // required
  debtorAgentBIC:      string;               // required

  // ── Charges ──────────────────────────────────────────────
  chargeBearer?:    string;                  // optional  (DEBT / CRED / SHAR)
  chargesAmount?:   number;                  // optional
  chargesAgentBIC?: string;                  // optional

  // ── Debtor Address ───────────────────────────────────────
  debtorAddressLines?:       string;
  debtorStreetName?:         string;
  debtorBuildingNumber?:     string;
  debtorPostalCode?:         string;
  debtorTownName?:           string;
  debtorCountrySubDivision?: string;
  debtorCountryCode?:        string;
  debtorSortCodeUK?:         string;
  debtorSortCodeUS?:         string;

  // ── Transaction ──────────────────────────────────────────
  instructedAmount:             number;      // required
  instructedAmountCurrencyCode: string;      // required  e.g. USD

  // ── Creditor ─────────────────────────────────────────────
  creditorName:                          string;   // required
  creditorAccount:                       string;   // required
  creditorAgentFinancialInstitutionBIC:  string;   // required
  creditorAgentFinancialInstitutionName: string;   // required
  creditorAgentPostalAddress?:           string;

  // ── Creditor Address ─────────────────────────────────────
  creditorAddressLines?:       string;
  creditorStreetName?:         string;
  creditorBuildingNumber?:     string;
  creditorPostalCode?:         string;
  creditorTownName?:           string;
  creditorCountrySubDivision?: string;
  creditorCountryCode?:        string;
  creditorSortCodeUK?:         string;
  creditorSortCodeUS?:         string;

  // ── Remittance ───────────────────────────────────────────
  ustrdPaymentDetails?: string;

  // ── Payment Type ─────────────────────────────────────────
  painPaymentMethodType: string;             // required  CBT / BKT / DFT

  // ── 1st Intermediary Bank ────────────────────────────────
  firstIntermediaryBankBIC?:         string;
  firstIntermediaryBankRoutingCode?: string;
  firstIntermediaryBankName?:        string;
  firstIntermediaryBankCountryCode?: string;
  firstIntermediaryBankAccountId?:   string;

  // ── 2nd Intermediary Bank ────────────────────────────────
  secondIntermediaryBankBIC?:         string;
  secondIntermediaryBankRoutingCode?: string;
  secondIntermediaryBankName?:        string;
  secondIntermediaryBankCountryCode?: string;
  secondIntermediaryBankAccountId?:   string;

  // ── Context fields (injected by parent) ──────────────────
  applicationName?:   string;
  applicationModule?: string;
  region?:            string;
}

// ── Factory — empty Pain001Model ────────────────────────────
export function createEmptyPain001(): Pain001Model {
  return {
    requestedExecutionDate:              '',
    debtorName:                          '',
    debtorAccountNumber:                 '',
    debtorAgentBIC:                      '',
    chargeBearer:                        '',
    chargesAmount:                       0,
    chargesAgentBIC:                     '',
    debtorAddressLines:                  '',
    debtorStreetName:                    '',
    debtorBuildingNumber:                '',
    debtorPostalCode:                    '',
    debtorTownName:                      '',
    debtorCountrySubDivision:            '',
    debtorCountryCode:                   '',
    debtorSortCodeUK:                    '',
    debtorSortCodeUS:                    '',
    instructedAmount:                    0,
    instructedAmountCurrencyCode:        '',
    creditorName:                        '',
    creditorAccount:                     '',
    creditorAgentFinancialInstitutionBIC:  '',
    creditorAgentFinancialInstitutionName: '',
    creditorAgentPostalAddress:          '',
    creditorAddressLines:                '',
    creditorStreetName:                  '',
    creditorBuildingNumber:              '',
    creditorPostalCode:                  '',
    creditorTownName:                    '',
    creditorCountrySubDivision:          '',
    creditorCountryCode:                 '',
    creditorSortCodeUK:                  '',
    creditorSortCodeUS:                  '',
    ustrdPaymentDetails:                 '',
    painPaymentMethodType:               '',
    firstIntermediaryBankBIC:            '',
    firstIntermediaryBankRoutingCode:    '',
    firstIntermediaryBankName:           '',
    firstIntermediaryBankCountryCode:    '',
    firstIntermediaryBankAccountId:      '',
    secondIntermediaryBankBIC:           '',
    secondIntermediaryBankRoutingCode:   '',
    secondIntermediaryBankName:          '',
    secondIntermediaryBankCountryCode:   '',
    secondIntermediaryBankAccountId:     '',
    applicationName:                     '',
    applicationModule:                   '',
    region:                              ''
  };
}

// ── PaymentComponentInput — parent injects this into child ──
// Seen in payment-parent.component.ts → paymentInput getter
export interface PaymentComponentInput {
  applicationName:   string;
  applicationModule: string;
  region?:           string;
  makerSubmitUrl:    string;   // POST endpoint placeholder
  headers?:          Record<string, string>;
  // Optional context fields auto-populated into payload (not shown as editable inputs)
  requestedExecutionDate?:       string;   // defaults to today
  instructedAmount?:             number;   // transaction amount from parent context
  instructedAmountCurrencyCode?: string;   // e.g. 'USD'
}

// ── API responses ────────────────────────────────────────────
export interface MakerSubmitResponse {
  success:       boolean;
  transactionId: string;
  message:       string;
  timestamp:     string;
  status:        'PENDING_CHECKER' | 'ERROR';
}

// ── Dropdown helpers ─────────────────────────────────────────
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
