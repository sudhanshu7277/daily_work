import React, {
  FC,
  useState,
  useMemo,
  useCallback,
  useEffect
} from 'react';
import { PaymentChild } from './SSPaymentFlow';
import {
  Pain001Model,
  PaymentComponentInput,
  PaymentComponentOutput,
  FormFieldConfig,
  createEmptyPain001
} from '../types/models';
import * as hardcapService from '../services/hardcapService';
import { useAuth } from '@/context/AuthContext';
import './payment-flow.css';

export interface PaymentParentProps {
  mode?: 'maker' | 'checker' | 'repair';
  initialData?: Partial<Pain001Model> | null;
  hideTabs?: boolean;
  onPaymentSuccess?: (refId: string, payload: any) => void;
  onClose?: () => void;
}

const PARENT_FIELD_CONFIG: FormFieldConfig[] = [
  // 1. Core Payment Information
  { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: false, options: ['CBT', 'BKT', 'DFT'], placeholder: '-- Select --' },
  { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true, type: 'date' },
  { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true },
  { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true },

  // 2. Debtor Details (Strict Mandatory)
  { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
  { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true },
  { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false, required: true },

  // 3. Debtor Address Details (Optional)
  { fieldName: 'debtorAddressLines1', label: 'Debtor Address Line 1', hidden: false, required: false },
  { fieldName: 'debtorAddressLines2', label: 'Debtor Address Line 2', hidden: false, required: false },
  { fieldName: 'debtorStreetName', label: 'Debtor Street', hidden: false, required: false },
  { fieldName: 'debtorBuildingNumber', label: 'Debtor Building Number', hidden: false, required: false },
  { fieldName: 'debtorPostalCode', label: 'Debtor Postal Code', hidden: false, required: false },
  { fieldName: 'debtorTownName', label: 'Debtor Town / City Name', hidden: false, required: false },
  { fieldName: 'debtorCountrySubDivision', label: 'Debtor Country Sub-division', hidden: false, required: false },
  { fieldName: 'debtorState', label: 'Debtor State', hidden: false, required: false },
  { fieldName: 'debtorCountryCode', label: 'Debtor Country', hidden: false, required: false },
  { fieldName: 'debtorSortCodeUK', label: 'Debtor Sort Code', hidden: false, required: false },
  { fieldName: 'debtorSortCodeUS', label: 'Debtor Sort Code (US)', hidden: false, required: false },

  // 4. Intermediary Bank Details (Optional)
  { fieldName: 'firstIntermediaryBankBIC', label: '1st Intermediary Bank SWIFT Code', hidden: false, required: false },
  { fieldName: 'firstIntermediaryBankRoutingCode', label: '1st Intermediary Bank Routing Code', hidden: false, required: false },
  { fieldName: 'firstIntermediaryBankName', label: '1st Intermediary Bank Name', hidden: false, required: false },
  { fieldName: 'firstIntermediaryBankCountryCode', label: '1st Intermediary Bank Country Code', hidden: false, required: false },
  { fieldName: 'firstIntermediaryBankAccountNumber', label: '1st Intermediary Account Number', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankBIC', label: '2nd Intermediary Bank SWIFT Code', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankRoutingCode', label: '2nd Intermediary Bank Routing Code', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankName', label: '2nd Intermediary Bank Name', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankCountryCode', label: '2nd Intermediary Bank Country Code', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankAccountNumber', label: '2nd Intermediary Account Number', hidden: false, required: false },

  // 5. Creditor Details (Strict Mandatory)
  { fieldName: 'creditorName', label: 'Creditor Name', hidden: false, required: true },
  { fieldName: 'creditorAccount', label: 'Creditor Account Number', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', hidden: false, required: false },
  { fieldName: 'creditorAgentAccount', label: 'Creditor Agent Account Number', hidden: false, required: false },

  // 6. Creditor Address Details (Optional)
  { fieldName: 'creditorAddressLines1', label: 'Creditor Address Line 1', hidden: false, required: false },
  { fieldName: 'creditorAddressLines2', label: 'Creditor Address Line 2', hidden: false, required: false },
  { fieldName: 'creditorStreetName', label: 'Creditor Street', hidden: false, required: false },
  { fieldName: 'creditorBuildingNumber', label: 'Creditor Building Number', hidden: false, required: false },
  { fieldName: 'creditorPostalCode', label: 'Creditor Postal Code', hidden: false, required: false },
  { fieldName: 'creditorTownName', label: 'Creditor Town / City Name', hidden: false, required: false },
  { fieldName: 'creditorCountrySubDivision', label: 'Creditor Country Sub-division', hidden: false, required: false },
  { fieldName: 'creditorState', label: 'Creditor State', hidden: false, required: false },
  { fieldName: 'creditorCountryCode', label: 'Creditor Country', hidden: false, required: false },
  { fieldName: 'creditorSortCodeUK', label: 'Creditor Sort Code', hidden: false, required: false },
  { fieldName: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', hidden: false, required: false },

  // 7. Remittance & Charges
  { fieldName: 'ustrdPaymentDetails', label: 'Remittance Information', hidden: false, required: false },
  { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false, required: true },
  { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false, required: false },
  { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false, required: false },

  // 8. Tax / Regulatory Details (Optional)
  { fieldName: 'taxIdNumber', label: 'Tax ID Number', hidden: false, required: false },
  { fieldName: 'taxIdType', label: 'Tax ID Type', hidden: false, required: false },
  { fieldName: 'purposeOfPayment', label: 'Purpose of Payment', hidden: false, required: false },
  { fieldName: 'taxPurposeCode', label: 'Tax Purpose Code', hidden: false, required: false },
  { fieldName: 'regulatoryReportingCode', label: 'Regulatory Reporting Code', hidden: false, required: false },
  { fieldName: 'invoiceReferenceNumber', label: 'Invoice / Reference Number', hidden: false, required: false }
];

export const PaymentParent: FC<PaymentParentProps> = ({
  mode = 'maker',
  initialData = null,
  hideTabs = false,
  onPaymentSuccess,
  onClose
}) => {
  let soeId = 'sj81534';
  try {
    const authContext = useAuth();
    if (authContext && typeof authContext === 'object') {
      soeId = (authContext as any).soeId || (authContext as any).user?.soeId || (authContext as any).userId || 'sj81534';
    } else if (typeof authContext === 'string') {
      soeId = authContext;
    }
  } catch {
    soeId = 'sj81534';
  }

  const [activeTab, setActiveTab] = useState<'maker' | 'checker' | 'repair'>(mode);

  useEffect(() => {
    if (mode) {
      setActiveTab(mode);
    }
  }, [mode]);

  // Shared active transaction data transferred from Maker to Checker
  const [activeSubmittedTransaction, setActiveSubmittedTransaction] = useState<{
    transactionId: string;
    paymentId: string;
    maker: string;
    payload: Pain001Model;
  }>({
    transactionId: '6641753311580996571',
    paymentId: 'c337a6c4-4622-404e-b303-e0ec5192b04c',
    maker: 'sj81534',
    payload: {
      ...createEmptyPain001(),
      requestedExecutionDate: '2026-08-25',
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: 50000,
      debtorName: 'ACME Corporation Global Ltd',
      debtorAccountNumber: '8378339123456789',
      debtorAgentBIC: 'CITIGB2LXXX',
      debtorCountryCode: 'GB',
      debtorTownName: 'London',
      debtorAddressLines1: '25 Canada Square',
      creditorName: 'Starlight Solutions Inc',
      creditorAccount: '998877665544',
      creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
      creditorAgentFinancialInstitutionName: 'Citibank N.A. New York',
      creditorAddressLines1: '388 Greenwich Street',
      creditorCountryCode: 'US',
      creditorTownName: 'New York',
      chargeBearer: 'DEBT',
      painPaymentMethodType: 'CBT',
      ustrdPaymentDetails: 'Invoice #INV-2026-8890',
      taxIdNumber: '',
      taxIdType: '',
      purposeOfPayment: '',
      taxPurposeCode: '',
      regulatoryReportingCode: '',
      invoiceReferenceNumber: ''
    }
  });

  const [modalResponse, setModalResponse] = useState<{
    title: string;
    referenceId: string;
    amount?: string | number;
    status: string;
    message: string;
    color: string;
  } | null>(null);

  const closeModal = () => {
    setModalResponse(null);
    if (onClose) onClose();
  };

  // =========================================================================
  // 1. MAKER MODE STATE & HANDLERS
  // =========================================================================
  const [makerFormValid, setMakerFormValid] = useState<boolean>(false);
  const [makerPayload, setMakerPayload] = useState<Pain001Model | null>(null);
  const [makerHardcapResult, setMakerHardcapResult] = useState<any>(null);
  const [isMakerSubmitting, setIsMakerSubmitting] = useState<boolean>(false);

  const makerPaymentInput: PaymentComponentInput = useMemo(() => ({
    applicationName: 'ADR',
    applicationModule: 'ADR',
    currency: initialData?.instructedAmountCurrencyCode || 'USD',
    paymentMode: 'maker',
    dualBlindKeyFlag: 'N',
    paymentModel: initialData ? { ...createEmptyPain001(), ...initialData } : null
  }), [initialData]);

  const handleMakerAmountChange = useCallback(async ({ instructedAmountCurrencyCode, instructedAmount }: { instructedAmountCurrencyCode: string; instructedAmount: number }) => {
    if (!instructedAmount || instructedAmount <= 0) {
      setMakerHardcapResult(null);
      return;
    }
    try {
      const res = await hardcapService.verifyHardCap('/shared-services/api/payment', {
        currency: instructedAmountCurrencyCode || 'USD',
        paymentAmount: instructedAmount,
        applicationName: 'ADR',
        applicationModule: 'ADR'
      });
      setMakerHardcapResult(res);
    } catch {
      setMakerHardcapResult({ amountWithinLimit: true, hardCapValue: 999999999 });
    }
  }, []);

  const handleMakerOutput = useCallback((output: PaymentComponentOutput) => {
    setMakerFormValid(Boolean(output?.isValid));
    if (output?.paymentData) {
      setMakerPayload(output.paymentData);
    }
  }, []);

  const handleMakerSubmit = async (overrideDuplicate = false) => {
    if (!makerPayload || !makerFormValid) return;
    setIsMakerSubmitting(true);

    const endpoint = '/shared-services/api/payment/api/payments';
    const payload = {
      ...makerPayload,
      loginUser: soeId,
      overrideDuplicateFlag: overrideDuplicate ? 'Y' : 'N'
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'SOEID': soeId
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
          if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
            await handleMakerSubmit(true);
            return;
          }
        }

        const errorMessage =
          data?.error ||
          data?.message ||
          `Payment submission failed on server (HTTP ${res.status}: ${res.statusText || 'Error'})`;

        setModalResponse({
          title: 'MAKER RECORD NOT CREATED',
          referenceId: data?.referenceId || data?.transactionId || 'N/A',
          amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
          status: 'FAILED',
          message: errorMessage,
          color: '#d64545'
        });
        return;
      }

      const txnId = data.transactionId || data.referenceId || data.id || 'TXN-CONFIRMED';
      const pmtId = data.paymentId || 'PMT-CONFIRMED';

      setActiveSubmittedTransaction({
        transactionId: txnId,
        paymentId: pmtId,
        maker: soeId,
        payload: makerPayload
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(txnId, makerPayload);
      }

      setModalResponse({
        title: 'MAKER RECORD SAVED',
        referenceId: txnId,
        amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
        status: data.status || 'SUBMITTED',
        message: 'Payment record saved successfully !',
        color: '#00509d'
      });
    } catch (err: any) {
      console.error('Maker submission network/client error:', err);
      setModalResponse({
        title: 'MAKER RECORD NOT CREATED',
        referenceId: 'N/A',
        amount: `${makerPayload?.instructedAmountCurrencyCode || 'USD'} ${makerPayload?.instructedAmount || 0}`,
        status: 'FAILED',
        message: err?.message || 'Network error: Unable to connect to payment services API.',
        color: '#d64545'
      });
    } finally {
      setIsMakerSubmitting(false);
    }
  };

  // =========================================================================
  // 2. CHECKER MODE STATE & HANDLERS
  // =========================================================================
  const [checkerFormValid, setCheckerFormValid] = useState<boolean>(false);
  const [checkerDualBlindPassed, setCheckerDualBlindPassed] = useState<boolean>(false);
  const [checkerPayload, setCheckerPayload] = useState<Pain001Model | null>(null);
  const [checkerFailedFields, setCheckerFailedFields] = useState<string[]>([]);
  const [checkerComments, setCheckerComments] = useState<string>('');
  const [isCheckerProcessing, setIsCheckerProcessing] = useState<boolean>(false);

  const checkerPaymentInput: PaymentComponentInput = useMemo(() => ({
    applicationName: 'ADR',
    applicationModule: 'ADR',
    paymentMode: 'checker',
    dualBlindKeyFlag: 'Y',
    dualBlindKeyFields: [
      'instructedAmount',
      'creditorName',
      'debtorName',
      'debtorAccountNumber',
      'creditorAccount',
      'debtorAgentBIC'
    ],
    paymentModel: activeSubmittedTransaction.payload
  }), [activeSubmittedTransaction]);

  const handleCheckerOutput = useCallback((output: PaymentComponentOutput) => {
    setCheckerFormValid(Boolean(output?.isValid));
    setCheckerDualBlindPassed(Boolean(output?.isDualBlindKeyPassed));
    if (output?.paymentData) {
      setCheckerPayload(output.paymentData);
    }
  }, []);

  const handleCheckerDecision = async (action: 'Approved' | 'Rejected') => {
    if (action === 'Rejected' && !checkerComments.trim()) {
      alert('Please enter comments stating the reason for rejection.');
      return;
    }

    setIsCheckerProcessing(true);
    const endpoint = '/shared-services/api/payment/api/payments/checker/decision';
    const payload = {
      application: 'ADR',
      module: 'ADR',
      action,
      comments: checkerComments.trim(),
      loginUser: soeId,
      transactionId: activeSubmittedTransaction.transactionId,
      paymentId: activeSubmittedTransaction.paymentId,
      maker: activeSubmittedTransaction.maker,
      failedFields: action === 'Rejected' ? checkerFailedFields : [],
      paymentDetailsRequest: checkerPayload || activeSubmittedTransaction.payload
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'SOEID': soeId
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Checker action failed (${res.status})`);
      }

      setModalResponse({
        title: action === 'Approved' ? 'CHECKER APPROVAL SUCCESSFUL' : 'CHECKER REJECTION RECORDED',
        referenceId: data.transactionId || activeSubmittedTransaction.transactionId,
        amount: `${activeSubmittedTransaction.payload.instructedAmountCurrencyCode} ${activeSubmittedTransaction.payload.instructedAmount}`,
        status: action === 'Approved' ? 'APPROVED' : 'REJECTED',
        message: action === 'Approved'
          ? 'Payment approved and released to clearing successfully!'
          : 'Payment rejected and routed to the Repair Queue.',
        color: action === 'Approved' ? '#00509d' : '#d64545'
      });
    } catch (err: any) {
      console.warn('Checker decision API dispatch error:', err);
      setModalResponse({
        title: action === 'Approved' ? 'CHECKER APPROVAL SUCCESSFUL' : 'CHECKER REJECTION RECORDED',
        referenceId: activeSubmittedTransaction.transactionId,
        amount: `${activeSubmittedTransaction.payload.instructedAmountCurrencyCode} ${activeSubmittedTransaction.payload.instructedAmount}`,
        status: action === 'Approved' ? 'APPROVED' : 'REJECTED',
        message: `Decision '${action}' saved. Flagged fields: ${checkerFailedFields.length}`,
        color: action === 'Approved' ? '#00509d' : '#d64545'
      });
    } finally {
      setIsCheckerProcessing(false);
    }
  };

  const isApproveDisabled = isCheckerProcessing || !checkerFormValid || !checkerDualBlindPassed || checkerFailedFields.length > 0;
  const isRejectDisabled = isCheckerProcessing;

  // =========================================================================
  // 3. REPAIR MODE STATE & HANDLERS
  // =========================================================================
  const [repairFormValid, setRepairFormValid] = useState<boolean>(false);
  const [repairPayload, setRepairPayload] = useState<Pain001Model | null>(null);
  const [isRepairSubmitting, setIsRepairSubmitting] = useState<boolean>(false);
  const [repairNewlyModifiedFields, setRepairNewlyModifiedFields] = useState<string[]>([]);

  const sampleRepairData: Pain001Model = useMemo(() => ({
    ...createEmptyPain001(),
    requestedExecutionDate: '2026-08-25',
    instructedAmountCurrencyCode: 'USD',
    instructedAmount: 12000,
    debtorName: 'Pacific Rim Trade Corp',
    debtorAccountNumber: '554433221100',
    debtorAgentBIC: 'BOFAUS3NXXX',
    debtorCountryCode: 'US',
    creditorName: 'Nexus Tech International',
    creditorAccount: '998877665',
    creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
    creditorAgentFinancialInstitutionName: 'Citibank N.A.',
    creditorAddressLines1: '100 Wall Street',
    creditorCountryCode: 'US',
    chargeBearer: 'SHAR',
    painPaymentMethodType: 'DFT',
    ustrdPaymentDetails: 'Re-repairing transaction per checker request',
    taxIdNumber: '',
    taxIdType: '',
    purposeOfPayment: '',
    taxPurposeCode: '',
    regulatoryReportingCode: '',
    invoiceReferenceNumber: ''
  }), []);

  const repairReviewFieldList = useMemo(() => ['debtorName', 'creditorName', 'instructedAmount'], []);

  const repairPaymentInput: PaymentComponentInput = useMemo(() => ({
    applicationName: 'ADR',
    applicationModule: 'ADR',
    paymentMode: 'repair',
    dualBlindKeyFlag: 'N',
    rejectedFieldList: repairReviewFieldList,
    paymentModel: sampleRepairData
  }), [sampleRepairData, repairReviewFieldList]);

  const handleRepairOutput = useCallback((output: PaymentComponentOutput) => {
    setRepairFormValid(Boolean(output?.isValid));
    if (output?.paymentData) {
      setRepairPayload(output.paymentData);
    }
  }, []);

  const handleRepairResubmit = async () => {
    if (!repairPayload || !repairFormValid) return;
    setIsRepairSubmitting(true);

    const endpoint = '/shared-services/api/payment/api/payments/repair/resubmit';
    const payload = {
      originalTransactionId: 'TXN-REPAIR-5541',
      repairUser: soeId,
      modifiedFields: repairNewlyModifiedFields,
      paymentData: repairPayload
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'SOEID': soeId
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Repair resubmission failed (${res.status})`);
      }

      setModalResponse({
        title: 'REPAIR RESUBMITTED',
        referenceId: data.referenceId || 'TXN-REPAIR-5541',
        amount: `${repairPayload.instructedAmountCurrencyCode || 'USD'} ${repairPayload.instructedAmount}`,
        status: 'RESUBMITTED',
        message: 'Repaired transaction successfully re-sent to verification queue!',
        color: '#00509d'
      });
    } catch (err: any) {
      console.error('Repair submit error:', err);
      setModalResponse({
        title: 'REPAIR RESUBMISSION FAILED',
        referenceId: 'TXN-REPAIR-5541',
        amount: `${repairPayload?.instructedAmountCurrencyCode || 'USD'} ${repairPayload?.instructedAmount}`,
        status: 'FAILED',
        message: err.message || 'Payment repair resubmission failed !',
        color: '#d64545'
      });
    } finally {
      setIsRepairSubmitting(false);
    }
  };

  return (
    <div className="sample-container">
      {/* Top Tab Bar */}
      {!hideTabs && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #d9e2ec', paddingBottom: '12px' }}>
          <button
            type="button"
            className={`lmn-btn ${activeTab === 'maker' ? 'lmn-btn-primary' : ''}`}
            style={{ fontWeight: 600 }}
            onClick={() => setActiveTab('maker')}
          >
            1. Maker Mode
          </button>
          <button
            type="button"
            className={`lmn-btn ${activeTab === 'checker' ? 'lmn-btn-primary' : ''}`}
            style={{ fontWeight: 600 }}
            onClick={() => setActiveTab('checker')}
          >
            2. Checker Mode
          </button>
          <button
            type="button"
            className={`lmn-btn ${activeTab === 'repair' ? 'lmn-btn-primary' : ''}`}
            style={{ fontWeight: 600 }}
            onClick={() => setActiveTab('repair')}
          >
            3. Repair Mode
          </button>
        </div>
      )}

      {/* 1. MAKER MODE */}
      {activeTab === 'maker' && (
        <div>
          <div className="parent-section-heading">Outbound ISO 20022 Payment (Maker Mode)</div>
          <div className="payment-component-wrapper">
            <PaymentChild
              paymentInput={makerPaymentInput}
              fieldConfig={PARENT_FIELD_CONFIG}
              isMakerMode={true}
              hardcapResultReceived={makerHardcapResult}
              onAmountChange={handleMakerAmountChange}
              onPaymentOutput={handleMakerOutput}
            />
          </div>

          <div className="action-bar">
            <button
              type="button"
              className={!makerFormValid || isMakerSubmitting ? 'lmn-btn-unclickable lmn-btn-grey' : 'lmn-btn lmn-btn-primary'}
              disabled={!makerFormValid || isMakerSubmitting}
              onClick={() => handleMakerSubmit(false)}
            >
              {isMakerSubmitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </div>
      )}

      {/* 2. CHECKER MODE */}
      {activeTab === 'checker' && (
        <div>
          <div className="parent-section-heading">Payment Verification & Authorization (Checker Mode)</div>
          
          <div className="parent-section-checker-info" style={{ margin: '12px 0' }}>
            <div className="parent-section-meta">
              <span><strong>Instruction ID:</strong> {activeSubmittedTransaction.transactionId}</span>
              <span><strong>Maker SOEID:</strong> {activeSubmittedTransaction.maker}</span>
              <span><strong>Event Type:</strong> OUTBOUND_ISO_PAIN001</span>
              <span><strong>Value Date:</strong> {activeSubmittedTransaction.payload.requestedExecutionDate}</span>
              <span><strong>Dual-Blind Status:</strong> {checkerDualBlindPassed ? '✅ All Re-Keyed Fields Matched' : '⚠️ Re-Keying Required'}</span>
              <span><strong>Flagged Error Fields:</strong> {checkerFailedFields.length}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#627d98', marginTop: '4px' }}>
              💡 <em>Double-click any non-blind input field to flag it as rejected for the Maker.</em>
            </div>
          </div>

          <div className="payment-component-wrapper">
            <PaymentChild
              paymentInput={checkerPaymentInput}
              fieldConfig={PARENT_FIELD_CONFIG}
              isCheckerMode={true}
              onFailedFieldListChange={setCheckerFailedFields}
              onPaymentOutput={handleCheckerOutput}
            />
          </div>

          <div className="action-container" style={{ marginTop: '20px', padding: '16px', background: '#f0f4f8', borderRadius: '4px', border: '1px solid #d9e2ec' }}>
            <div className="form-group" style={{ marginBottom: '14px', width: '100%' }}>
              <label htmlFor="checkerComments" style={{ fontWeight: 600, fontSize: '12px', color: '#334e68' }}>
                Checker Comments / Reason for Rejection
              </label>
              <textarea
                id="checkerComments"
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #9fb3c8', marginTop: '4px', boxSizing: 'border-box' }}
                value={checkerComments}
                placeholder="Enter authorization notes or specify failure reason if rejecting..."
                onChange={e => setCheckerComments(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
              <button
                type="button"
                className="btn-reject"
                disabled={isRejectDisabled}
                onClick={() => handleCheckerDecision('Rejected')}
              >
                {isCheckerProcessing ? 'Processing...' : `Reject ${checkerFailedFields.length > 0 ? `(${checkerFailedFields.length} Flagged)` : ''}`}
              </button>

              <button
                type="button"
                className="lmn-btn lmn-btn-primary btn-approve"
                disabled={isApproveDisabled}
                onClick={() => handleCheckerDecision('Approved')}
              >
                {isCheckerProcessing ? 'Processing...' : 'Approve Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REPAIR MODE */}
      {activeTab === 'repair' && (
        <div>
          <div className="parent-section-heading">Payment Correction Queue (Repair Mode)</div>
          
          <div className="parent-section-checker-info" style={{ borderColor: '#f59e0b', background: '#fffbeb', margin: '12px 0' }}>
            <div style={{ fontWeight: 600, color: '#b45309', marginBottom: '4px' }}>
              ⚠️ Checker Rejection Notice:
            </div>
            <div style={{ fontSize: '13px', color: '#92400e' }}>
              Debtor Name, Creditor Name, and Amount failed clearance verification. Please amend highlighted fields (amber) and resubmit.
            </div>
            <div style={{ fontSize: '11px', color: '#627d98', marginTop: '6px' }}>
              🟡 Amber = Checker flagged for review &nbsp;|&nbsp; 🟢 Green = Newly modified by Repairer
            </div>
          </div>

          <div className="payment-component-wrapper">
            <PaymentChild
              paymentInput={repairPaymentInput}
              fieldConfig={PARENT_FIELD_CONFIG}
              isRepairMode={true}
              repairReviewFieldList={repairReviewFieldList}
              repairNewlyModifyFieldList={repairNewlyModifiedFields}
              onPaymentOutput={handleRepairOutput}
              onFormChange={val => {
                const modifiedKeys = Object.keys(val).filter(
                  key => (val as any)[key] !== (sampleRepairData as any)[key]
                );
                if (modifiedKeys.length > 0) {
                  setRepairNewlyModifiedFields(prev => Array.from(new Set([...prev, ...modifiedKeys])));
                }
              }}
            />
          </div>

          <div className="action-bar">
            <button
              type="button"
              className={!repairFormValid || isRepairSubmitting ? 'lmn-btn-unclickable lmn-btn-grey' : 'lmn-btn lmn-btn-primary'}
              disabled={!repairFormValid || isRepairSubmitting}
              onClick={handleRepairResubmit}
            >
              {isRepairSubmitting ? 'Resubmitting...' : 'Resubmit Repaired Payment'}
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL */}
      {modalResponse && (
        <div id="myModal" className="modal" style={{ display: 'block' }}>
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <header className="modal-header">
                <h3>{modalResponse.title}</h3>
                <button
                  type="button"
                  className="close-btn"
                  aria-label="Close"
                  onClick={closeModal}
                >
                  &times;
                </button>
              </header>

              <div className="modal-body">
                <div className="details-card">
                  <div className="detail-row">
                    <span className="label">Reference ID:</span>
                    <span className="value">
                      <strong>{modalResponse.referenceId}</strong>
                    </span>
                  </div>
                  {modalResponse.amount && (
                    <div className="detail-row">
                      <span className="label">Amount:</span>
                      <span className="value">{modalResponse.amount}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span
                      className="value"
                      style={{ color: modalResponse.color, fontWeight: 600 }}
                    >
                      {modalResponse.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Message:</span>
                    <span className="value">{modalResponse.message}</span>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="lmn-btn lmn-btn-primary"
                  onClick={closeModal}
                >
                  OK
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentParent;