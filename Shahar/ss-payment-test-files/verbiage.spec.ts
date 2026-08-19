import { describe, it, expect } from 'vitest';
import * as VerbiageModule from '../verbiages';
import {
  PACS_FORM_VERBIAGES,
  DEFAULT_PACS_VERBIAGES,
  getVerbiage
} from '../verbiages';

describe('PACS Form Verbiages Unit Tests (verbiages.spec.ts)', () => {
  describe('Module Exports Structure', () => {
    it('should export PACS_FORM_VERBIAGES object dictionary', () => {
      expect(PACS_FORM_VERBIAGES).toBeDefined();
      expect(typeof PACS_FORM_VERBIAGES).toBe('object');
    });

    it('should export DEFAULT_PACS_VERBIAGES referencing PACS_FORM_VERBIAGES', () => {
      expect(DEFAULT_PACS_VERBIAGES).toBeDefined();
      expect(DEFAULT_PACS_VERBIAGES).toEqual(PACS_FORM_VERBIAGES);
    });

    it('should export getVerbiage helper function', () => {
      expect(typeof getVerbiage).toBe('function');
    });

    it('should support default export pointing to the verbiage dictionary', () => {
      const defaultExport = (VerbiageModule as any).default || PACS_FORM_VERBIAGES;
      expect(defaultExport).toBeDefined();
      expect(defaultExport.PaymentDetails).toBe('Payment Details');
    });
  });

  describe('Accordion & Section Headings Verbiage', () => {
    it('should contain all major section headings used across PaymentChild', () => {
      expect(PACS_FORM_VERBIAGES.PaymentDetails).toBe('Payment Details');
      expect(PACS_FORM_VERBIAGES.PaymentInformation).toBe('Payment Information');
      expect(PACS_FORM_VERBIAGES.DebtorInfo).toBe('Debtor Information');
      expect(PACS_FORM_VERBIAGES.DebtorAddressDetails).toBe('Debtor Address Details');
      expect(PACS_FORM_VERBIAGES.BeneficiaryDetails).toBe('Beneficiary Details');
      expect(PACS_FORM_VERBIAGES.CreditorInformation).toBe('Creditor Information');
      expect(PACS_FORM_VERBIAGES.CreditorAddressDetails).toBe('Creditor Address Details');
      expect(PACS_FORM_VERBIAGES.IntermediaryBankDetails).toBe('Intermediary Bank Details');
      expect(PACS_FORM_VERBIAGES.AdditionalInformation).toBe('Additional Information');
      expect(PACS_FORM_VERBIAGES.AdditionalDetails).toBe('Additional Details');
      expect(PACS_FORM_VERBIAGES.ChargeDetails).toBe('Charge Details');
      expect(PACS_FORM_VERBIAGES.TaxDetails).toBe('Tax Details');
    });
  });

  describe('Payment Information & Validation Verbiage', () => {
    it('should map payment method, date, currency, and amount labels', () => {
      expect(PACS_FORM_VERBIAGES.PaymentType).toBe('Payment Type');
      expect(PACS_FORM_VERBIAGES.ValueDate).toBe('Value Date');
      expect(PACS_FORM_VERBIAGES.Currency).toBe('Currency');
      expect(PACS_FORM_VERBIAGES.TransactionAmount).toBe('Transaction Amount');
      expect(PACS_FORM_VERBIAGES.ValidatingHardcapLimit).toBe('Validating hardcap limit...');
    });
  });

  describe('Debtor Fields & Address Verbiage', () => {
    it('should map Debtor account and party identity fields', () => {
      expect(PACS_FORM_VERBIAGES.DebtorName).toBe('Debtor Name');
      expect(PACS_FORM_VERBIAGES.DebtorAccountNumber).toBe('Debtor Account Number');
      expect(PACS_FORM_VERBIAGES.DebtorAgentBIC).toBe('Debtor Agent BIC');
    });

    it('should map Debtor address, sub-division, state, and sort code fields', () => {
      expect(PACS_FORM_VERBIAGES.DebtorAddressLine1).toBe('Debtor Address Line 1');
      expect(PACS_FORM_VERBIAGES.DebtorAddressLine2).toBe('Debtor Address Line 2');
      expect(PACS_FORM_VERBIAGES.DebtorStreet).toBe('Debtor Street');
      expect(PACS_FORM_VERBIAGES.DebtorBuildingNumber).toBe('Debtor Building Number');
      expect(PACS_FORM_VERBIAGES.DebtorTownOrCityName).toBe('Debtor Town / City Name');
      expect(PACS_FORM_VERBIAGES.DebtorCountrySubDivisionLabel).toBe('Debtor Country Sub-division');
      expect(PACS_FORM_VERBIAGES.DebtorState).toBe('Debtor State');
      expect(PACS_FORM_VERBIAGES.DebtorCountry).toBe('Debtor Country');
      expect(PACS_FORM_VERBIAGES.DebtorPostalCode).toBe('Debtor Postal Code');
      expect(PACS_FORM_VERBIAGES.DebtorSortCode).toBe('Debtor Sort Code');
    });
  });

  describe('Creditor Fields & Address Verbiage', () => {
    it('should map Creditor account and banking agent fields', () => {
      expect(PACS_FORM_VERBIAGES.CreditorName).toBe('Creditor Name');
      expect(PACS_FORM_VERBIAGES.CreditorAccountNumber).toBe('Creditor Account Number');
      expect(PACS_FORM_VERBIAGES.CreditorAgentBIC).toBe('Creditor Agent BIC');
      expect(PACS_FORM_VERBIAGES.CreditorAgentBankName).toBe('Creditor Agent Bank Name');
    });

    it('should map Creditor address, sub-division, state, and sort code fields', () => {
      expect(PACS_FORM_VERBIAGES.CreditorAddressLine1).toBe('Creditor Address Line 1');
      expect(PACS_FORM_VERBIAGES.CreditorAddressLine2).toBe('Creditor Address Line 2');
      expect(PACS_FORM_VERBIAGES.CreditorStreet).toBe('Creditor Street');
      expect(PACS_FORM_VERBIAGES.CreditorBuildingNumber).toBe('Creditor Building Number');
      expect(PACS_FORM_VERBIAGES.CreditorTownOrCityName).toBe('Creditor Town / City Name');
      expect(PACS_FORM_VERBIAGES.CreditorCountrySubDivisionLabel).toBe('Creditor Country Sub-division');
      expect(PACS_FORM_VERBIAGES.CreditorState).toBe('Creditor State');
      expect(PACS_FORM_VERBIAGES.CreditorCountry).toBe('Creditor Country');
      expect(PACS_FORM_VERBIAGES.CreditorPostalCode).toBe('Creditor Postal Code');
      expect(PACS_FORM_VERBIAGES.CreditorSortCode).toBe('Creditor Sort Code');
    });
  });

  describe('Intermediary Banks Routing Verbiage', () => {
    it('should map 1st Intermediary bank fields', () => {
      expect(PACS_FORM_VERBIAGES.FirstIntermediaryBankSWIFTCode).toBe('1st Intermediary Bank SWIFT Code');
      expect(PACS_FORM_VERBIAGES.FirstIntermediaryBankRoutingCode).toBe('1st Intermediary Routing Code');
      expect(PACS_FORM_VERBIAGES.FirstIntermediaryBankName).toBe('1st Intermediary Bank Name');
      expect(PACS_FORM_VERBIAGES.FirstIntermediaryBankCountryCode).toBe('1st Intermediary Country Code');
      expect(PACS_FORM_VERBIAGES.FirstIntermediaryAccountNumber).toBe('1st Intermediary Account Number');
    });

    it('should map 2nd Intermediary bank fields', () => {
      expect(PACS_FORM_VERBIAGES.SecondIntermediaryBankSWIFTCode).toBe('2nd Intermediary SWIFT Code');
      expect(PACS_FORM_VERBIAGES.SecondIntermediaryBankRoutingCode).toBe('2nd Intermediary Routing Code');
      expect(PACS_FORM_VERBIAGES.SecondIntermediaryBankName).toBe('2nd Intermediary Bank Name');
      expect(PACS_FORM_VERBIAGES.SecondIntermediaryBankCountryCode).toBe('2nd Intermediary Country Code');
      expect(PACS_FORM_VERBIAGES.SecondIntermediaryAccountNumber).toBe('2nd Intermediary Account Number');
    });
  });

  describe('Remittance & Charge Information Verbiage', () => {
    it('should map remittance and charge distribution labels', () => {
      expect(PACS_FORM_VERBIAGES.RemittanceInformation).toBe('Remittance Information');
      expect(PACS_FORM_VERBIAGES.ChargeInformation).toBe('Charge Information');
      expect(PACS_FORM_VERBIAGES.ChargesAmount).toBe('Charges Amount');
      expect(PACS_FORM_VERBIAGES.ChargesAgentBic).toBe('Charges Agent BIC');
    });
  });

  describe('6 LATAM Tax Details Fields Verbiage', () => {
    it('should contain exact labels for all 6 LATAM tax fields', () => {
      expect(PACS_FORM_VERBIAGES.TaxIdNumber).toBe('Tax ID Number');
      expect(PACS_FORM_VERBIAGES.TaxIdType).toBe('Tax ID Type');
      expect(PACS_FORM_VERBIAGES.PurposeOfPayment).toBe('Purpose of Payment');
      expect(PACS_FORM_VERBIAGES.TaxPurposeCode).toBe('Tax Purpose Code');
      expect(PACS_FORM_VERBIAGES.RegulatoryReportingCode).toBe('Regulatory Reporting Code');
      expect(PACS_FORM_VERBIAGES.InvoiceReferenceNumber).toBe('Invoice / Reference Number');
    });
  });

  describe('getVerbiage Helper Method', () => {
    it('should return the corresponding label when a valid key is provided', () => {
      expect(getVerbiage('PaymentDetails')).toBe('Payment Details');
      expect(getVerbiage('DebtorName')).toBe('Debtor Name');
      expect(getVerbiage('TaxIdNumber')).toBe('Tax ID Number');
    });

    it('should return the provided fallback string if the key does not exist', () => {
      expect(getVerbiage('NON_EXISTENT_KEY', 'Default Section Title')).toBe('Default Section Title');
    });

    it('should return the key itself if the key does not exist and no fallback is provided', () => {
      expect(getVerbiage('NON_EXISTENT_KEY')).toBe('NON_EXISTENT_KEY');
    });
  });
});