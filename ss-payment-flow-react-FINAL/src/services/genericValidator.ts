// ============================================================================
// Functional API matching actual usage in PaymentChild.tsx:
//   genericValidator.evaluateAllFields(formValues)
//   genericValidator.evaluateFormRules(formValues)
//   genericValidator.applyToForm(fieldResults, formRuleEffects)
//
// IMPORTANT GAP: the actual JSON/rules data that drives dynamic
// required/visible/pattern-per-field behavior was never captured in any
// session — only the rule-engine's TYPES and evaluation LOGIC were (see the
// class-based GenericValidatorService built earlier in this conversion,
// which had the real conditionMatches/mergeEffects logic ported from
// generic-validator.service.ts). This file wraps that same evaluation logic
// behind the functional call shape these two files actually use, but with
// NO rules configured by default — every field evaluates to
// { required: false, visible: true } until real rules are supplied via
// configureValidationRules() below. This means dynamic show/hide (e.g. for
// the intermediary bank sections) and dynamic required-ness will NOT
// activate until that's wired in with real rule data.
// ============================================================================

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

let activeRules: Pain001ValidationRules = { version: '0', fields: {}, formRules: [] };

/** Call this once real rule JSON is available to actually activate dynamic validation. */
export function configureValidationRules(rules: Pain001ValidationRules): void {
  activeRules = rules;
}

function isValueEmpty(v: unknown): boolean {
  return v === null || v === undefined || String(v as string).trim() === '';
}

function extractCountryFromBIC(bic: string): string {
  if (!bic || bic.length < 6) return '';
  return bic.substring(4, 6).toUpperCase();
}

function conditionMatches(condition: ValidationCondition, formValues: Record<string, unknown>): boolean {
  const sourceFields = condition.sourceField.split(',');

  if (sourceFields.length > 1) {
    if (condition.operator === 'notEmpty') {
      return sourceFields.some((f) => !isValueEmpty(formValues[f.trim()]));
    }
    if (condition.operator === 'empty') {
      return sourceFields.every((f) => isValueEmpty(formValues[f.trim()]));
    }
  }

  const rawValue = formValues[sourceFields[0].trim()];
  let compareValue = isValueEmpty(rawValue) ? '' : String(rawValue as string).trim();
  if (condition.derivation === 'bicCountry') compareValue = extractCountryFromBIC(compareValue);

  switch (condition.operator) {
    case 'eq': return compareValue === condition.value;
    case 'neq': return compareValue !== condition.value;
    case 'in': return Array.isArray(condition.value) && condition.value.includes(compareValue);
    case 'notIn': return Array.isArray(condition.value) && !condition.value.includes(compareValue);
    case 'empty': return compareValue === '';
    case 'notEmpty': return compareValue !== '';
    default: return false;
  }
}

function allConditionsMatch(conditions: ValidationCondition[], formValues: Record<string, unknown>): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => conditionMatches(c, formValues));
}

function effectToResult(fieldName: string, effect: ValidationEffect): FieldValidationResult {
  return {
    fieldName,
    required: effect.required ?? false,
    visible: effect.visible ?? true,
    pattern: effect.pattern,
    patternMessage: effect.patternMessage,
    maxLength: effect.maxLength,
    decimalPlaces: effect.decimalPlaces,
  };
}

function mergeEffects(base: ValidationEffect, override: ValidationEffect): ValidationEffect {
  return {
    required: override.required ?? base.required,
    visible: override.visible ?? base.visible,
    pattern: override.pattern ?? base.pattern,
    patternMessage: override.patternMessage ?? base.patternMessage,
    maxLength: override.maxLength ?? base.maxLength,
    decimalPlaces: override.decimalPlaces ?? base.decimalPlaces,
  };
}

export function evaluateAllFields(formValues: Record<string, unknown>): Map<string, FieldValidationResult> {
  const results = new Map<string, FieldValidationResult>();
  for (const fieldName of Object.keys(activeRules.fields)) {
    const rules = activeRules.fields[fieldName];
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    let result: FieldValidationResult = { fieldName, required: false, visible: true };
    for (const rule of sorted) {
      if (allConditionsMatch(rule.conditions, formValues)) {
        result = effectToResult(fieldName, rule.effect);
        break;
      }
    }
    results.set(fieldName, result);
  }
  return results;
}

export function evaluateFormRules(formValues: Record<string, unknown>): Map<string, ValidationEffect> {
  const effects = new Map<string, ValidationEffect>();
  for (const rule of activeRules.formRules) {
    if (allConditionsMatch(rule.conditions, formValues)) {
      for (const [fieldName, effect] of Object.entries(rule.effects)) {
        const existing = effects.get(fieldName);
        effects.set(fieldName, existing ? mergeEffects(existing, effect) : { ...effect });
      }
    }
  }
  return effects;
}

export function applyToForm(
  fieldResults: Map<string, FieldValidationResult>,
  formRuleEffects: Map<string, ValidationEffect>
): Map<string, FieldValidationResult> {
  const merged = new Map(fieldResults);
  for (const [fieldName, effect] of formRuleEffects) {
    const existing = merged.get(fieldName);
    if (existing) {
      merged.set(fieldName, { ...existing, ...mergeEffects(existing, effect) });
    } else {
      merged.set(fieldName, effectToResult(fieldName, effect));
    }
  }
  return merged;
}
