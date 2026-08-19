import { describe, it, expect, beforeEach, vi } from 'vitest';
import { genericValidator } from './genericValidator';
import { validationRulesService } from './validationRulesService';

describe('GenericValidator Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof validationRulesService.resetToDefaults === 'function') {
      validationRulesService.resetToDefaults();
    }
  });

  it('should evaluate field rules correctly', () => {
    const formData = {
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: '1500.50'
    };

    const result = genericValidator.evaluateField('instructedAmount', formData);
    expect(result).toBeDefined();
    expect(result?.required).toBe(true);
  });

  it('should evaluate all registered fields', () => {
    const formData = {
      debtorAgentBIC: 'CITIUS33XXX',
      debtorAccountNumber: '123456789'
    };

    const fieldMap = genericValidator.evaluateAllFields(formData);
    expect(fieldMap).toBeDefined();
    expect(fieldMap.size).toBeGreaterThan(0);
  });

  it('should evaluate cascading form rules', () => {
    const formData = {
      debtorAddressLines1: '25 Canada Square'
    };

    const formEffects = genericValidator.evaluateFormRules(formData);
    expect(formEffects.debtorTownName?.required).toBe(true);
    expect(formEffects.debtorCountryCode?.required).toBe(true);
  });

  it('should merge form rules on top of field rules using applyToForm', () => {
    const baseFieldMap = new Map();
    baseFieldMap.set('debtorTownName', { required: false, maxLength: 70 });

    const formEffects = {
      debtorTownName: { required: true }
    };

    const merged = genericValidator.applyToForm(baseFieldMap, formEffects);
    expect(merged.get('debtorTownName')?.required).toBe(true);
    expect(merged.get('debtorTownName')?.maxLength).toBe(70);
  });
});