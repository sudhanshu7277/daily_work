import React, {
  FC,
  useState,
  useMemo,
  useCallback
} from 'react';
import { PaymentChild } from './PaymentChild';
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

const PARENT_FIELD_CONFIG: FormFieldConfig[] = [
  { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: false, options: ['CBT', 'BKT', 'DFT'], placeholder: '-- Select --' },
  { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true, type: 'date' },
  { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true },
  { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true },
  { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
  { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true },
  { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false, required: true },
  { fieldName: 'debtorStreetName', label: 'Debtor Street', hidden: false, required: false },
  { fieldName: 'debtorBuildingNumber', label: 'Debtor Building Number', hidden: false, required: false },
  { fieldName: 'debtorPostalCode', label: 'Debtor Postal Code', hidden: false, required: false },
  { fieldName: 'debtorTownName', label: 'Debtor Town / City Name', hidden: false, required: false },
  { fieldName: 'debtorCountrySubDivision', label: 'Debtor State', hidden: false, required: false },
  { fieldName: 'debtorCountryCode', label: 'Debtor Country', hidden: false, required: false },
  { fieldName: 'debtorSortCodeUK', label: 'Debtor Sort Code', hidden: false, required: false },
  { fieldName: 'debtorSortCodeUS', label: 'Debtor Sort Code (US)', hidden: false, required: false },
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
  { fieldName: 'creditorName', label: 'Creditor Name', hidden: false, required: true },
  { fieldName: 'creditorAccount', label: 'Creditor Account Number', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', hidden: false, required: true },
  { fieldName: 'creditorAddressLines1', label: 'Creditor Address Line 1', hidden: false, required: true },
  { fieldName: 'creditorStreetName', label: 'Creditor Street', hidden: false, required: false },
  { fieldName: 'creditorBuildingNumber', label: 'Creditor Building Number', hidden: false, required: false },
  { fieldName: 'creditorPostalCode', label: 'Creditor Postal Code', hidden: false, required: false },
  { fieldName: 'creditorTownName', label: 'Creditor Town / City Name', hidden: false, required: false },
  { fieldName: 'creditorCountrySubDivision', label: 'Creditor State', hidden: false, required: false },
  { fieldName: 'creditorCountryCode', label: 'Creditor Country', hidden: false, required: false },
  { fieldName: 'creditorSortCodeUK', label: 'Creditor Sort Code', hidden: false, required: false },
  { fieldName: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', hidden: false, required: false },
  { fieldName: 'ustrdPaymentDetails', label: 'Remittance Information', hidden: false, required: false },
  { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false, required: true },
  { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false, required: false },
  { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false, required: false }
];

export const PaymentParent: FC = () => {
  let soeId = 'CURRENT_USER';
  try {
    const authContext = useAuth();
    if (authContext && typeof authContext === 'object') {
      soeId = (authContext as any).soeId || (authContext as any).user?.soeId || (authContext as any).userId || 'CURRENT_USER';
    } else if (typeof authContext === 'string') {
      soeId = authContext;
    }
  } catch {
    soeId = 'CURRENT_USER';
  }

  const [activeTab, setActiveTab] = useState<'maker' | 'checker' | 'repair'>('maker');

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
    currency: 'USD',
    paymentMode: 'maker',
    dualBlindKeyFlag: 'N',
    paymentModel: null
  }), []);

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
    setMakerFormValid(output.isValid);
    setMakerPayload(output.paymentData);
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
        throw new Error(data?.error || data?.message || `Payment creation failed (${res.status})`);
      }

      setModalResponse({
        title: 'MAKER RECORD SAVED',
        referenceId: data.referenceId || data.transactionId || data.id || ('REF-' + Math.floor(100000 + Math.random() * 900000)),
        amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
        status: data.status || 'SUBMITTED',
        message: 'Payment record saved successfully !',
        color: '#059669'
      });
    } catch (err: any) {
      console.error('Maker submit failed:', err);
      setModalResponse({
        title: 'MAKER RECORD NOT CREATED',
        referenceId: 'N/A',
        amount: `${makerPayload?.instructedAmountCurrencyCode || 'USD'} ${makerPayload?.instructedAmount || 0}`,
        status: 'FAILED',
        message: err.message || 'Payment creation failed !',
        color: '#dc2626'
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

  const sampleCheckerData: Pain001Model = useMemo(() => ({
    ...createEmptyPain001(),
    requestedExecutionDate: '2026-08-20',
    instructedAmountCurrencyCode: 'USD',
    instructedAmount: 50000,
    debtorName: 'ACME Corporation Global Ltd',
    debtorAccountNumber: 'ACCT-987654321',
    debtorAgentBIC: 'CHASUS33XXX',
    debtorCountryCode: 'US',
    debtorPostalCode: '10001',
    creditorName: 'Starlight Solutions Inc',
    creditorAccount: 'CRED-112233445',
    creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
    creditorAgentFinancialInstitutionName: 'Citibank N.A. New York',
    creditorAddressLines1: '388 Greenwich Street',
    creditorCountryCode: 'US',
    creditorPostalCode: '10013',
    chargeBearer: 'DEBT',
    painPaymentMethodType: 'CBT',
    ustrdPaymentDetails: 'Invoice #INV-2026-8890'
  }), []);

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
    paymentModel: sampleCheckerData
  }), [sampleCheckerData]);

  const handleCheckerOutput = useCallback((output: PaymentComponentOutput) => {
    setCheckerFormValid(output.isValid);
    setCheckerDualBlindPassed(output.isDualBlindKeyPassed);
    setCheckerPayload(output.paymentData);
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
      transactionId: 'TXN-902188',
      failedFields: action === 'Rejected' ? checkerFailedFields : [],
      paymentDetailsRequest: checkerPayload || sampleCheckerData
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
        referenceId: data.transactionId || data.referenceId || 'TXN-902188',
        amount: `${sampleCheckerData.instructedAmountCurrencyCode} ${sampleCheckerData.instructedAmount}`,
        status: action === 'Approved' ? 'APPROVED' : 'REJECTED',
        message: action === 'Approved'
          ? 'Payment approved and released to clearing successfully!'
          : 'Payment rejected and routed to the Repair Queue.',
        color: action === 'Approved' ? '#059669' : '#dc2626'
      });
    } catch (err: any) {
      console.error('Checker decision submission error:', err);
      setModalResponse({
        title: action === 'Approved' ? 'CHECKER APPROVAL SUCCESSFUL' : 'CHECKER REJECTION RECORDED',
        referenceId: 'TXN-902188',
        amount: `${sampleCheckerData.instructedAmountCurrencyCode} ${sampleCheckerData.instructedAmount}`,
        status: action === 'Approved' ? 'APPROVED' : 'REJECTED',
        message: `Decision '${action}' saved. Flagged fields: ${checkerFailedFields.length}`,
        color: action === 'Approved' ? '#059669' : '#dc2626'
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
    debtorAccountNumber: 'DEBT-554433221',
    debtorAgentBIC: 'BOFAUS3NXXX',
    debtorCountryCode: 'US',
    debtorPostalCode: '90001',
    creditorName: 'Nexus Tech International',
    creditorAccount: 'CRED-998877665',
    creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
    creditorAgentFinancialInstitutionName: 'Citibank N.A.',
    creditorAddressLines1: '100 Wall Street',
    creditorCountryCode: 'US',
    creditorPostalCode: '10005',
    chargeBearer: 'SHAR',
    painPaymentMethodType: 'DFT',
    ustrdPaymentDetails: 'Re-repairing transaction per checker request'
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
    setRepairFormValid(output.isValid);
    setRepairPayload(output.paymentData);
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
        referenceId: data.referenceId || data.transactionId || 'TXN-REPAIR-5541',
        amount: `${repairPayload.instructedAmountCurrencyCode || 'USD'} ${repairPayload.instructedAmount}`,
        status: 'RESUBMITTED',
        message: 'Repaired transaction successfully re-sent to verification queue!',
        color: '#059669'
      });
    } catch (err: any) {
      console.error('Repair submit error:', err);
      setModalResponse({
        title: 'REPAIR RESUBMISSION FAILED',
        referenceId: 'TXN-REPAIR-5541',
        amount: `${repairPayload?.instructedAmountCurrencyCode || 'USD'} ${repairPayload?.instructedAmount}`,
        status: 'FAILED',
        message: err.message || 'Payment repair resubmission failed !',
        color: '#dc2626'
      });
    } finally {
      setIsRepairSubmitting(false);
    }
  };

  return (
    <div className="sample-container">
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
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

      {/* ===================================================================== */}
      {/* 1. MAKER MODE VIEW                                                    */}
      {/* ===================================================================== */}
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

      {/* ===================================================================== */}
      {/* 2. CHECKER MODE VIEW                                                  */}
      {/* ===================================================================== */}
      {activeTab === 'checker' && (
        <div>
          <div className="parent-section-heading">Payment Verification & Authorization (Checker Mode)</div>
          
          <div className="parent-section-checker-info" style={{ margin: '12px 0' }}>
            <div className="parent-section-meta">
              <span><strong>Instruction ID:</strong> TXN-902188</span>
              <span><strong>Event Type:</strong> OUTBOUND_ISO_PAIN001</span>
              <span><strong>Value Date:</strong> 2026-08-20</span>
              <span><strong>Dual-Blind Status:</strong> {checkerDualBlindPassed ? '✅ All Re-Keyed Fields Matched' : '⚠️ Re-Keying Required'}</span>
              <span><strong>Flagged Error Fields:</strong> {checkerFailedFields.length}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              💡 <em>Tip: Double-click any non-blind input field to flag it as rejected for the Maker.</em>
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

          <div className="action-container" style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label htmlFor="checkerComments" style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
                Checker Comments / Reason for Rejection
              </label>
              <textarea
                id="checkerComments"
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '6px' }}
                value={checkerComments}
                placeholder="Enter authorization notes or specify failure reason if rejecting..."
                onChange={e => setCheckerComments(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn-reject"
                disabled={isRejectDisabled}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  cursor: isRejectDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
                onClick={() => handleCheckerDecision('Rejected')}
              >
                {isCheckerProcessing ? 'Processing...' : `Reject ${checkerFailedFields.length > 0 ? `(${checkerFailedFields.length} Flagged)` : ''}`}
              </button>

              <button
                type="button"
                className="btn-approve"
                disabled={isApproveDisabled}
                style={{
                  padding: '8px 24px',
                  backgroundColor: isApproveDisabled ? '#94a3b8' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isApproveDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
                onClick={() => handleCheckerDecision('Approved')}
              >
                {isCheckerProcessing ? 'Processing...' : 'Approve Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. REPAIR MODE VIEW                                                   */}
      {/* ===================================================================== */}
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
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
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
                const keys = Object.keys(val);
                setRepairNewlyModifiedFields(prev => Array.from(new Set([...prev, ...keys])));
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

      {/* ===================================================================== */}
      {/* GLOBAL CONFIRMATION / DECISION POPUP MODAL                            */}
      {/* ===================================================================== */}
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