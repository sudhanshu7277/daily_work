import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SSPaymentFlow } from './SSPaymentFlow';
import { PaymentComponentInput, FormFieldConfig, createEmptyPain001 } from '../types/models';

describe('SSPaymentFlow Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const defaultPaymentInput: PaymentComponentInput = {
    applicationName: 'ADR',
    applicationModule: 'ADR',
    paymentMode: 'maker',
    currency: 'USD',
    paymentModel: {
      ...createEmptyPain001(),
      requestedExecutionDate: '2026-08-23',
      debtorName: 'Acme Corp',
      debtorAccountNumber: 'ACCT-987654',
      debtorAgentBIC: 'CHASUS33XXX',
      instructedAmount: 5000,
      instructedAmountCurrencyCode: 'USD',
      creditorName: 'Globex Corp',
      creditorAccount: 'ACCT-123456',
      creditorAgentFinancialInstitutionBIC: 'BOFAUS3NXXX',
      creditorAgentFinancialInstitutionName: 'Bank of America',
      creditorAddressLines1: '100 Main Street',
      chargeBearer: 'SHAR'
    }
  };

  it('renders all primary form sections and populates default data', () => {
    render(<SSPaymentFlow paymentInput={defaultPaymentInput} isMakerMode={true} />);

    expect(screen.getByText('Payment Details')).toBeDefined();
    expect(screen.getByText('Payment Information')).toBeDefined();
    expect(screen.getByText('Debtor Information')).toBeDefined();
    expect(screen.getByText('Debtor Address Details')).toBeDefined();
    expect(screen.getByText('Creditor Information')).toBeDefined();
    expect(screen.getByText('Remittance & Charges')).toBeDefined();

    const debtorNameInput = screen.getByLabelText(/Debtor Name/i) as HTMLInputElement;
    expect(debtorNameInput.value).toBe('Acme Corp');

    const amountInput = screen.getByLabelText(/Transaction Amount/i) as HTMLInputElement;
    expect(amountInput.value).toBe('5000');
  });

  it('handles field config: disables, hides, and overrides labels correctly', () => {
    const fieldConfig: FormFieldConfig[] = [
      { fieldName: 'debtorName', label: 'Custom Debtor Title', disabled: true },
      { fieldName: 'taxIdNumber', label: 'Tax ID Number', hidden: true }
    ];

    render(
      <SSPaymentFlow
        paymentInput={defaultPaymentInput}
        fieldConfig={fieldConfig}
        isMakerMode={true}
      />
    );

    expect(screen.getByText(/Custom Debtor Title/i)).toBeDefined();

    const debtorNameInput = screen.getByLabelText(/Custom Debtor Title/i) as HTMLInputElement;
    expect(debtorNameInput.disabled).toBe(true);
    expect(debtorNameInput.className).toContain('sspf-disabled');

    expect(screen.queryByLabelText(/Tax ID Number/i)).toBeNull();
  });

  it('triggers onAmountChange and onFormChange when transaction amount is modified', () => {
    const onAmountChange = vi.fn();
    const onFormChange = vi.fn();

    render(
      <SSPaymentFlow
        paymentInput={defaultPaymentInput}
        onAmountChange={onAmountChange}
        onFormChange={onFormChange}
        isMakerMode={true}
      />
    );

    const amountInput = screen.getByLabelText(/Transaction Amount/i);
    fireEvent.change(amountInput, { target: { name: 'instructedAmount', value: '15000' } });

    expect(onAmountChange).toHaveBeenCalledWith({
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: 15000
    });
    expect(onFormChange).toHaveBeenCalled();
  });

  it('emits onPaymentOutput and onFormValidityChange with valid state when required fields are satisfied', () => {
    const onPaymentOutput = vi.fn();
    const onFormValidityChange = vi.fn();

    render(
      <SSPaymentFlow
        paymentInput={defaultPaymentInput}
        onPaymentOutput={onPaymentOutput}
        onFormValidityChange={onFormValidityChange}
        isMakerMode={true}
      />
    );

    expect(onPaymentOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        isValid: true,
        outputMessage: 'Payment instruction validated successfully.',
        isDualBlindKeyPassed: true
      })
    );

    expect(onFormValidityChange).toHaveBeenCalledWith(
      expect.objectContaining({
        validForm: true
      })
    );
  });

  it('toggles red flagged error class and emits onFailedFieldListChange on double-click in Checker mode', () => {
    const onFailedFieldListChange = vi.fn();

    render(
      <SSPaymentFlow
        paymentInput={{ ...defaultPaymentInput, paymentMode: 'checker' }}
        isCheckerMode={true}
        onFailedFieldListChange={onFailedFieldListChange}
      />
    );

    const debtorNameInput = screen.getByLabelText(/Debtor Name/i);

    expect(debtorNameInput.className).toContain('sspf-interactive');
    expect(debtorNameInput.className).not.toContain('sspf-flagged-error');

    fireEvent.doubleClick(debtorNameInput.closest('.sspf-group')!);
    expect(debtorNameInput.className).toContain('sspf-flagged-error');
    expect(onFailedFieldListChange).toHaveBeenCalledWith(['debtorName']);

    fireEvent.doubleClick(debtorNameInput.closest('.sspf-group')!);
    expect(debtorNameInput.className).not.toContain('sspf-flagged-error');
    expect(onFailedFieldListChange).toHaveBeenCalledWith([]);
  });

  it('applies amber review and green modified classes correctly in Repair mode', () => {
    render(
      <SSPaymentFlow
        paymentInput={{ ...defaultPaymentInput, paymentMode: 'repair' }}
        isRepairMode={true}
        repairReviewFieldList={['debtorName']}
        repairNewlyModifyFieldList={['instructedAmount']}
      />
    );

    const debtorNameInput = screen.getByLabelText(/Debtor Name/i);
    expect(debtorNameInput.className).toContain('sspf-review-amber');

    const amountInput = screen.getByLabelText(/Transaction Amount/i);
    expect(amountInput.className).toContain('sspf-modified-green');
  });

  it('validates Dual-Blind Key matches against sourcePaymentModel when dualBlindKeyFlag is Y in Checker mode', () => {
    const onPaymentOutput = vi.fn();

    const dualBlindInput: PaymentComponentInput = {
      ...defaultPaymentInput,
      paymentMode: 'checker',
      dualBlindKeyFlag: 'Y',
      dualBlindKeyFields: ['debtorAccountNumber'],
      sourcePaymentModel: {
        debtorAccountNumber: 'EXPECTED-ACCT-999'
      },
      paymentModel: {
        ...defaultPaymentInput.paymentModel,
        requestedExecutionDate: '2026-08-23',
        debtorAccountNumber: 'WRONG-ACCT-111'
      }
    };

    render(
      <SSPaymentFlow
        paymentInput={dualBlindInput}
        isCheckerMode={true}
        onPaymentOutput={onPaymentOutput}
      />
    );

    // Initial mount: Re-key does NOT match -> Output must be failed & invalid
    expect(onPaymentOutput).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isValid: false,
        isDualBlindKeyPassed: false,
        dualBlindKeyResult: 'failed'
      })
    );

    // Simulate checker typing the correct matching value
    const acctInput = screen.getByLabelText(/Debtor Account Number/i);
    fireEvent.change(acctInput, {
      target: { name: 'debtorAccountNumber', value: 'EXPECTED-ACCT-999' }
    });

    // After typing matching value: Output updates to passed & valid
    expect(onPaymentOutput).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isValid: true,
        isDualBlindKeyPassed: true,
        dualBlindKeyResult: 'passed'
      })
    );
  });
});