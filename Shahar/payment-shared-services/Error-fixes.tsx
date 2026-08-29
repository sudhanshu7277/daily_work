import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SSPaymentFlow, SSPaymentFlowProps } from './SSPaymentFlow';
import { addressService, genericValidator } from '../../services';
import {
  createEmptyPain001,
  PAIN001_MANDATORY_FIELDS,
  PAYMENT_TYPE_OPTIONS,
  CHARGE_BEARER_OPTIONS
} from '../../models/models';

// Mock dependencies
vi.mock('../../styles/index.css', () => ({}));

vi.mock('../../models/models', async () => {
  const actual = await vi.importActual('../../models/models');
  return {
    ...actual,
    createEmptyPain001: vi.fn(() => ({
      painPaymentMethodType: 'CBT',
      instructedAmountCurrencyCode: 'USD',
      requestedExecutionDate: '2026-08-29',
      instructedAmount: 0,
      chargeBearer: 'DEBT',
      debtorName: '',
      debtorAccountNumber: '',
      debtorAgentBIC: '',
      debtorCountryCode: '',
      creditorName: '',
      creditorAccount: '',
      creditorAgentFinancialInstitutionBIC: '',
      creditorCountryCode: '',
      firstIntermediaryBankBIC: '',
      secondIntermediaryBankBIC: ''
    })),
    PAIN001_MANDATORY_FIELDS: [
      'painPaymentMethodType',
      'instructedAmountCurrencyCode',
      'requestedExecutionDate',
      'instructedAmount',
      'debtorName',
      'debtorAccountNumber',
      'creditorName',
      'creditorAccount'
    ],
    PAYMENT_TYPE_OPTIONS: ['CBT', 'BKT', 'RTGS'],
    CHARGE_BEARER_OPTIONS: ['DEBT', 'CRED', 'SHAR']
  };
});

vi.mock('../../services', () => ({
  genericValidator: {
    evaluateAllFields: vi.fn(() => new Map()),
    evaluateFormRules: vi.fn(() => new Map()),
    applyToForm: vi.fn((fieldMap: any) => fieldMap)
  },
  addressService: {
    lookupDebtorAddress: vi.fn(),
    lookupCreditorAddress: vi.fn()
  },
  LATAM_COUNTRIES: ['BR', 'MX', 'AR', 'CO', 'CL', 'PE']
}));

vi.mock('../../utils', () => ({
  buildPain001FromForm: vi.fn((formValues) => ({ ...formValues, built: true }))
}));

