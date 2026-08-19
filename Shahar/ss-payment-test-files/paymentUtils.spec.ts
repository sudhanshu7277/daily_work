import { describe, it, expect } from 'vitest';
import { buildPain001FromForm } from './paymentUtils';
import { Pain001Model, createEmptyPain001 } from '../models/models';

describe('paymentUtils Unit Tests', () => {
  it('should build Pain001Model preserving form fields', () => {
    const formValues: Partial<Pain001Model> = {
      requestedExecutionDate: '2026-08-25',
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: 50000,
      debtorName: 'ACME Corporation Global Ltd',
      creditorName: 'Starlight Solutions Inc'
    };

    const result = buildPain001FromForm(formValues as Pain001Model);
    expect(result).toBeDefined();
    expect(result.requestedExecutionDate).toBe('2026-08-25');
    expect(result.instructedAmountCurrencyCode).toBe('USD');
    expect(result.debtorName).toBe('ACME Corporation Global Ltd');
    expect(result.creditorName).toBe('Starlight Solutions Inc');
  });

  it('should handle numeric amount mappings correctly', () => {
    const formValues: Partial<Pain001Model> = {
      instructedAmount: 75420.5,
      chargesAmount: 25
    };

    const result = buildPain001FromForm(formValues as Pain001Model);
    expect(Number(result.instructedAmount)).toBe(75420.5);
    expect(Number(result.chargesAmount)).toBe(25);
  });

  it('should preserve debtor and creditor address fields', () => {
    const formValues: Partial<Pain001Model> = {
      debtorAddressLines1: '25 Canada Square',
      debtorTownName: 'London',
      debtorCountryCode: 'GB',
      creditorAddressLines1: '388 Greenwich Street',
      creditorTownName: 'New York',
      creditorCountryCode: 'US'
    };

    const result = buildPain001FromForm(formValues as Pain001Model);
    expect(result.debtorAddressLines1).toBe('25 Canada Square');
    expect(result.debtorTownName).toBe('London');
    expect(result.debtorCountryCode).toBe('GB');
    expect(result.creditorAddressLines1).toBe('388 Greenwich Street');
    expect(result.creditorTownName).toBe('New York');
    expect(result.creditorCountryCode).toBe('US');
  });

  it('should preserve tax and intermediary bank routing fields', () => {
    const formValues: Partial<Pain001Model> = {
      firstIntermediaryBankBIC: 'CITIUS33XXX',
      firstIntermediaryBankAccountNumber: '1100229988',
      taxIdNumber: 'TAX-BR-12345',
      taxIdType: 'CNPJ'
    };

    const result = buildPain001FromForm(formValues as Pain001Model);
    expect(result.firstIntermediaryBankBIC).toBe('CITIUS33XXX');
    expect(result.firstIntermediaryBankAccountNumber).toBe('1100229988');
    expect(result.taxIdNumber).toBe('TAX-BR-12345');
    expect(result.taxIdType).toBe('CNPJ');
  });

  it('should fallback to valid empty model when given default structure', () => {
    const empty = createEmptyPain001();
    const result = buildPain001FromForm(empty);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});