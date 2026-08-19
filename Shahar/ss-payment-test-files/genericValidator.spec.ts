import { describe, it, expect, beforeEach } from 'vitest';
import { genericValidator } from '../genericValidator';
import { validationRulesService } from '../validationRulesService';

describe('GenericValidator Service', () => {
  beforeEach(() => {
    validationRulesService.resetToDefaults();
  });

  describe('Currency & Amount Decimal Evaluation', () => {
    it('should assign decimalPlaces = 0 and whole number pattern for zero-decimal currencies (JPY, KRW, VND)', () => {
      const formData = {
        instructedAmountCurrencyCode: 'JPY',
        instructedAmount: '1000'
      };

      const result = genericValidator.evaluateField('instructedAmount', formData);
      expect(result).toBeDefined();
      expect(result?.decimalPlaces).toBe(0);
      expect(result?.required).toBe(true);
      expect(result?.pattern).toBe('^[1-9]\\d*$');
      expect(result?.patternMessage).toContain('Zero decimal currency');
    });

    it('should assign decimalPlaces = 3 and 3-decimal pattern for 3-decimal currencies (BHD, KWD, OMR)', () => {
      const formData = {
        instructedAmountCurrencyCode: 'BHD',
        instructedAmount: '250.750'
      };

      const result = genericValidator.evaluateField('instructedAmount', formData);
      expect(result).toBeDefined();
      expect(result?.decimalPlaces).toBe(3);
      expect(result?.pattern).toBe('^\\d+(\\.\\d{1,3})?$');
      expect(result?.patternMessage).toContain('3 decimal places allowed');
    });

    it('should fallback to default decimalPlaces = 2 for standard currencies (USD, EUR, GBP)', () => {
      const formData = {
        instructedAmountCurrencyCode: 'USD',
        instructedAmount: '1500.50'
      };

      const result = genericValidator.evaluateField('instructedAmount', formData);
      expect(result).toBeDefined();
      expect(result?.decimalPlaces).toBe(2);
      expect(result?.pattern).toBe('^\\d+(\\.\\d{1,2})?$');
      expect(result?.patternMessage).toContain('2 decimal places allowed');
    });
  });

  describe('Debtor Account Number & BIC Evaluation', () => {
    it('should enforce 16 numeric digits when Debtor Agent BIC is in UK/EMEA (GB, DE, FR, etc.)', () => {
      const formData = {
        debtorAgentBIC: 'CITIGB2LXXX',
        debtorAccountNumber: '8378339123456789'
      };

      const result = genericValidator.evaluateField('debtorAccountNumber', formData);
      expect(result).toBeDefined();
      expect(result?.maxLength).toBe(16);
      expect(result?.pattern).toBe('^\\d{16}$');
      expect(result?.patternMessage).toContain('16 numeric digits for UK/EMEA');
    });

    it('should enforce standard numeric-only rule when Debtor Agent BIC is outside EMEA (e.g. US)', () => {
      const formData = {
        debtorAgentBIC: 'CITIUS33XXX',
        debtorAccountNumber: '12345678901'
      };

      const result = genericValidator.evaluateField('debtorAccountNumber', formData);
      expect(result).toBeDefined();
      expect(result?.pattern).toBe('^\\d+$');
      expect(result?.patternMessage).toContain('numeric only');
    });

    it('should validate 8 or 11 alphanumeric BIC format on debtorAgentBIC and creditorAgentBIC', () => {
      const formData = {
        debtorAgentBIC: 'CITIUS33',
        creditorAgentFinancialInstitutionBIC: 'CHASUS33XXX'
      };

      const debtorBicRule = genericValidator.evaluateField('debtorAgentBIC', formData);
      const creditorBicRule = genericValidator.evaluateField('creditorAgentFinancialInstitutionBIC', formData);

      expect(debtorBicRule?.maxLength).toBe(11);
      expect(debtorBicRule?.required).toBe(true);
      expect(debtorBicRule?.pattern).toBe('^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$');

      expect(creditorBicRule?.maxLength).toBe(11);
      expect(creditorBicRule?.required).toBe(true);
    });
  });

  describe('National Sort Codes Dynamic Visibility', () => {
    it('should set debtorSortCodeUS to visible and 9 digits when Debtor BIC country is US', () => {
      const formData = {
        debtorAgentBIC: 'CITIUS33XXX'
      };

      const result = genericValidator.evaluateField('debtorSortCodeUS', formData);
      expect(result?.visible).toBe(true);
      expect(result?.maxLength).toBe(9);
      expect(result?.pattern).toBe('^\\d{9}$');
    });

    it('should set debtorSortCodeUS to hidden when Debtor BIC country is not US', () => {
      const formData = {
        debtorAgentBIC: 'CITIGB2LXXX'
      };

      const result = genericValidator.evaluateField('debtorSortCodeUS', formData);
      expect(result?.visible).toBe(false);
    });

    it('should set debtorSortCodeUK to visible when Debtor BIC country is GB', () => {
      const formData = {
        debtorAgentBIC: 'CITIGB2LXXX'
      };

      const result = genericValidator.evaluateField('debtorSortCodeUK', formData);
      expect(result?.visible).toBe(true);
      expect(result?.maxLength).toBe(8);
    });
  });

  describe('LATAM Tax Details Dynamic Rules (6 Fields)', () => {
    it('should activate and mandate all 6 Tax Details fields when Debtor BIC matches LATAM (e.g. BR, PE, CO, AR)', () => {
      const formData = {
        debtorAgentBIC: 'CITIBR33XXX'
      };

      const fieldMap = genericValidator.evaluateAllFields(formData);

      const taxFields = [
        'taxIdNumber',
        'taxIdType',
        'purposeOfPayment',
        'taxPurposeCode',
        'regulatoryReportingCode',
        'invoiceReferenceNumber'
      ];

      taxFields.forEach(fieldName => {
        const rule = fieldMap.get(fieldName);
        expect(rule, `Expected ${fieldName} rule to exist`).toBeDefined();
        expect(rule?.visible, `Expected ${fieldName} to be visible`).toBe(true);
        expect(rule?.required, `Expected ${fieldName} to be required`).toBe(true);
        expect(rule?.patternMessage).toContain('required');
      });
    });

    it('should hide all 6 Tax Details fields when Debtor BIC is not in LATAM region (e.g. US, GB, DE)', () => {
      const formData = {
        debtorAgentBIC: 'CITIUS33XXX'
      };

      const fieldMap = genericValidator.evaluateAllFields(formData);

      const taxFields = [
        'taxIdNumber',
        'taxIdType',
        'purposeOfPayment',
        'taxPurposeCode',
        'regulatoryReportingCode',
        'invoiceReferenceNumber'
      ];

      taxFields.forEach(fieldName => {
        const rule = fieldMap.get(fieldName);
        expect(rule?.visible).toBe(false);
      });
    });
  });

  describe('Cross-Field Form Rules Cascading & Coupling', () => {
    it('should mandate debtorTownName and debtorCountryCode when debtorAddressLines1 is populated', () => {
      const formData = {
        debtorAddressLines1: '25 Canada Square'
      };

      const formEffects = genericValidator.evaluateFormRules(formData);
      expect(formEffects.debtorTownName?.required).toBe(true);
      expect(formEffects.debtorCountryCode?.required).toBe(true);
    });

    it('should mandate creditorTownName and creditorCountryCode when creditorAddressLines1 is populated', () => {
      const formData = {
        creditorAddressLines1: '388 Greenwich Street'
      };

      const formEffects = genericValidator.evaluateFormRules(formData);
      expect(formEffects.creditorTownName?.required).toBe(true);
      expect(formEffects.creditorCountryCode?.required).toBe(true);
    });

    it('should mandate firstIntermediaryBankAccountNumber when firstIntermediaryBankBIC is entered', () => {
      const formData = {
        firstIntermediaryBankBIC: 'CITIUS33XXX'
      };

      const formEffects = genericValidator.evaluateFormRules(formData);
      expect(formEffects.firstIntermediaryBankAccountNumber?.required).toBe(true);
    });

    it('should mandate secondIntermediaryBankAccountNumber when secondIntermediaryBankBIC is entered', () => {
      const formData = {
        secondIntermediaryBankBIC: 'BOFAUS3NXXX'
      };

      const formEffects = genericValidator.evaluateFormRules(formData);
      expect(formEffects.secondIntermediaryBankAccountNumber?.required).toBe(true);
    });

    it('should mandate chargesAgentBIC and chargeBearer when chargesAmount is greater than 0', () => {
      const formData = {
        chargesAmount: '15.00'
      };

      const formEffects = genericValidator.evaluateFormRules(formData);
      expect(formEffects.chargesAgentBIC?.required).toBe(true);
      expect(formEffects.chargeBearer?.required).toBe(true);
    });
  });

  describe('Form Effects Merge (`applyToForm`)', () => {
    it('should cleanly merge form rule effects on top of evaluated field rule maps', () => {
      const baseFieldMap = new Map();
      baseFieldMap.set('debtorTownName', { required: false, maxLength: 70, visible: true });
      baseFieldMap.set('debtorCountryCode', { required: false, maxLength: 2, visible: true });

      const formEffects = {
        debtorTownName: { required: true },
        debtorCountryCode: { required: true }
      };

      const mergedMap = genericValidator.applyToForm(baseFieldMap, formEffects);

      expect(mergedMap.get('debtorTownName')?.required).toBe(true);
      expect(mergedMap.get('debtorTownName')?.maxLength).toBe(70);
      expect(mergedMap.get('debtorCountryCode')?.required).toBe(true);
      expect(mergedMap.get('debtorCountryCode')?.maxLength).toBe(2);
    });
  });
});