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
  const authContext = useAuth();
  const soeId = typeof authContext === 'object' && authContext !== null
    ? ((authContext as any).soeId || (authContext as any).user?.soeId || (authContext as any).userId || 'CURRENT_USER')
    : String(authContext || 'CURRENT_USER');

  // =========================================================================
  // 1. MAKER MODE CONTAINER STATE (ACTIVE)
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
      setMakerHardcapResult('Unable to validate hardcap limit');
    }
  }, []);

  const handleMakerOutput = useCallback((output: PaymentComponentOutput) => {
    setMakerFormValid(output.isValid);
    setMakerPayload(output.paymentData);
  }, []);

  const handleMakerSubmit = async () => {
    if (!makerPayload || !makerFormValid) return;
    setIsMakerSubmitting(true);
    setTimeout(() => {
      alert(`[Maker Mode] Payment successfully submitted by ${soeId}!\nPayload:\n${JSON.stringify(makerPayload, null, 2)}`);
      setIsMakerSubmitting(false);
    }, 800);
  };

  /*
  // =========================================================================
  // 2. CHECKER MODE CONTAINER STATE (UNCOMMENT TO TEST CHECKER)
  // =========================================================================
  const [checkerFormValid, setCheckerFormValid] = useState<boolean>(false);
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
    creditorName: 'Starlight Solutions Inc',
    creditorAccount: 'CRED-112233445',
    creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
    creditorAgentFinancialInstitutionName: 'Citibank N.A. New York',
    creditorAddressLines1: '388 Greenwich Street',
    creditorCountryCode: 'US',
    chargeBearer: 'DEBT',
    painPaymentMethodType: 'CBT'
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
  }, []);

  const handleCheckerDecision = async (action: 'Approved' | 'Rejected') => {
    setIsCheckerProcessing(true);
    setTimeout(() => {
      alert(`[Checker Mode] Decision '${action}' recorded by ${soeId}.\nFlagged Fields: ${JSON.stringify(checkerFailedFields)}\nComments: ${checkerComments}`);
      setIsCheckerProcessing(false);
    }, 600);
  };
  */

  /*
  // =========================================================================
  // 3. REPAIR MODE CONTAINER STATE (UNCOMMENT TO TEST REPAIR)
  // =========================================================================
  const [repairFormValid, setRepairFormValid] = useState<boolean>(false);
  const [repairPayload, setRepairPayload] = useState<Pain001Model | null>(null);
  const [isRepairSubmitting, setIsRepairSubmitting] = useState<boolean>(false);

  const sampleRepairData: Pain001Model = useMemo(() => ({
    ...createEmptyPain001(),
    requestedExecutionDate: '2026-08-25',
    instructedAmountCurrencyCode: 'USD',
    instructedAmount: 12000,
    debtorName: 'Pacific Rim Trade Corp',
    debtorAccountNumber: 'DEBT-554433221',
    debtorAgentBIC: 'BOFAUS3NXXX',
    debtorCountryCode: 'US',
    creditorName: 'Nexus Tech International',
    creditorAccount: 'CRED-998877665',
    creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
    creditorAgentFinancialInstitutionName: 'Citibank N.A.',
    creditorAddressLines1: '100 Wall Street',
    creditorCountryCode: 'US',
    chargeBearer: 'SHAR',
    painPaymentMethodType: 'DFT'
  }), []);

  const repairPaymentInput: PaymentComponentInput = useMemo(() => ({
    applicationName: 'ADR',
    applicationModule: 'ADR',
    paymentMode: 'repair',
    dualBlindKeyFlag: 'N',
    rejectedFieldList: ['debtorName', 'creditorName', 'instructedAmount'],
    paymentModel: sampleRepairData
  }), [sampleRepairData]);

  const handleRepairOutput = useCallback((output: PaymentComponentOutput) => {
    setRepairFormValid(output.isValid);
    setRepairPayload(output.paymentData);
  }, []);

  const handleRepairResubmit = async () => {
    if (!repairPayload || !repairFormValid) return;
    setIsRepairSubmitting(true);
    setTimeout(() => {
      alert(`[Repair Mode] Repaired payment resubmitted by ${soeId}!\nPayload:\n${JSON.stringify(repairPayload, null, 2)}`);
      setIsRepairSubmitting(false);
    }, 800);
  };
  */

  return (
    <div className="sample-container">
      {/* --------------------------------------------------------------------- */}
      {/* 1. MAKER MODE VIEW (ACTIVE BY DEFAULT)                                */}
      {/* --------------------------------------------------------------------- */}
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
          onClick={handleMakerSubmit}
        >
          {isMakerSubmitting ? 'Submitting...' : 'Submit Payment'}
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. CHECKER MODE VIEW (UNCOMMENT TO TEST)                              */}
      {/* --------------------------------------------------------------------- */}
      {/*
      <div style={{ marginTop: '40px', borderTop: '2px dashed #94a3b8', paddingTop: '20px' }}>
        <div className="parent-section-heading">Authorization Queue (Checker Mode)</div>
        <div className="parent-section-checker-info">
          <div className="parent-section-meta">
            <span><strong>Security ID:</strong> SEC-889021</span>
            <span><strong>Event Type:</strong> OUTBOUND_TRANSFER</span>
            <span><strong>ISS Code:</strong> ISS-NYC</span>
            <span><strong>Value Date:</strong> 2026-08-20</span>
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
        <div className="action-container">
          <div className="form-group">
            <label htmlFor="checkerComments">Checker Review Comments</label>
            <textarea
              id="checkerComments"
              rows={3}
              value={checkerComments}
              placeholder="Enter rejection notes or authorization comments"
              onChange={e => setCheckerComments(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-reject"
            disabled={isCheckerProcessing}
            onClick={() => handleCheckerDecision('Rejected')}
          >
            Reject {checkerFailedFields.length > 0 ? `(${checkerFailedFields.length} Flagged)` : ''}
          </button>
          <button
            type="button"
            className="btn-approve"
            disabled={isCheckerProcessing || !checkerFormValid || checkerFailedFields.length > 0}
            onClick={() => handleCheckerDecision('Approved')}
          >
            Approve
          </button>
        </div>
      </div>
      */}

      {/* --------------------------------------------------------------------- */}
      {/* 3. REPAIR MODE VIEW (UNCOMMENT TO TEST)                               */}
      {/* --------------------------------------------------------------------- */}
      {/*
      <div style={{ marginTop: '40px', borderTop: '2px dashed #f59e0b', paddingTop: '20px' }}>
        <div className="parent-section-heading">Payment Correction Queue (Repair Mode)</div>
        <div className="parent-section-checker-info" style={{ borderColor: '#f59e0b', background: '#fffbeb' }}>
          <strong>Checker Rejection Reason:</strong> Debtor Name and Creditor Account mismatch verified bank records. Please modify and resubmit.
        </div>
        <div className="payment-component-wrapper">
          <PaymentChild
            paymentInput={repairPaymentInput}
            fieldConfig={PARENT_FIELD_CONFIG}
            isRepairMode={true}
            repairReviewFieldList={['debtorName', 'creditorName', 'instructedAmount']}
            onPaymentOutput={handleRepairOutput}
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
      */}
    </div>
  );
};

export default PaymentParent;