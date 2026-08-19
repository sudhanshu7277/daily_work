import { describe, it, expect } from 'vitest';
import {
  PACS_FORM_VERBIAGES,
  getVerbiage,
  DEFAULT_PACS_VERBIAGES
} from '../verbiage';

describe('Payment Verbiage & Localization Dictionary', () => {
  it('should export all required PACS section titles matching GAB enterprise design', () => {
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

  it('should export all primary field verbiages matching GAB labels', () => {
    expect(PACS_FORM_VERBIAGES.PaymentType).toBe('Payment Type');
    expect(PACS_FORM_VERBIAGES.ValueDate).toBe('Value Date');
    expect(PACS_FORM_VERBIAGES.Currency).toBe('Currency');
    expect(PACS_FORM_VERBIAGES.TransactionAmount).toBe('Transaction Amount');
    expect(PACS_FORM_VERBIAGES.DebtorName).toBe('Debtor Name');
    expect(PACS_FORM_VERBIAGES.DebtorAccountNumber).toBe('Debtor Account Number');
    expect(PACS_FORM_VERBIAGES.DebtorAgentBIC).toBe('Debtor Agent BIC');
    expect(PACS_FORM_VERBIAGES.DebtorAddressLine1).toBe('Debtor Address Line 1');
    expect(PACS_FORM_VERBIAGES.DebtorCountrySubDivisionLabel).toBe('Debtor Country Sub-division');
    expect(PACS_FORM_VERBIAGES.CreditorName).toBe('Creditor Name');
    expect(PACS_FORM_VERBIAGES.CreditorAccountNumber).toBe('Creditor Account Number');
    expect(PACS_FORM_VERBIAGES.CreditorAgentBIC).toBe('Creditor Agent BIC');
    expect(PACS_FORM_VERBIAGES.CreditorAddressLine1).toBe('Creditor Address Line 1');
    expect(PACS_FORM_VERBIAGES.CreditorCountrySubDivisionLabel).toBe('Creditor Country Sub-division');
    expect(PACS_FORM_VERBIAGES.ChargeInformation).toBe('Charge Information');
    expect(PACS_FORM_VERBIAGES.ChargesAmount).toBe('Charges Amount');
    expect(PACS_FORM_VERBIAGES.ChargesAgentBic).toBe('Charges Agent BIC');
    expect(PACS_FORM_VERBIAGES.RemittanceInformation).toBe('Remittance Information');
  });

  it('should contain all 6 LATAM Tax Details field verbiages', () => {
    expect(PACS_FORM_VERBIAGES.TaxIdNumber).toBe('Tax ID Number');
    expect(PACS_FORM_VERBIAGES.TaxIdType).toBe('Tax ID Type');
    expect(PACS_FORM_VERBIAGES.PurposeOfPayment).toBe('Purpose of Payment');
    expect(PACS_FORM_VERBIAGES.TaxPurposeCode).toBe('Tax Purpose Code');
    expect(PACS_FORM_VERBIAGES.RegulatoryReportingCode).toBe('Regulatory Reporting Code');
    expect(PACS_FORM_VERBIAGES.InvoiceReferenceNumber).toBe('Invoice / Reference Number');
  });

  it('should retrieve correct verbiage using getVerbiage helper or fallback to provided default', () => {
    expect(getVerbiage('ValueDate', 'Fallback Date')).toBe('Value Date');
    expect(getVerbiage('TaxIdNumber', 'Default Tax ID')).toBe('Tax ID Number');
    expect(getVerbiage('NonExistentKey' as any, 'Custom Fallback')).toBe('Custom Fallback');
  });

  it('should verify DEFAULT_PACS_VERBIAGES equals the PACS_FORM_VERBIAGES configuration', () => {
    expect(DEFAULT_PACS_VERBIAGES).toEqual(PACS_FORM_VERBIAGES);
  });
});