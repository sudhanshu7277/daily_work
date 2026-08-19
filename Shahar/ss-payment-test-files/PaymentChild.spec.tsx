import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentChild as SSPaymentFlow } from './PaymentChild';
import { FormFieldConfig, PaymentComponentInput } from '../models/models';
import { addressService } from '../services/addressService';

const MOCK_FIELD_CONFIG: FormFieldConfig[] = [
  { fieldName: 'painPaymentMethodType', label: 'Payment Type', required: false, options: ['CBT', 'BKT', 'DFT'] },
  { fieldName: 'requestedExecutionDate', label: 'Value Date', required: true, type: 'date' },
  { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', required: true },
  { fieldName: 'instructedAmount', label: 'Transaction Amount', required: true },
  { fieldName: 'debtorName', label: 'Debtor Name', required: true },
  { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', required: true },
  { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', required: true },
  { fieldName: 'debtorAddressLines1', label: 'Debtor Address Line 1', required: false },
  { fieldName: 'debtorTownName', label: 'Debtor Town / City Name', required: false },
  { fieldName: 'debtorCountrySubDivision', label: 'Debtor Country Sub-division', required: false },
  { fieldName: 'debtorCountryCode', label: 'Debtor Country', required: false },
  { fieldName: 'debtorSortCodeUS', label: 'Debtor Sort Code (US)', required: false },
  { fieldName: 'creditorName', label: 'Creditor Name', required: true },
  { fieldName: 'creditorAccount', label: 'Creditor Account Number', required: true },
  { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', required: true },
  { fieldName: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', required: true },
  { fieldName: 'creditorAddressLines1', label: 'Creditor Address Line 1', required: true },
  { fieldName: 'creditorTownName', label: 'Creditor Town / City Name', required: false },
  { fieldName: 'creditorCountryCode', label: 'Creditor Country', required: false },
  { fieldName: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', required: false },
  { fieldName: 'firstIntermediaryBankBIC', label: '1st Intermediary Bank SWIFT Code', required: false },
  { fieldName: 'firstIntermediaryBankAccountNumber', label: '1st Intermediary Account Number', required: false },
  { fieldName: 'secondIntermediaryBankBIC', label: '2nd Intermediary Bank SWIFT Code', required: false },
  { fieldName: 'secondIntermediaryBankAccountNumber', label: '2nd Intermediary Account Number', required: false },
  { fieldName: 'chargeBearer', label: 'Charge Information', required: true, options: ['DEBT', 'CRED', 'SHAR', 'SLEV'] },
  { fieldName: 'taxIdNumber', label: 'Tax ID Number', required: false },
  { fieldName: 'taxIdType', label: 'Tax ID Type', required: false },
  { fieldName: 'purposeOfPayment', label: 'Purpose of Payment', required: false },
  { fieldName: 'taxPurposeCode', label: 'Tax Purpose Code', required: false },
  { fieldName: 'regulatoryReportingCode', label: 'Regulatory Reporting Code', required: false },
  { fieldName: 'invoiceReferenceNumber', label: 'Invoice / Reference Number', required: false }
];

describe('SSPaymentFlow Component', () => {
  const defaultMakerInput: PaymentComponentInput = {
    applicationName: 'ADR',
    applicationModule: 'ADR',
    paymentMode: 'maker',
    dualBlindKeyFlag: 'N',
    paymentModel: null
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all sections and sets min attribute for Value Date to prevent past dates', () => {
    const { container } = render(
      <SSPaymentFlow
        paymentInput={defaultMakerInput}
        fieldConfig={MOCK_FIELD_CONFIG}
        isMakerMode={true}
      />
    );

    expect(screen.getByText(/Payment Details/i)).toBeDefined();
    expect(screen.getByText(/Beneficiary Details/i)).toBeDefined();
    expect(screen.getByText(/Additional Information/i)).toBeDefined();

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput).toBeDefined();
    expect(dateInput.getAttribute('min')).toBeTruthy();
  });

  it('hides Intermediary Bank Details section when Payment Type is BKT', async () => {
    const { container } = render(
      <SSPaymentFlow
        paymentInput={defaultMakerInput}
        fieldConfig={MOCK_FIELD_CONFIG}
        isMakerMode={true}
      />
    );

    const paymentTypeSelect = container.querySelector('select') as HTMLSelectElement;
    expect(screen.getByText(/Intermediary Bank Details/i)).toBeDefined();

    fireEvent.change(paymentTypeSelect, { target: { value: 'BKT' } });
    await waitFor(() => {
      expect(screen.queryByText(/Intermediary Bank Details/i)).toBeNull();
    });
  });

  it('renders 6 Tax Details fields when Debtor BIC matches LATAM country (e.g. CITIBR33)', async () => {
    const { container } = render(
      <SSPaymentFlow
        paymentInput={defaultMakerInput}
        fieldConfig={MOCK_FIELD_CONFIG}
        isMakerMode={true}
      />
    );

    expect(screen.queryByText(/Tax Details/i)).toBeNull();

    // Target the Debtor Agent BIC input field
    const textInputs = container.querySelectorAll('input[type="text"]');
    // Debtor Agent BIC is the 3rd text input in the form
    const debtorBicInput = (screen.queryByPlaceholderText(/Enter Debtor Agent BIC/i) || textInputs[2]) as HTMLInputElement;

    fireEvent.change(debtorBicInput, { target: { value: 'CITIBR33XXX' } });

    await waitFor(() => {
      expect(screen.getByText(/Tax Details/i)).toBeDefined();
      expect(screen.getByText(/Tax ID Number/i)).toBeDefined();
      expect(screen.getByText(/Purpose of Payment/i)).toBeDefined();
      expect(screen.getByText(/Invoice \/ Reference Number/i)).toBeDefined();
    });
  });

  it('enforces dual-blind masking and on-blur matching in Checker mode', async () => {
    const checkerInput: PaymentComponentInput = {
      applicationName: 'ADR',
      applicationModule: 'ADR',
      paymentMode: 'checker',
      dualBlindKeyFlag: 'Y',
      dualBlindKeyFields: ['debtorName', 'instructedAmount'],
      paymentModel: {
        debtorName: 'Original Corp Ltd',
        instructedAmount: 50000,
        debtorAgentBIC: 'CITIUS33XXX'
      }
    };

    const { container } = render(
      <SSPaymentFlow
        paymentInput={checkerInput}
        fieldConfig={MOCK_FIELD_CONFIG}
        isCheckerMode={true}
      />
    );

    // Find the Debtor Name input
    const textInputs = container.querySelectorAll('input[type="text"]');
    const debtorNameInput = (screen.queryByPlaceholderText(/Enter Debtor Name/i) || textInputs[0]) as HTMLInputElement;

    expect(debtorNameInput.value).toBe('');

    // Enter mismatched value -> onBlur -> error appears
    fireEvent.change(debtorNameInput, { target: { value: 'Wrong Corp' } });
    fireEvent.blur(debtorNameInput);

    await waitFor(() => {
      expect(screen.getByText(/Data does not match/i)).toBeDefined();
    });

    // Enter matching value -> onBlur -> error clears
    fireEvent.change(debtorNameInput, { target: { value: 'Original Corp Ltd' } });
    fireEvent.blur(debtorNameInput);

    await waitFor(() => {
      expect(screen.queryByText(/Data does not match/i)).toBeNull();
    });
  });

  it('toggles failed fields on double click in Checker mode', async () => {
    const onFailedChange = vi.fn();
    const checkerInput: PaymentComponentInput = {
      applicationName: 'ADR',
      applicationModule: 'ADR',
      paymentMode: 'checker',
      dualBlindKeyFlag: 'N',
      paymentModel: { debtorTownName: 'London' }
    };

    const { container } = render(
      <SSPaymentFlow
        paymentInput={checkerInput}
        fieldConfig={MOCK_FIELD_CONFIG}
        isCheckerMode={true}
        onFailedFieldListChange={onFailedChange}
      />
    );

    const firstFormField = container.querySelector('.form-field') as HTMLElement;
    fireEvent.doubleClick(firstFormField);

    await waitFor(() => {
      expect(onFailedChange).toHaveBeenCalled();
    });
  });
});