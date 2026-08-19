import { describe, it, expect } from 'vitest';
import { buildPain001FromForm } from '../paymentUtils';
import { Pain001Model, createEmptyPain001 } from '../../types/models';

describe('paymentUtils Unit Tests', () => {
  describe('buildPain001FromForm', () => {
    it('should build a complete Pain001Model preserving core header and amount fields', () => {
      const formValues: Partial<Pain001Model> = {
        requestedExecutionDate: '2026-08-25',
        instructedAmountCurrencyCode: 'USD',
        instructedAmount: 50000,
        painPaymentMethodType: 'CBT',
        chargeBearer: 'DEBT'
      };

      const result = buildPain001FromForm(formValues as Pain001Model);

      expect(result.requestedExecutionDate).toBe('2026-08-25');
      expect(result.instructedAmountCurrencyCode).toBe('USD');
      expect(result.instructedAmount).toBe(50000);
      expect(result.painPaymentMethodType).toBe('CBT');
      expect(result.chargeBearer).toBe('DEBT');
    });

    it('should sanitize numeric amounts and convert string representations correctly', () => {
      const formValues: Partial<Pain001Model> = {
        instructedAmount: '75420.50',
        chargesAmount: '25.00'
      };

      const result = buildPain001FromForm(formValues as Pain001Model);

      expect(result.instructedAmount).toBe('75420.50');
      expect(result.chargesAmount).toBe('25.00');
    });

    it('should preserve and map Debtor and Creditor account and address fields', () => {
      const formValues: Partial<Pain001Model> = {
        debtorName: 'Acme Global Corp',
        debtorAccountNumber: '8378339123456789',
        debtorAgentBIC: 'CITIGB2LXXX',
        debtorAddressLines1: '25 Canada Square',
        debtorAddressLines2: 'Level 14',
        debtorTownName: 'London',
        debtorCountrySubDivision: 'Greater London',
        debtorCountryCode: 'GB',
        debtorSortCodeUK: '12-34-56',
        creditorName: 'Starlight Solutions Inc',
        creditorAccount: '998877665544',
        creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
        creditorAgentFinancialInstitutionName: 'Citibank N.A. New York',
        creditorAddressLines1: '388 Greenwich Street',
        creditorTownName: 'New York',
        creditorCountrySubDivision: 'NY',
        creditorCountryCode: 'US',
        creditorSortCodeUS: '021000021'
      };

      const result = buildPain001FromForm(formValues as Pain001Model);

      expect(result.debtorName).toBe('Acme Global Corp');
      expect(result.debtorAccountNumber).toBe('8378339123456789');
      expect(result.debtorAgentBIC).toBe('CITIGB2LXXX');
      expect(result.debtorAddressLines1).toBe('25 Canada Square');
      expect(result.debtorCountrySubDivision).toBe('Greater London');
      expect(result.debtorSortCodeUK).toBe('12-34-56');

      expect(result.creditorName).toBe('Starlight Solutions Inc');
      expect(result.creditorAccount).toBe('998877665544');
      expect(result.creditorAgentFinancialInstitutionBIC).toBe('CITIUS33XXX');
      expect(result.creditorAddressLines1).toBe('388 Greenwich Street');
      expect(result.creditorSortCodeUS).toBe('021000021');
    });

    it('should preserve all 6 LATAM Tax Details fields when present in the form model', () => {
      const formValues: Partial<Pain001Model> = {
        debtorAgentBIC: 'CITIBR33XXX',
        taxIdNumber: 'TAX-BR-998822',
        taxIdType: 'CNPJ',
        purposeOfPayment: 'COMMERCIAL_EXPORT',
        taxPurposeCode: 'EXPORT_GOODS',
        regulatoryReportingCode: 'REG-BACEN-001',
        invoiceReferenceNumber: 'INV-2026-99012'
      };

      const result = buildPain001FromForm(formValues as Pain001Model);

      expect(result.taxIdNumber).toBe('TAX-BR-998822');
      expect(result.taxIdType).toBe('CNPJ');
      expect(result.purposeOfPayment).toBe('COMMERCIAL_EXPORT');
      expect(result.taxPurposeCode).toBe('EXPORT_GOODS');
      expect(result.regulatoryReportingCode).toBe('REG-BACEN-001');
      expect(result.invoiceReferenceNumber).toBe('INV-2026-99012');
    });

    it('should maintain Intermediary Bank routing information for CBT and DFT payments', () => {
      const formValues: Partial<Pain001Model> = {
        painPaymentMethodType: 'CBT',
        firstIntermediaryBankBIC: 'CITIUS33XXX',
        firstIntermediaryBankAccountNumber: '1100229988',
        firstIntermediaryBankName: 'Citibank Intermediary NY',
        firstIntermediaryBankCountryCode: 'US',
        secondIntermediaryBankBIC: 'BOFAUS3NXXX',
        secondIntermediaryBankAccountNumber: '4455667788',
        secondIntermediaryBankName: 'Bank of America Secondary',
        secondIntermediaryBankCountryCode: 'US'
      };

      const result = buildPain001FromForm(formValues as Pain001Model);

      expect(result.firstIntermediaryBankBIC).toBe('CITIUS33XXX');
      expect(result.firstIntermediaryBankAccountNumber).toBe('1100229988');
      expect(result.secondIntermediaryBankBIC).toBe('BOFAUS3NXXX');
      expect(result.secondIntermediaryBankAccountNumber).toBe('4455667788');
    });

    it('should fallback to default application and empty properties for unassigned keys', () => {
      const emptyBase = createEmptyPain001();
      const result = buildPain001FromForm(emptyBase);

      expect(result.applicationName).toBe('ADR');
      expect(result.applicationModule).toBe('ADR');
      expect(result.ustrdPaymentDetails).toBe('');
      expect(result.debtorStreetName).toBe('');
      expect(result.creditorStreetName).toBe('');
    });
  });
});