import { describe, it, expect } from 'vitest';
import {
  createEmptyPain001,
  PAIN001_MANDATORY_FIELDS,
  PAIN001_STRING_FIELDS,
  PAIN001_NUMERIC_FIELDS,
  PAYMENT_TYPE_OPTIONS,
  CHARGE_BEARER_OPTIONS
} from '../models';

describe('Payment Models & Constants', () => {
  it('should create an empty Pain001Model with expected default application and module values', () => {
    const model = createEmptyPain001();
    expect(model).toBeDefined();
    expect(model.applicationName).toBe('ADR');
    expect(model.applicationModule).toBe('ADR');
    expect(model.region).toBe('');
    expect(model.requestedExecutionDate).toBe('');
    expect(model.instructedAmount).toBe('');
    expect(model.debtorName).toBe('');
    expect(model.creditorName).toBe('');
  });

  it('should initialize all 6 LATAM tax fields as empty strings in createEmptyPain001', () => {
    const model = createEmptyPain001();
    expect(model.taxIdNumber).toBe('');
    expect(model.taxIdType).toBe('');
    expect(model.purposeOfPayment).toBe('');
    expect(model.taxPurposeCode).toBe('');
    expect(model.regulatoryReportingCode).toBe('');
    expect(model.invoiceReferenceNumber).toBe('');
  });

  it('should have all mandatory fields defined in PAIN001_MANDATORY_FIELDS', () => {
    expect(PAIN001_MANDATORY_FIELDS).toContain('requestedExecutionDate');
    expect(PAIN001_MANDATORY_FIELDS).toContain('instructedAmountCurrencyCode');
    expect(PAIN001_MANDATORY_FIELDS).toContain('instructedAmount');
    expect(PAIN001_MANDATORY_FIELDS).toContain('debtorName');
    expect(PAIN001_MANDATORY_FIELDS).toContain('debtorAccountNumber');
    expect(PAIN001_MANDATORY_FIELDS).toContain('debtorAgentBIC');
    expect(PAIN001_MANDATORY_FIELDS).toContain('creditorName');
    expect(PAIN001_MANDATORY_FIELDS).toContain('creditorAccount');
    expect(PAIN001_MANDATORY_FIELDS).toContain('creditorAgentFinancialInstitutionBIC');
    expect(PAIN001_MANDATORY_FIELDS).toContain('chargeBearer');
  });

  it('should contain expected options in enum arrays', () => {
    expect(PAYMENT_TYPE_OPTIONS).toEqual(['CBT', 'BKT', 'DFT']);
    expect(CHARGE_BEARER_OPTIONS).toEqual(['DEBT', 'CRED', 'SHAR', 'SLEV']);
  });
});