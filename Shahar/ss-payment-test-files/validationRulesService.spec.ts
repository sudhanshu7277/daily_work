import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validationRulesService,
  DEFAULT_VALIDATION_RULES,
  EMEA_COUNTRIES,
  LATAM_COUNTRIES,
  ZERO_DECIMAL_CURRENCIES,
  THREE_DECIMAL_CURRENCIES
} from '../validationRulesService';

describe('ValidationRulesService', () => {
  beforeEach(() => {
    validationRulesService.resetToDefaults();
  });

  it('should return default rules on initialization', () => {
    const rules = validationRulesService.getRules();
    expect(rules.version).toBe('3.3.0');
    expect(rules.fields).toBeDefined();
    expect(rules.formRules.length).toBeGreaterThan(0);
  });

  it('should derive bicCountry correctly from 6+ character BIC codes', () => {
    const form = { debtorAgentBIC: 'CITIUS33XXX' };
    const country = validationRulesService.deriveValue(form, 'debtorAgentBIC', 'bicCountry');
    expect(country).toBe('US');

    const emeaForm = { debtorAgentBIC: 'CITIGB2LXXX' };
    const emeaCountry = validationRulesService.deriveValue(emeaForm, 'debtorAgentBIC', 'bicCountry');
    expect(emeaCountry).toBe('GB');
  });

  it('should evaluate condition operators (eq, neq, in, notIn, empty, notEmpty, regex)', () => {
    const form = {
      currency: 'USD',
      amount: '500',
      debtorBIC: 'CITIGB2LXXX',
      emptyField: ''
    };

    expect(validationRulesService.evaluateCondition({ sourceField: 'currency', operator: 'eq', value: 'USD' }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'currency', operator: 'neq', value: 'EUR' }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'debtorBIC', derivation: 'bicCountry', operator: 'in', value: EMEA_COUNTRIES }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'debtorBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }, form)).toBe(false);
    expect(validationRulesService.evaluateCondition({ sourceField: 'emptyField', operator: 'empty' }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'amount', operator: 'notEmpty' }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'amount', operator: 'regex', value: '^\\d+$' }, form)).toBe(true);
  });

  it('should include 6 LATAM tax fields in DEFAULT_VALIDATION_RULES', () => {
    const fields = validationRulesService.getRules().fields;
    expect(fields.taxIdNumber).toBeDefined();
    expect(fields.taxIdType).toBeDefined();
    expect(fields.purposeOfPayment).toBeDefined();
    expect(fields.taxPurposeCode).toBeDefined();
    expect(fields.regulatoryReportingCode).toBeDefined();
    expect(fields.invoiceReferenceNumber).toBeDefined();
  });

  it('should fetch remote rules and update configuration if endpoint succeeds', async () => {
    const mockRules = {
      version: '9.9.9',
      fields: {},
      formRules: []
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRules
    } as any);

    const res = await validationRulesService.loadRemoteRules('/custom-endpoint');
    expect(res.version).toBe('9.9.9');
    expect(validationRulesService.getRules().version).toBe('9.9.9');
  });
});