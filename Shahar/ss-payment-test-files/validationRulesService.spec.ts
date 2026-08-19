import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validationRulesService } from './validationRulesService';

describe('ValidationRulesService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof validationRulesService.resetToDefaults === 'function') {
      validationRulesService.resetToDefaults();
    }
  });

  it('should initialize and return valid rules configuration', () => {
    const rules = validationRulesService.getRules();
    expect(rules).toBeDefined();
    expect(rules.fields).toBeDefined();
    expect(typeof rules.fields).toBe('object');
  });

  it('should derive bicCountry from BIC string', () => {
    const form = { debtorAgentBIC: 'CITIUS33XXX' };
    const country = validationRulesService.deriveValue(form, 'debtorAgentBIC', 'bicCountry');
    expect(country).toBe('US');
  });

  it('should evaluate condition operators correctly', () => {
    const form = {
      currency: 'USD',
      debtorBIC: 'CITIGB2LXXX',
      amount: '100'
    };

    expect(validationRulesService.evaluateCondition({ sourceField: 'currency', operator: 'eq', value: 'USD' }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'currency', operator: 'neq', value: 'EUR' }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'debtorBIC', derivation: 'bicCountry', operator: 'in', value: ['GB', 'DE'] }, form)).toBe(true);
    expect(validationRulesService.evaluateCondition({ sourceField: 'amount', operator: 'notEmpty' }, form)).toBe(true);
  });

  it('should fetch remote rules and update configuration if endpoint succeeds', async () => {
    const mockRules = {
      version: '1.0.0',
      fields: {},
      formRules: []
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRules
    } as any);

    const res = await validationRulesService.loadRemoteRules('/mock-endpoint');
    expect(res).toBeDefined();
  });
});