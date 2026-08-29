import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { SSPaymentFlow } from './SSPaymentFlow';
import { PaymentComponentInput, createEmptyPain001, FormFieldConfig } from '../models';

// Mock addressService to prevent Node unhandled fetch URL errors
vi.mock('../services', async () => {
  const actual = await vi.importActual<any>('../services');
  return {
    ...actual,
    addressService: {
      lookupDebtorAddress: vi.fn().mockResolvedValue(null),
      lookupDebtorAddresss: vi.fn().mockResolvedValue(null),
      lookupCreditorAddress: vi.fn().mockResolvedValue(null),
      lookupCreditorAddresss: vi.fn().mockResolvedValue(null)
    }
  };
});

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
    expect(screen.getByText(/Remittance & Charges/i)).toBeDefined();

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

    expect(screen.queryByLabelText(/Tax ID Number/i)).toBeNull();
  });

  it('triggers onAmountChange and onFormChange when transaction amount is modified', async () => {
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

    // Polls through the 400ms debouncer and queueMicrotask without timing out
    await waitFor(
      () => {
        expect(onAmountChange).toHaveBeenCalledWith({
          instructedAmountCurrencyCode: 'USD',
          instructedAmount: 15000
        });
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(onFormChange).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it('emits onPaymentOutput and onFormValidityChange with valid state when required fields are satisfied', async () => {
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

    await waitFor(
      () => {
        expect(onPaymentOutput).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: true,
            outputMessage: 'Valid',
            isDualBlindKeyPassed: true
          })
        );
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(onFormValidityChange).toHaveBeenCalledWith(
          expect.objectContaining({
            validForm: true
          })
        );
      },
      { timeout: 2000 }
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
    const container = debtorNameInput.closest('.form-field')!;

    expect(container.className).not.toContain('failed-field');

    fireEvent.doubleClick(container);
    expect(container.className).toContain('failed-field');
    expect(onFailedFieldListChange).toHaveBeenCalledWith(['debtorName']);

    fireEvent.doubleClick(container);
    expect(container.className).not.toContain('failed-field');
    expect(onFailedFieldListChange).toHaveBeenCalledWith([]);
  });

  it('applies amber review and green modified classes correctly in Repair mode', () => {
    render(
      <SSPaymentFlow
        paymentInput={{ ...defaultPaymentInput, paymentMode: 'repair' }}
        isRepairMode={true}
        repairReviewFieldList={['debtorName']}
        repairNewlyModifyFieldList={['debtorAccountNumber']}
      />
    );

    const debtorNameContainer = screen.getByLabelText(/Debtor Name/i).closest('.form-field')!;
    expect(debtorNameContainer.className).toContain('repair-review-field');

    const debtorAccountContainer = screen.getByLabelText(/Debtor Account Number/i).closest('.form-field')!;
    expect(debtorAccountContainer.className).toContain('repair-newly-modify-field');
  });
});