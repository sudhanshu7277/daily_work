import {
    validationRulesService,
    ValidationCondition,
    ValidationEffect,
    Pain001ValidationRules
  } from './validationRulesService';
  
  export type {
    ValidationCondition,
    ValidationEffect,
    FieldValidationRule,
    FormRule,
    Pain001ValidationRules
  } from './validationRulesService';
  
  export interface FieldValidationResult {
    fieldName: string;
    required?: boolean;
    visible?: boolean;
    pattern?: string;
    patternMessage?: string;
    maxLength?: number;
    decimalPlaces?: number;
  }
  
  export function configureValidationRules(rules: Pain001ValidationRules): void {
    validationRulesService.setRules(rules);
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
    const activeRules = validationRulesService.getRules();
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
    const activeRules = validationRulesService.getRules();
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