import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SSPaymentFlow, SSPaymentFlowProps } from './SSPaymentFlow';
import { FormFieldConfig, PaymentComponentInput } from '../../models/models';

describe('SSPaymentFlow Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders all primary form sections and populates default data', () => {
    render(<SSPaymentFlow isMakerMode={true} />);

    expect(screen.getByText(/Payment Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Debtor Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Beneficiary Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Creditor Information/i)).toBeInTheDocument();
  });

  it('handles field config: disables, hides, and overrides labels correctly', () => {
    const customConfig: FormFieldConfig[] = [
      {
        fieldName: 'debtorName',
        label: 'Custom Debtor Title',
        disabled: true,
        required: true
      },
      {
        fieldName: 'debtorAddressLines1',
        label: 'Debtor Address 1',
        hidden: true
      }
    ];

    render(
      <SSPaymentFlow
        fieldConfig={customConfig}
        isMakerMode={true}
      />
    );

    // Label override check
    const debtorNameInput = screen.getByLabelText(/Custom Debtor Title/i);
    expect(debtorNameInput).toBeInTheDocument();

    // Disabled / readonly check
    const isFieldLocked = (debtorNameInput as HTMLInputElement).disabled || (debtorNameInput as HTMLInputElement).readOnly;
    expect(isFieldLocked).toBe(true);

    // Hidden field check
    expect(screen.queryByLabelText(/Debtor Address 1/i)).not.toBeInTheDocument();
  });

  it('triggers onAmountChange and onFormChange when transaction amount is modified', async () => {
    const onAmountChange = vi.fn();
    const onFormChange = vi.fn();

    render(
      <SSPaymentFlow
        isMakerMode={true}
        onAmountChange={onAmountChange}
        onFormChange={onFormChange}
      />
    );

    const amountInput = screen.getByLabelText(/Transaction Amount/i);

    fireEvent.change(amountInput, { target: { name: 'instructedAmount', value: '15000' } });

    // Advance past 400ms debouncer
    vi.advanceTimersByTime(450);

    await waitFor(() => {
      expect(onAmountChange).toHaveBeenCalledWith({
        instructedAmountCurrencyCode: 'USD',
        instructedAmount: 15000
      });
    });

    expect(onFormChange).toHaveBeenCalled();
  });

  it('emits onPaymentOutput and onFormValidityChange with valid state when required fields are satisfied', async () => {
    const onPaymentOutput = vi.fn();
    const onFormValidityChange = vi.fn();

    const validInitialData = {
      painPaymentMethodType: 'CBT',
      requestedExecutionDate: '2026-08-25',
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: 25000,
      debtorName: 'Acme Corp',
      debtorAccountNumber: '1234567890',
      debtorAgentBIC: 'CITIUS33XXX',
      creditorName: 'Global Supplier Inc',
      creditorAccount: '987654321',
      creditorAgentFinancialInstitutionBIC: 'CHASUS33XXX',
      chargeBearer: 'DEBT'
    };

    render(
      <SSPaymentFlow
        isMakerMode={true}
        initialData={validInitialData}
        onPaymentOutput={onPaymentOutput}
        onFormValidityChange={onFormValidityChange}
      />
    );

    // Allow microtasks and state effects to evaluate
    await waitFor(() => {
      expect(onPaymentOutput).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: true,
          outputMessage: 'Valid'
        })
      );
    });

    expect(onFormValidityChange).toHaveBeenCalledWith(
      expect.objectContaining({
        validForm: true
      })
    );
  });

  it('toggles red flagged error class and emits onFailedFieldListChange on double-click in Checker mode', async () => {
    const onFailedFieldListChange = vi.fn();

    const paymentInput: PaymentComponentInput = {
      applicationName: 'ADR',
      applicationModule: 'ADR',
      paymentMode: 'checker',
      dualBlindKeyFlag: 'N',
      paymentModel: {
        debtorName: 'Test Debtor Corp',
        creditorName: 'Test Creditor Corp'
      }
    };

    render(
      <SSPaymentFlow
        paymentInput={paymentInput}
        isCheckerMode={true}
        onFailedFieldListChange={onFailedFieldListChange}
      />
    );

    const debtorNameInput = screen.getByLabelText(/Debtor Name/i);
    const fieldContainer = debtorNameInput.closest('.form-field');

    expect(fieldContainer).toBeInTheDocument();

    // Trigger double click to reject
    fireEvent.doubleClick(fieldContainer!);

    await waitFor(() => {
      expect(fieldContainer).toHaveClass('failed-field');
      expect(onFailedFieldListChange).toHaveBeenCalledWith(
        expect.arrayContaining(['debtorName'])
      );
    });

    // Double click again to unflag
    fireEvent.doubleClick(fieldContainer!);

    await waitFor(() => {
      expect(fieldContainer).not.toHaveClass('failed-field');
    });
  });

  it('applies amber review and green modified classes correctly in Repair mode', () => {
    const repairReviewFieldList = ['debtorName', 'instructedAmount'];
    const repairNewlyModifyFieldList = ['creditorName'];

    render(
      <SSPaymentFlow
        isRepairMode={true}
        repairReviewFieldList={repairReviewFieldList}
        repairNewlyModifyFieldList={repairNewlyModifyFieldList}
      />
    );

    const debtorNameInput = screen.getByLabelText(/Debtor Name/i);
    const debtorFieldContainer = debtorNameInput.closest('.form-field');
    expect(debtorFieldContainer).toHaveClass('repair-review-field');

    const creditorNameInput = screen.getByLabelText(/Creditor Name/i);
    const creditorFieldContainer = creditorNameInput.closest('.form-field');
    expect(creditorFieldContainer).toHaveClass('repair-newly-modify-field');
  });
});