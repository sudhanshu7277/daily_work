export interface ValidationCondition {
    factor?: 'country' | 'paymentType' | 'currency' | 'paymentMethod' | 'fieldValue';
    sourceField: string;
    derivation?: 'bicCountry';
    operator: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'regex';
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
    required?: boolean;
    visible?: boolean;
    pattern?: string;
    patternMessage?: string;
    maxLength?: number;
    decimalPlaces?: number;
  }
  
  let activeRules: Pain001ValidationRules = {
    version: '1.0.0',
    fields: {
      instructedAmount: [
        {
          priority: 10,
          conditions: [
            { sourceField: 'instructedAmountCurrencyCode', operator: 'in', value: ['JPY', 'KRW', 'CLP', 'VND', 'UGX', 'PYG'] }
          ],
          effect: { required: true, decimalPlaces: 0, pattern: '^\\d+$', patternMessage: 'No decimal places allowed for this currency' }
        },
        {
          priority: 10,
          conditions: [
            { sourceField: 'instructedAmountCurrencyCode', operator: 'in', value: ['BHD', 'KWD', 'OMR', 'JOD', 'TND', 'IQD'] }
          ],
          effect: { required: true, decimalPlaces: 3, pattern: '^\\d+(\\.\\d{1,3})?$', patternMessage: 'Up to 3 decimal places allowed' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: true, decimalPlaces: 2, pattern: '^\\d+(\\.\\d{1,2})?$', patternMessage: 'Up to 2 decimal places allowed' }
        }
      ],
      debtorPostalCode: [
        {
          priority: 10,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: { required: true, pattern: '^\\d{5}(-\\d{4})?$', patternMessage: 'US ZIP must be 5 digits (e.g. 12345 or 12345-6789)' }
        },
        {
          priority: 10,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: { required: true, pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', patternMessage: 'Invalid UK Postal Code format' }
        },
        {
          priority: 10,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'CA' }],
          effect: { required: true, pattern: '^[A-CEGHJ-NPR-TV-Z]\\d[A-CEGHJ-NPR-TV-Z] ?\\d[A-CEGHJ-NPR-TV-Z]\\d$', patternMessage: 'Invalid Canadian Postal Code' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: false, maxLength: 16 }
        }
      ],
      creditorPostalCode: [
        {
          priority: 10,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: { required: true, pattern: '^\\d{5}(-\\d{4})?$', patternMessage: 'US ZIP must be 5 digits' }
        },
        {
          priority: 10,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: { required: true, pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', patternMessage: 'Invalid UK Postal Code format' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: false, maxLength: 16 }
        }
      ],
      taxIdNumber: [
        {
          priority: 20,
          conditions: [
            { sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'PE' },
            { sourceField: 'painPaymentMethodType', operator: 'eq', value: 'CBT' }
          ],
          effect: { required: true, pattern: '^(10|15|17|20)\\d{9}$', patternMessage: 'Peru RUC must be 11 digits starting with 10, 15, 17, or 20' }
        },
        {
          priority: 20,
          conditions: [
            { sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'BR' }
          ],
          effect: { required: true, pattern: '^\\d{14}$|^\\d{11}$', patternMessage: 'Brazil Tax ID must be 11 (CPF) or 14 (CNPJ) digits' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: false, visible: true }
        }
      ]
    },
    formRules: [
      {
        id: 'intermediary_chain',
        description: 'Second intermediary requires First intermediary BIC',
        watchFields: ['firstIntermediaryBankBIC'],
        conditions: [{ sourceField: 'firstIntermediaryBankBIC', operator: 'empty' }],
        effects: {
          secondIntermediaryBankBIC: { visible: false, required: false },
          secondIntermediaryBankAccountNumber: { visible: false, required: false }
        }
      },
      {
        id: 'charge_bearer_pair',
        description: 'Charges Agent BIC required when Charges Amount is present',
        watchFields: ['chargesAmount'],
        conditions: [{ sourceField: 'chargesAmount', operator: 'notEmpty' }],
        effects: {
          chargesAgentBIC: { required: true },
          chargeBearer: { required: true }
        }
      }
    ]
  };
  
  export function configureValidationRules(rules: Pain001ValidationRules): void {
    activeRules = rules;
  }
  
  function isValueEmpty(v: unknown): boolean {
    return v === null || v === undefined || String(v).trim() === '';
  }
  
  function extractCountryFromBIC(bic: string): string {
    if (!bic || bic.length < 6) return '';
    return bic.substring(4, 6).toUpperCase();
  }
  
  function conditionMatches(condition: ValidationCondition, formValues: Record<string, unknown>): boolean {
    const sourceFields = condition.sourceField.split(',');
  
    if (sourceFields.length > 1) {
      if (condition.operator === 'notEmpty') {
        return sourceFields.some(f => !isValueEmpty(formValues[f.trim()]));
      }
      if (condition.operator === 'empty') {
        return sourceFields.every(f => isValueEmpty(formValues[f.trim()]));
      }
    }
  
    const rawValue = formValues[sourceFields[0].trim()];
    let compareValue = isValueEmpty(rawValue) ? '' : String(rawValue).trim();
  
    if (condition.derivation === 'bicCountry') {
      compareValue = extractCountryFromBIC(compareValue);
    }
  
    switch (condition.operator) {
      case 'eq':
        return compareValue === condition.value;
      case 'neq':
        return compareValue !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(compareValue);
      case 'notIn':
        return Array.isArray(condition.value) && !condition.value.includes(compareValue);
      case 'empty':
        return compareValue === '';
      case 'notEmpty':
        return compareValue !== '';
      case 'regex':
        return typeof condition.value === 'string' ? new RegExp(condition.value).test(compareValue) : true;
      default:
        return false;
    }
  }
  
  function allConditionsMatch(conditions: ValidationCondition[], formValues: Record<string, unknown>): boolean {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every(c => conditionMatches(c, formValues));
  }
  
  function effectToResult(fieldName: string, effect: ValidationEffect): FieldValidationResult {
    return {
      fieldName,
      required: effect.required ?? false,
      visible: effect.visible ?? true,
      pattern: effect.pattern,
      patternMessage: effect.patternMessage,
      maxLength: effect.maxLength,
      decimalPlaces: effect.decimalPlaces
    };
  }
  
  function mergeEffects(base: ValidationEffect, override: ValidationEffect): ValidationEffect {
    return {
      required: override.required ?? base.required,
      visible: override.visible ?? base.visible,
      pattern: override.pattern ?? base.pattern,
      patternMessage: override.patternMessage ?? base.patternMessage,
      maxLength: override.maxLength ?? base.maxLength,
      decimalPlaces: override.decimalPlaces ?? base.decimalPlaces
    };
  }
  
  export function evaluateAllFields(formValues: Record<string, unknown>): Map<string, FieldValidationResult> {
    const results = new Map<string, FieldValidationResult>();
    for (const fieldName of Object.keys(activeRules.fields)) {
      const rules = activeRules.fields[fieldName];
      const sorted = [...rules].sort((a, b) => b.priority - a.priority);
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
  ): Map<string, ValidationEffect> {
    const merged = new Map<string, ValidationEffect>();
    
    fieldResults.forEach((val, key) => {
      merged.set(key, { ...val });
    });
  
    for (const [fieldName, effect] of formRuleEffects.entries()) {
      const existing = merged.get(fieldName);
      if (existing) {
        merged.set(fieldName, mergeEffects(existing, effect));
      } else {
        merged.set(fieldName, { required: false, visible: true, ...effect });
      }
    }
    return merged;
  }
  
  export const genericValidator = {
    evaluateAllFields,
    evaluateFormRules,
    applyToForm,
    configureValidationRules
  };