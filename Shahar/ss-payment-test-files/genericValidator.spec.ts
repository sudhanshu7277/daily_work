import { describe, it, expect } from 'vitest';
import { genericValidator } from '../genericValidator';

describe('GenericValidator Service', () => {
  it('should evaluate field rules and return highest priority matching rule effect', () => {
    const formData = {
      instructedAmountCurrencyCode: 'JPY',
      debtorAgentBIC: 'CITIGB2LXXX',
      debtorAccountNumber: '1234567890123456'
    };

    const results = genericValidator.evaluateAllFields(formData);
    const amountRule = results.get('instructedAmount');
    expect(amountRule).toBeDefined();
    expect(amountRule?.decimalPlaces).toBe(0);

    const accRule = results.get('debtorAccountNumber');
    expect(accRule).toBeDefined();
    expect(accRule?.maxLength).toBe(16);
  });

  it('should evaluate form cascading rules (e.g., debtor address requires town & country)', () => {
    const formWithAddress = {
      debtorAddressLines1: '123 High Street'
    };

    const formEffects = genericValidator.evaluateFormRules(formWithAddress);
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