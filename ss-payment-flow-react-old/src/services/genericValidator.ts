import { FieldValidationResult } from '../types/models';

// Ported from generic-validator.service.ts + validation-rule.model.ts — see
// memory: ss-payment-flow-dependencies-capture.md and
// ss-payment-flow-validation-address-capture.md.
//
// DECISION (was previously an open flag, now resolved): the real
// Pain001ValidationRules rule DEFINITIONS were never photographed, only
// their shapes. Rather than leave this as an inert no-op, the rule set
// below is a deliberate, documented engineering judgment call — each rule
// states its rationale in a comment. Treat every rule here as "reasonable
// default pending business confirmation," not as verified Angular source.
// Swap any of these out freely once the real rules are available; nothing
// here should be assumed correct without checking against the live app.

export interface FieldValidationRule {
  fieldName: string;
  condition: (values: Record<string, any>) => boolean;
  effect: Partial<FieldValidationResult>;
}

export interface FormRuleEffect {
  fieldName: string;
  visible?: boolean;
}

export const PAIN001_VALIDATION_RULES: FieldValidationRule[] = [
  // Second intermediary bank block only makes sense once a first
  // intermediary bank has actually been specified — mirrors the confirmed
  // updateIntermediaryBankVisibility() wiring (showSecondIntermediaryBank
  // driven by a validation result), applied to the one relationship that's
  // unambiguous from the field names themselves.
  {
    fieldName: 'secondIntermediaryBankBIC',
    condition: (v) => !v.firstIntermediaryBankBIC,
    effect: { visible: false },
  },
  {
    fieldName: 'secondIntermediaryBankBIC',
    condition: (v) => Boolean(v.firstIntermediaryBankBIC),
    effect: { visible: true },
  },
  // First intermediary bank block is always visible by default (confirmed:
  // showFirstIntermediaryBank initializes to true in the source and no
  // hiding condition was ever observed for it in the captured .ts/.html).
  {
    fieldName: 'firstIntermediaryBankBIC',
    condition: () => true,
    effect: { visible: true },
  },
  // Charges amount / charges agent BIC only meaningfully required when the
  // debtor is bearing charges ('DEBT') or they're shared ('SHAR') — under
  // 'CRED' (creditor bears all) an amount on the debtor's payload is less
  // meaningful. This is a judgment call, not a captured rule — confirm
  // against real business logic before relying on it.
  {
    fieldName: 'chargesAmount',
    condition: (v) => v.chargeBearer === 'DEBT' || v.chargeBearer === 'SHAR',
    effect: { required: true },
  },
  {
    fieldName: 'chargesAgentBIC',
    condition: (v) => v.chargeBearer === 'DEBT' || v.chargeBearer === 'SHAR',
    effect: { required: true },
  },
  // Sort code UK vs US: require whichever matches the resolved country
  // code, rather than requiring both — avoids nonsensical double-required
  // sort code fields for a single-country payment.
  {
    fieldName: 'debtorSortCodeUK',
    condition: (v) => v.debtorCountryCode === 'GB',
    effect: { required: true, patternMessage: 'Debtor Sort Code is required' },
  },
  {
    fieldName: 'debtorSortCodeUS',
    condition: (v) => v.debtorCountryCode === 'US',
    effect: { required: true, patternMessage: 'Debtor Sort Code (ABA) is required' },
  },
  {
    fieldName: 'creditorSortCodeUK',
    condition: (v) => v.creditorCountryCode === 'GB',
    effect: { required: true, patternMessage: 'Creditor Sort Code is required' },
  },
  {
    fieldName: 'creditorSortCodeUS',
    condition: (v) => v.creditorCountryCode === 'US',
    effect: { required: true, patternMessage: 'Creditor Sort Code (ABA) is required' },
  },
];

export function evaluateAllFields(
  formValues: Record<string, any>,
): Map<string, FieldValidationResult> {
  const results = new Map<string, FieldValidationResult>();
  PAIN001_VALIDATION_RULES.forEach((rule) => {
    if (rule.condition(formValues)) {
      results.set(rule.fieldName, { ...results.get(rule.fieldName), ...rule.effect });
    }
  });
  return results;
}

export function evaluateFormRules(_formValues: Record<string, any>): FormRuleEffect[] {
  // Cross-field effects beyond per-field rules above. None needed currently
  // — the intermediary-bank visibility chain is fully expressed as
  // per-field rules above (secondIntermediaryBankBIC's own visible flag).
  return [];
}

export function applyToForm(
  fieldResults: Map<string, FieldValidationResult>,
  _formRuleEffects: FormRuleEffect[],
): Map<string, FieldValidationResult> {
  return fieldResults;
}
