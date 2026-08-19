import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentChild } from '../PaymentChild';
import { PaymentComponentInput, FormFieldConfig } from '../../types/models';

const MOCK_CONFIG: FormFieldConfig[] = [
  { fieldName: 'painPaymentMethodType', label: 'Payment Type', required: false, options: ['CBT', 'BKT', 'DFT'] },
  { fieldName: 'requestedExecutionDate', label: 'Value Date', required: true, type: 'date' },
  { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', required: true },
  { fieldName: 'instructedAmount', label: 'Transaction Amount', required: true },
  { fieldName: 'debtorName', label: 'Debtor Name', required: true },
  { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', required: true },
  { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', required: true },
  { fieldName: 'debtorAddressLines1', label: 'Debtor Address Line 1', required: false },
  { fieldName: 'debtorTownName', label: 'Debtor Town / City Name', required: false },
  { fieldName: 'debtorCountryCode', label: 'Debtor Country', required: false },
  { fieldName: 'creditorName', label: 'Creditor Name', required: true },
  { fieldName: 'creditorAccount', label: 'Creditor Account Number', required: true },
  { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', required: true },
  { fieldName: 'creditorAddressLines1', label: 'Creditor Address Line 1', required: true },
  { fieldName: 'creditorTownName', label: 'Creditor Town / City Name', required: false },
  { fieldName: 'creditorCountryCode', label: 'Creditor Country', required: false },
  { fieldName: 'firstIntermediaryBankBIC', label: '1st Intermediary Bank SWIFT Code', required: false },
  { fieldName: 'firstIntermediaryBankAccountNumber', label: '1st Intermediary Account Number', required: false },
  { fieldName: 'chargeBearer', label: 'Charge Information', required: true, options: ['DEBT', 'CRED', 'SHAR'] },
  // 6 Tax Details
  { fieldName: 'taxIdNumber', label: 'Tax ID Number', required: false },
  { fieldName: 'taxIdType', label: 'Tax ID Type', required: false },
  { fieldName: 'purposeOfPayment', label: 'Purpose of Payment', required: false },
  { fieldName: 'taxPurposeCode', label: 'Tax Purpose Code', required: false },
  { fieldName: 'regulatoryReportingCode', label: 'Regulatory Reporting Code', required: false },
  { fieldName: 'invoiceReferenceNumber', label: 'Invoice / Reference Number', required: false }
];

describe('PaymentChild Component', () => {
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
    render(<PaymentChild paymentInput={defaultMakerInput} fieldConfig={MOCK_CONFIG} isMakerMode={true} />);
    
    expect(screen.getByText('Payment Details')).toBeDefined();
    expect(screen.getByText('Beneficiary Details')).toBeDefined();
    expect(screen.getByText('Additional Information')).toBeDefined();

    const dateInput = screen.getByLabelText(/Value Date/i) as HTMLInputElement;
    expect(dateInput).toBeDefined();
    expect(dateInput.getAttribute('min')).toBeTruthy();
  });

  it('hides Intermediary Bank Details section when Payment Type is BKT', async () => {
    render(<PaymentChild paymentInput={defaultMakerInput} fieldConfig={MOCK_CONFIG} isMakerMode={true} />);
    
    const paymentTypeSelect = screen.getByLabelText(/Payment Type/i) as HTMLSelectElement;
    expect(screen.getByText(/Intermediary Bank Details/i)).toBeDefined();

    fireEvent.change(paymentTypeSelect, { target: { value: 'BKT' } });
    await waitFor(() => {
      expect(screen.queryByText(/Intermediary Bank Details/i)).toBeNull();
    });
  });

  it('renders 6 Tax Details fields when Debtor BIC matches LATAM country (e.g. CITIBR33)', async () => {
    render(<PaymentChild paymentInput={defaultMakerInput} fieldConfig={MOCK_CONFIG} isMakerMode={true} />);
    
    const debtorBicInput = screen.getByLabelText(/Debtor Agent BIC/i);
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

    render(<PaymentChild paymentInput={checkerInput} fieldConfig={MOCK_CONFIG} isCheckerMode={true} />);

    // Dual-blind inputs should start blank for re-entry
    const debtorNameInput = screen.getByLabelText(/Debtor Name/i) as HTMLInputElement;
    expect(debtorNameInput.value).toBe('');

    // Entering mismatched value triggers error on blur
    fireEvent.change(debtorNameInput, { target: { value: 'Wrong Corp' } });
    fireEvent.blur(debtorNameInput);

    await waitFor(() => {
      expect(screen.getByText(/Data does not match/i)).toBeDefined();
    });

    // Entering exact value clears error
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

    render(
      <PaymentChild
        paymentInput={checkerInput}
        fieldConfig={MOCK_CONFIG}
        isCheckerMode={true}
        onFailedFieldListChange={onFailedChange}
      />
    );

    const debtorTownLabel = screen.getByText(/Debtor Town \/ City Name/i);
    fireEvent.doubleClick(debtorTownLabel.parentElement!);

    await waitFor(() => {
      expect(onFailedChange).toHaveBeenCalledWith(expect.arrayContaining(['debtorTownName']));
    });
  });
});