describe('SSPaymentFlow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const defaultProps: SSPaymentFlowProps = {
    isMakerMode: true,
    initialData: {
      debtorName: 'Acme Corp',
      debtorAccountNumber: '12345678',
      instructedAmount: 1000,
      instructedAmountCurrencyCode: 'USD',
      creditorName: 'Global Supplier',
      creditorAccount: '87654321'
    }
  };

  describe('1. Mode-Driven Behavior & Access Controls', () => {
    it('Maker Mode: allows editing of standard fields', () => {
      render(<SSPaymentFlow {...defaultProps} isMakerMode={true} />);
      const debtorInput = screen.getByLabelText(/Debtor Name/i) as HTMLInputElement;
      expect(debtorInput).not.toBeDisabled();
      expect(debtorInput.readOnly).toBe(false);
      expect(debtorInput).not.toHaveClass('sspf-disabled');
    });

    it('Checker Mode: locks standard fields into readonly mode', () => {
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={false}
          isCheckerMode={true}
        />
      );
      const debtorInput = screen.getByLabelText(/Debtor Name/i) as HTMLInputElement;
      expect(debtorInput).toBeDisabled();
      expect(debtorInput).toHaveClass('sspf-disabled');
    });

    it('Repair Mode: fields in repairReviewFieldList are editable and styled amber', () => {
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={false}
          isRepairMode={true}
          repairReviewFieldList={['debtorName']}
        />
      );

      const debtorInput = screen.getByLabelText(/Debtor Name/i) as HTMLInputElement;
      const creditorInput = screen.getByLabelText(/Creditor Name/i) as HTMLInputElement;

      expect(debtorInput.disabled).toBe(false);
      expect(debtorInput).toHaveClass('sspf-review-amber');

      // Unlisted field should be readonly in repair mode
      expect(creditorInput.disabled).toBe(true);
      expect(creditorInput).toHaveClass('sspf-disabled');
    });

    it('FieldConfig: explicit disabled config overrides mode rules', () => {
      const fieldConfig = [
        { fieldName: 'debtorName', disabled: true, label: 'Debtor Name Overridden' }
      ];
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={true}
          fieldConfig={fieldConfig}
        />
      );

      const debtorInput = screen.getByLabelText(/Debtor Name Overridden/i) as HTMLInputElement;
      expect(debtorInput).toBeDisabled();
      expect(debtorInput).toHaveClass('sspf-disabled');
    });
  });

  describe('2. Dual-Blind Keying Mechanism (Checker Mode)', () => {
    const dualBlindInput = {
      dualBlindKeyFlag: 'Y',
      dualBlindKeyFields: ['instructedAmount', 'debtorAccountNumber'],
      paymentModel: {
        instructedAmount: 5000,
        debtorAccountNumber: '98765432'
      }
    };

    it('masks configured dual blind fields on initial load', () => {
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={false}
          isCheckerMode={true}
          paymentInput={dualBlindInput}
        />
      );

      const amountInput = screen.getByPlaceholderText(/Enter Transaction Amount/i) as HTMLInputElement;
      const accountInput = screen.getByLabelText(/Debtor Account Number/i) as HTMLInputElement;

      // Inputs should be cleared for re-entry and editable
      expect(amountInput.value).toBe('');
      expect(accountInput.value).toBe('');
      expect(amountInput.disabled).toBe(false);
      expect(accountInput.disabled).toBe(false);
    });

    it('emits failure when typed dual blind values mismatch cached source', async () => {
      const onPaymentOutput = vi.fn();
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={false}
          isCheckerMode={true}
          paymentInput={dualBlindInput}
          onPaymentOutput={onPaymentOutput}
        />
      );

      const accountInput = screen.getByLabelText(/Debtor Account Number/i);
      
      // Enter incorrect value
      fireEvent.change(accountInput, { target: { value: '11111111' } });
      fireEvent.blur(accountInput);

      expect(screen.getByText('Data does not match')).toBeInTheDocument();

      const lastEmission = onPaymentOutput.mock.calls[onPaymentOutput.mock.calls.length - 1][0];
      expect(lastEmission.isDualBlindKeyPassed).toBe(false);
      expect(lastEmission.dualBlindKeyResult).toBe('failed');
    });

    it('passes dual blind check when all key values match cached source', async () => {
      const onPaymentOutput = vi.fn();
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={false}
          isCheckerMode={true}
          paymentInput={dualBlindInput}
          onPaymentOutput={onPaymentOutput}
        />
      );

      const amountInput = screen.getByPlaceholderText(/Enter Transaction Amount/i);
      const accountInput = screen.getByLabelText(/Debtor Account Number/i);

      fireEvent.change(amountInput, { target: { value: '5000' } });
      fireEvent.blur(amountInput);

      fireEvent.change(accountInput, { target: { value: '98765432' } });
      fireEvent.blur(accountInput);

      expect(screen.queryByText('Data does not match')).not.toBeInTheDocument();

      const lastEmission = onPaymentOutput.mock.calls[onPaymentOutput.mock.calls.length - 1][0];
      expect(lastEmission.isDualBlindKeyPassed).toBe(true);
      expect(lastEmission.dualBlindKeyResult).toBe('passed');
    });
  });

  describe('3. Hardcap Validation', () => {
    it('invokes onAmountChange callback when a valid amount is entered', () => {
      const onAmountChange = vi.fn();
      render(<SSPaymentFlow {...defaultProps} onAmountChange={onAmountChange} />);

      const amountInput = screen.getByPlaceholderText(/Enter Transaction Amount/i);
      fireEvent.change(amountInput, { target: { value: '2500.50' } });

      expect(onAmountChange).toHaveBeenCalledWith({
        instructedAmountCurrencyCode: 'USD',
        instructedAmount: 2500.5
      });
      expect(screen.getByText(/Validating hardcap limit/i)).toBeInTheDocument();
    });

    it('renders hardcap error message when hardcapResultReceived indicates failure', () => {
      const { rerender } = render(
        <SSPaymentFlow
          {...defaultProps}
          hardcapResultReceived={null}
        />
      );

      rerender(
        <SSPaymentFlow
          {...defaultProps}
          hardcapResultReceived={{ amountWithinLimit: false, hardCapValue: 10000 }}
        />
      );

      expect(screen.getByText('Value cannot be more than $10000')).toBeInTheDocument();
    });

    it('renders hardcap success message when limit check passes', () => {
      render(
        <SSPaymentFlow
          {...defaultProps}
          hardcapResultReceived="Hardcap limit check passed"
        />
      );

      expect(screen.getByText('Hardcap limit check passed')).toBeInTheDocument();
    });
  });

  describe('4. Automatic Country Derivation & Async Address Autocomplete', () => {
    it('derives debtor country code from debtorAgentBIC after debounce', () => {
      render(<SSPaymentFlow {...defaultProps} />);

      const bicInput = screen.getByLabelText(/Debtor Agent BIC/i);
      fireEvent.change(bicInput, { target: { value: 'CHASUS33XXX' } });

      // Fast-forward 400ms BIC debouncer
      act(() => {
        vi.advanceTimersByTime(400);
      });

      const countryInput = screen.getByLabelText(/Debtor Country/i) as HTMLInputElement;
      expect(countryInput.value).toBe('US');
      expect(countryInput.disabled).toBe(true); // Should become readonly
    });

    it('triggers address lookup service and populates address fields', async () => {
      const mockAddress = {
        addressLine: ['123 Wall St', 'Suite 400'],
        streetName: 'Wall St',
        buildingNumber: '123',
        postalCode: '10005',
        townName: 'New York',
        countrySubDivision: 'NY',
        state: 'New York',
        countryCode: 'US'
      };

      (addressService.lookupDebtorAddress as any).mockResolvedValueOnce(mockAddress);

      render(
        <SSPaymentFlow
          {...defaultProps}
          initialData={{
            ...defaultProps.initialData,
            debtorAccountNumber: '99887766',
            debtorAgentBIC: 'BOFAUS3N',
            debtorCountryCode: 'US'
          }}
        />
      );

      // Fast-forward 300ms address debouncer
      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      expect(addressService.lookupDebtorAddress).toHaveBeenCalledWith(
        '/shared-services/api/payment/api/payments',
        {
          account: '99887766',
          bic: 'BOFAUS3N',
          countryCode: 'US'
        }
      );

      const address1Input = screen.getByPlaceholderText('Address 1') as HTMLInputElement;
      expect(address1Input.value).toBe('123 Wall St');
    });
  });

  describe('5. Checker Double-Click Field Rejection', () => {
    it('toggles field failure status and notifies onFailedFieldListChange on double click', () => {
      const onFailedFieldListChange = vi.fn();
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={false}
          isCheckerMode={true}
          onFailedFieldListChange={onFailedFieldListChange}
        />
      );

      const amountContainer = screen.getByPlaceholderText(/Enter Transaction Amount/i).closest('.form-field')!;

      // Double click to reject
      fireEvent.doubleClick(amountContainer);
      expect(onFailedFieldListChange).toHaveBeenCalledWith(['instructedAmount']);

      // Double click to un-reject
      fireEvent.doubleClick(amountContainer);
      expect(onFailedFieldListChange).toHaveBeenCalledWith([]);
    });

    it('does not allow field rejection on dual blind fields', () => {
      const onFailedFieldListChange = vi.fn();
      render(
        <SSPaymentFlow
          {...defaultProps}
          isMakerMode={false}
          isCheckerMode={true}
          paymentInput={{
            dualBlindKeyFlag: 'Y',
            dualBlindKeyFields: ['instructedAmount'],
            paymentModel: { instructedAmount: 200 }
          }}
          onFailedFieldListChange={onFailedFieldListChange}
        />
      );

      const amountContainer = screen.getByPlaceholderText(/Enter Transaction Amount/i).closest('.form-field')!;
      fireEvent.doubleClick(amountContainer);

      expect(onFailedFieldListChange).not.toHaveBeenCalled();
    });
  });

  describe('6. Dynamic Sections & Collapsible Accordions', () => {
    it('toggles section accordion visibility on header click', () => {
      render(<SSPaymentFlow {...defaultProps} />);

      const debtorHeader = screen.getByText('Debtor Information');
      const debtorSectionBody = debtorHeader.closest('.section')!.querySelector('.section-body')!;

      expect(debtorSectionBody).not.toHaveClass('collapsed');

      fireEvent.click(debtorHeader);
      expect(debtorSectionBody).toHaveClass('collapsed');

      fireEvent.click(debtorHeader);
      expect(debtorSectionBody).not.toHaveClass('collapsed');
    });

    it('hides intermediary bank section when payment method is BKT (Book Transfer)', () => {
      render(
        <SSPaymentFlow
          {...defaultProps}
          initialData={{
            ...defaultProps.initialData,
            painPaymentMethodType: 'BKT'
          }}
        />
      );

      expect(screen.queryByText(/Intermediary Bank Details/i)).not.toBeInTheDocument();
    });

    it('renders LATAM Tax Details section when debtor agent BIC belongs to a LATAM country', () => {
      render(
        <SSPaymentFlow
          {...defaultProps}
          initialData={{
            ...defaultProps.initialData,
            debtorAgentBIC: 'BRASCESPXXX' // BR = Brazil (LATAM)
          }}
        />
      );

      expect(screen.getByText('Tax Details')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Tax ID Number')).toBeInTheDocument();
    });
  });

  describe('7. Output & Validity Synchronization', () => {
    it('dispatches validity payload and constructed Pain001 output', () => {
      const onPaymentOutput = vi.fn();
      const onFormValidityChange = vi.fn();

      render(
        <SSPaymentFlow
          {...defaultProps}
          onPaymentOutput={onPaymentOutput}
          onFormValidityChange={onFormValidityChange}
        />
      );

      expect(onPaymentOutput).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: true,
          outputMessage: 'Valid',
          paymentData: expect.any(Object)
        })
      );

      expect(onFormValidityChange).toHaveBeenCalledWith(
        expect.objectContaining({
          validForm: true
        })
      );
    });

    it('marks form as invalid when mandatory fields are missing', () => {
      const onFormValidityChange = vi.fn();

      render(
        <SSPaymentFlow
          {...defaultProps}
          initialData={{
            ...defaultProps.initialData,
            debtorName: '' // Missing mandatory field
          }}
          onFormValidityChange={onFormValidityChange}
        />
      );

      expect(onFormValidityChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          validForm: false
        })
      );
    });
  });
});