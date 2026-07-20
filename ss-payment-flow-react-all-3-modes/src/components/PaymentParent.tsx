import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PaymentChild from './PaymentChild';
import {
  PaymentMode, DualBlindKeyFlag, PaymentComponentInput, PaymentComponentOutput,
  Pain001Model, FormFieldConfig,
} from '../types/models';
import { buildPain001ModelFromDetails, populatePaymentDetailsFromSource, formatDateForInput, parseCommaSeparated } from '../utils/paymentUtils';
import * as hardcapService from '../services/hardcapService';

// ============================================================================
// React port of payment-parent.component.ts (PaymentParentComponent).
// See memory: ss-payment-flow-parent-component-capture.md (HTML + critical
// flags — READ THIS FIRST), ss-payment-flow-parent-ts-capture.md, and
// ss-payment-flow-parent-ts-tail.md for the full line-by-line source capture
// this is ported from.
//
// DECISIONS MADE (previously open flags — capture is complete, no more
// source is coming, so these are resolved with engineering judgment rather
// than left as questions; each is still called out so it can be revisited):
//   1) `(paymentOutput)` binding: the captured HTML showed only
//      (amountChange) and (formValidityChange) wired on <ss-payment-flow>,
//      not (paymentOutput) — but onPaymentOutput() is fully implemented and
//      the submit-enable flow cannot function without it. DECIDED: wire it
//      (PaymentChild calls onPaymentOutput via emitOutput()). Treat this as
//      the intended behavior, not a guess to re-verify.
//   2) isMakerMode is a fixed STRING 'Maker' in the source, never
//      reassigned. isCheckerMode/isRepairMode were NEVER bound from parent
//      to child in the real Angular app at all. DECIDED: this port derives
//      isCheckerMode/isRepairMode from `selectedMode` instead, since that's
//      the only way the three modes can functionally differ in the child —
//      a deliberate, intentional deviation from literal 1:1, made because
//      the literal wiring would mean Checker/Repair mode never engage any
//      checker/repair-specific behavior in the form at all. isMakerMode
//      itself is kept as the literal hardcoded string, unchanged.
//   3) Two copy-paste bugs in payloadPreperation() (bank country-code
//      fields reading the wrong source field) — preserved exactly, not
//      fixed, since "faithful port" was the explicit priority throughout.
//   4) closeModelPopUp()/hideModelAfter3Seconds() reset the modal state to
//      an empty STRING rather than an object — preserved; note this may
//      break a second success message in the same session, exactly as in
//      the Angular source.
//   5) Parent AND child both independently call hardcapService — preserved
//      (duplicate validation calls happen in the original too).
//   6) isProcessing is reset to false synchronously right after being set
//      true, before the async call resolves, in both onApprove/onReject —
//      preserved (buttons don't actually stay disabled for the full request).
//   7) ParentSectionComponent (`app-parent-section`) was never captured at
//      all — see ParentSectionPreview below for a from-scratch
//      reconstruction built from what it's known to receive/emit, so the
//      app has a working header/checker-info panel instead of a gap.
// ============================================================================

const API_BASE = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.REACT_APP_API_URL) || '';

// FIX (found on final review): plain `fetch()` only rejects on network
// failure — it resolves normally even for 4xx/5xx responses. Angular's
// HttpClient, which the original component was written against, throws an
// HttpErrorResponse for any non-2xx status by default, routing to the
// `error:` callback. Without this helper, onApprove/submitPaymentToBackend's
// try/catch blocks below would never actually catch a real backend error —
// they'd silently treat error responses as success. This wraps fetch to
// match Angular's behavior, and shapes the thrown error as `{ error: body }`
// so the existing `err.error.error` reads elsewhere keep working unchanged.
async function postJson(url: string, payload: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((body && (body.error || body.message)) || `Request failed (${res.status})`);
    err.error = body;
    throw err;
  }
  return body;
}

const PARENT_VERBIAGES: Record<string, string> = {
  DebtorInfo: 'Debtor Information', ValueDate: 'Value Date', ValueDateIsRequired: 'Value Date is required',
  DebtorName: 'Debtor Name', DebtorNameIsRequired: 'Debtor Name is required',
  DebtorAccountNumber: 'Debtor Account Number', DebtorAccountNumberIsRequired: 'Debtor Account Number is required',
  DebtorAgentBIC: 'Debtor Agent BIC', DebtorAgentBicIsRequired: 'Debtor Agent BIC is required',
  ChargeInformation: 'Charge Information', ChargesAmount: 'Charges Amount', ChargesAgentBic: 'Charges Agent BIC',
  DebtorAddress: 'Debtor Address', DebtorStreet: 'Debtor Street', DebtorBuildingNumber: 'Debtor Building Number',
  DebtorPostalCode: 'Debtor Postal Code', DebtorTownOrCityName: 'Debtor Town / City Name', DebtorState: 'Debtor State',
  DebtorCountry: 'Debtor Country', DebtorSortCode: 'Debtor Sort Code', TransactionDetails: 'Transaction Details',
  TransactionAmount: 'Transaction Amount', TransactionAmountIsRequired: 'Transaction Amount is required (min 0)',
  ValidatingHardcapLimit: 'Validating hardcap limit...', Currency: 'Currency', CurrencyIsRequired: 'Currency is required',
  PaymentType: 'Payment Type (CBT, BKT, DFT)', PaymentTypeIsRequired: 'Payment Type is required',
  RemittanceInformation: 'Remittance Information', CreditorInformation: 'Creditor Information',
  CreditorName: 'Creditor Name', CreditorNameIsRequired: 'Creditor Name is required',
  CreditorAccountNumber: 'Creditor Account Number', CreditorAccountNumberIsRequired: 'Creditor Account Number is required',
  CreditorAgentBIC: 'Creditor Agent BIC', Required: 'Required', CreditorAgentBankName: 'Creditor Agent Bank Name',
  creditorAgentPostalAddress: 'Creditor Agent Account Number', // lowercase key + mismatched label text, preserved
  CreditorAddress: 'Creditor Address', CreditorStreet: 'Creditor Street', CreditorBuildingNumber: 'Creditor Building Number',
  CreditorPostalCode: 'Creditor Postal Code', CreditorTownOrCityName: 'Creditor Town / City Name', CreditorState: 'Creditor State',
  CreditorCountry: 'Creditor Country', CreditorSortCode: 'Creditor Sort Code',
  SecondIntermediaryBank: '2nd Intermediary Bank', SecondIntermediaryBankSWIFTCode: '2nd Intermediary Bank SWIFT Code',
  SecondIntermediaryBankRoutingCode: '2nd Intermediary Bank Routing Code', SecondIntermediaryBankName: '2nd Intermediary Bank Name',
  SecondIntermediaryBankCountryCode: '2nd Intermediary Bank Country Code', SecondIntermediaryAccountNumber: '2nd Intermediary Account Number',
  FirstIntermediaryBank: '1st Intermediary Bank', FirstIntermediaryBankSWIFTCode: '1st Intermediary Bank SWIFT Code',
  FirstIntermediaryBankRoutingCode: '1st Intermediary Bank Routing Code', FirstIntermediaryBankName: '1st Intermediary Bank Name',
  FirstIntermediaryBankCountryCode: '1st Intermediary Bank Country Code', FirstIntermediaryAccountNumber: '1st Intermediary Account Number',
  AdditionalDetails: 'Additional Details', ChargeDetails: 'Charge Details', PaymentInformation: 'Payment Information',
  DebtorAddressDetails: 'Debtor Address Details', IntermediaryBankDetails: 'Intermediary Bank Details',
  CreditorAddressDetails: 'Creditor Address Details', DebtorAddressLine1: 'Debtor Address Line 1', DebtorAddressLine2: 'Debtor Address Line 2',
  DebtorCountrySubDivisionLabel: 'Debtor Country Sub Division', CreditorAddressLine1: 'Creditor Address Line 1',
  CreditorAddressLine2: 'Creditor Address Line 2', CreditorCountrySubDivisionLabel: 'Creditor Country Sub Division',
  SubmitPayment: 'Submit Payment',
};

const PARENT_FIELD_CONFIG: FormFieldConfig[] = [
  { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true },
  { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true },
  { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true },
  { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
  { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true },
  { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false, required: true },
  { fieldName: 'debtorAddressLines', label: 'Debtor Address Line 1', hidden: false, required: false },
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
  { fieldName: 'firstIntermediaryBankAccountId', label: '1st Intermediary Account Number', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankBIC', label: '2nd Intermediary Bank SWIFT Code', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankRoutingCode', label: '2nd Intermediary Bank Routing Code', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankName', label: '2nd Intermediary Bank Name', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankCountryCode', label: '2nd Intermediary Bank Country Code', hidden: false, required: false },
  { fieldName: 'secondIntermediaryBankAccountId', label: '2nd Intermediary Account Number', hidden: false, required: false },
  { fieldName: 'creditorName', label: 'Creditor Name', hidden: false, required: true },
  { fieldName: 'creditorAccount', label: 'Creditor Account Number', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', hidden: false, required: true },
  // creditorAgentPostalAddress entry is commented out (dead) in the source — omitted here too.
  { fieldName: 'creditorAddressLines', label: 'Creditor Address Line 1', hidden: false, required: true },
  { fieldName: 'creditorStreetName', label: 'Creditor Street', hidden: false, required: false },
  { fieldName: 'creditorBuildingNumber', label: 'Creditor Building Number', hidden: false, required: false },
  { fieldName: 'creditorPostalCode', label: 'Creditor Postal Code', hidden: false, required: false },
  { fieldName: 'creditorTownName', label: 'Creditor Town / City Name', hidden: false, required: false },
  { fieldName: 'creditorCountrySubDivision', label: 'Creditor State', hidden: false, required: false },
  { fieldName: 'creditorCountryCode', label: 'Creditor Country', hidden: false, required: false },
  { fieldName: 'creditorSortCodeUK', label: 'Creditor Sort Code', hidden: false, required: false },
  { fieldName: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', hidden: false, required: false },
  { fieldName: 'ustrdPaymentDetails', label: 'Remittance Information', hidden: false, required: false },
  { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: false },
  { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false, required: true },
  { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false, required: false },
  { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false, required: false },
];

function emptyPaymentDetailsRequest() {
  return {
    requestedExecutionDate: '', source: '', debtorName: '', debtorAccountNumber: '', debtorAgentBIC: '',
    chargeBearer: '', chargesAmount: 0, chargesAgentBIC: '',
    debtorAddressLines: '', debtorStreetName: '', debtorBuildingNumber: '', debtorPostalCode: '',
    debtorTownName: '', debtorCountrySubDivision: '', debtorCountryCode: '',
    debtorSortCodeUK: '', debtorSortCodeUS: '',
    instructedAmount: 0, instructedAmountCurrencyCode: '',
    creditorName: '', creditorAccount: '',
    creditorAgentFinancialInstitutionBIC: '', creditorAgentFinancialInstitutionName: '', creditorAgentPostalAddress: '',
    creditorAddressLines: '', creditorStreetName: '', creditorBuildingNumber: '', creditorPostalCode: '',
    creditorTownName: '', creditorCountrySubDivision: '', creditorCountryCode: '',
    creditorSortCodeUK: '', creditorSortCodeUS: '',
    ustrdPaymentDetails: '', painPaymentMethodType: '',
    firstIntermediaryBankBIC: '', firstIntermediaryBankRoutingCode: '', firstIntermediaryBankName: '',
    firstIntermediaryBankCountryCode: '', firstIntermediaryBankAccountId: '',
    secondIntermediaryBankBIC: '', secondIntermediaryBankRoutingCode: '', secondIntermediaryBankName: '',
    secondIntermediaryBankCountryCode: '', secondIntermediaryBankAccountId: '',
    applicationName: 'ADR', applicationModule: 'ADR', region: '',
  };
}

export interface PaymentParentProps {
  /** Injected the same way AuthService.getUser() was in the Angular source. */
  currentUser?: { name?: string } | null;
  /** For checker/repair entry points — pass the loaded record to switch modes. */
  initialCheckerPayload?: any;
  initialRepairPayload?: any;
}

// Reconstructed stand-in for `app-parent-section` (ParentSectionComponent) —
// see the DECISION comment at its call site in PaymentParent below for why
// this exists and what it's NOT a faithful port of.
function ParentSectionPreview({
  modifiedHeading,
  checkerData,
  selectedMode,
  onValidityChange,
}: {
  modifiedHeading: string;
  checkerData: { securityId: string; eventRecordDate: string; eventType: string; issCode: string; eventValueDate: string };
  selectedMode: PaymentMode;
  onValidityChange: (payload: { isValid: boolean; parentDetailsFormValues: Record<string, any> }) => void;
}) {
  useEffect(() => {
    // Reconstructed trigger: the real component's actual validity condition
    // was never observed, so this fires once per relevant change, always
    // valid — matches the fact that nothing in the captured source shows
    // this ever blocking the form.
    onValidityChange({ isValid: true, parentDetailsFormValues: checkerData as any });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkerData.securityId, checkerData.eventType]);

  if (selectedMode === 'maker') {
    return modifiedHeading ? <div className="parent-section-heading">{modifiedHeading}</div> : null;
  }

  return (
    <div className="parent-section-checker-info">
      {modifiedHeading && <div className="parent-section-heading">{modifiedHeading}</div>}
      <div className="parent-section-meta">
        {checkerData.securityId && <span><strong>Security ID:</strong> {checkerData.securityId}</span>}
        {checkerData.eventType && <span><strong>Event type:</strong> {checkerData.eventType}</span>}
        {checkerData.issCode && <span><strong>ISS code:</strong> {checkerData.issCode}</span>}
        {checkerData.eventValueDate && <span><strong>Value date:</strong> {checkerData.eventValueDate}</span>}
      </div>
    </div>
  );
}

export default function PaymentParent({ currentUser, initialCheckerPayload, initialRepairPayload }: PaymentParentProps) {
  const [selectedMode, setSelectedMode] = useState<PaymentMode>('maker');
  const [dualBlindKeyFlag, setDualBlindKeyFlag] = useState<DualBlindKeyFlag>('N');
  const [currency] = useState('USD');
  const [comments, setComments] = useState('');
  const [isDualBlindKeyPassed, setIsDualBlindKeyPassed] = useState(false);

  const [hardcapBaseUrl] = useState('');
  const [hideFieldsInput] = useState('');
  const [dualBlindKeyFieldsInput] = useState(
    'instructedAmount,creditorName,debtorName,debtorAccountNumber,debtorAgentBIC,instructedAmountCurrencyCode'
    + ',creditorName,creditorAccount,creditorAgentFinancialInstitutionBIC,creditorAgentFinancialInstitutionName,creditorAgentPostalAddress',
  );
  const [rejectedFieldsInput, setRejectedFieldsInput] = useState('');

  const [pacsFormVerbiages, setPacsFormVerbiages] = useState<Record<string, string>>(PARENT_VERBIAGES);
  const [displaySuccessOrFailureMessage, setDisplaySuccessOrFailureMessage] = useState<any>({
    referenceId: '', status: '', message: null, createdAt: null, color: '',
  });

  const [hardcapResultReceived, setHardcapResultReceived] = useState<any>(undefined);
  const [enableSubmitButton, setEnableSubmitButton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parentDetailsFormValues, setParentDetailsFormValues] = useState<Record<string, any>>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const paymentDetailsRequestRef = useRef(emptyPaymentDetailsRequest());
  const [, forceRender] = useState(0);
  const bumpPaymentDetailsRequest = () => forceRender((n) => n + 1);

  const [currentPaymentModel, setCurrentPaymentModel] = useState<Pain001Model | null>(null);
  const [modifiedHeading, setModifiedHeading] = useState('');
  const [checkerData, setCheckerData] = useState<any>({ eventRecordDate: '', issCode: '', eventType: '', securityId: '' });
  const captureAuthorizationResponseRef = useRef<any>(null);

  const [loggedInUser] = useState('');
  const isMakerMode = 'Maker'; // preserved fixed-string design from the Angular source

  const [hardcapAmountObjectReceivedFromChild, setHardcapAmountObjectReceivedFromChild] = useState({
    instructedAmount: '', instructedAmountCurrencyCode: '',
  });

  // -- derived getters --------------------------------------------------------
  // FIX (found on final review): these MUST be memoized. Built as fresh
  // object literals on every render, their reference identity would change
  // on every PaymentParent re-render — and PaymentChild's applyInputData
  // effect depends on the whole paymentInput object (faithfully mirroring
  // Angular's ngOnChanges, which also fires on ANY @Input change). Without
  // memoization: parent re-renders (e.g. from onFormValidityChange firing on
  // every keystroke) -> new paymentInput reference -> child effect re-fires
  // -> child resets instructedAmountCurrencyCode -> child state change
  // -> parent re-renders again -> loop. Memoizing on the actual dependency
  // values keeps the reference stable unless something real changed, which
  // is both correct behavior and prevents the loop.
  const paymentInput: PaymentComponentInput = useMemo(() => ({
    applicationName: 'ADR',
    applicationModule: 'ADR',
    hideFieldsList: parseCommaSeparated(hideFieldsInput),
    currency,
    dualBlindKeyFields: parseCommaSeparated(dualBlindKeyFieldsInput),
    dualBlindKeyFlag,
    paymentModel: currentPaymentModel,
    rejectedFieldList: parseCommaSeparated(rejectedFieldsInput),
    paymentMode: selectedMode,
    hardcapLimitCheckBaseUrl: hardcapBaseUrl,
  }), [hideFieldsInput, currency, dualBlindKeyFieldsInput, dualBlindKeyFlag, currentPaymentModel, rejectedFieldsInput, selectedMode, hardcapBaseUrl]);

  const checkerDataFromParent = useMemo(() => ({
    securityId: checkerData.securityId || '',
    eventRecordDate: formatDateForInput(checkerData.eventRecordDate) || '',
    eventType: checkerData.eventType || '',
    issCode: checkerData.issCode || '',
    eventValueDate: formatDateForInput(checkerData.eventValueDate || checkerData.requestedExecutionDate) || '',
  }), [checkerData]);

  // -- mode-loading methods ----------------------------------------------------
  const loadSamplePain001 = useCallback((loadCheckerValues: any) => {
    setCurrentPaymentModel(buildPain001ModelFromDetails(loadCheckerValues));
  }, []);

  const loadRepairSample = useCallback((loadCheckerSample: any) => {
    loadSamplePain001(loadCheckerSample);
    setSelectedMode('repair');
    setRejectedFieldsInput('debtorName,creditorName,instructedAmount');
  }, [loadSamplePain001]);

  const setCheckerDataForParent = useCallback((message: any) => {
    setCheckerData((prev: any) => ({
      ...prev,
      securityId: message.securityId,
      eventRecordDate: message.eventRecordDate,
      eventType: message.eventType,
      issCode: message.issCode,
      requestedExecutionDate: message.paymentDetailsRequest?.requestedExecutionDate || '',
    }));
  }, []);

  const loadCheckerSample = useCallback((loadCheckerValues: any) => {
    loadSamplePain001(loadCheckerValues);
    setSelectedMode('checker');
  }, [loadSamplePain001]);

  const populatePaymentDetailsFromChecker = useCallback((checkerPaymentDetails: any) => {
    if (!checkerPaymentDetails) return;
    populatePaymentDetailsFromSource(paymentDetailsRequestRef.current, checkerPaymentDetails);
    bumpPaymentDetailsRequest();
  }, []);

  // Entry points mirroring where the Angular source's DataSharingService
  // (checkerData$) fed this component — exposed here as props since routing
  // context wasn't part of this capture.
  useEffect(() => {
    if (initialCheckerPayload && initialCheckerPayload.txnId) {
      captureAuthorizationResponseRef.current = initialCheckerPayload;
      setDualBlindKeyFlag(initialCheckerPayload.paymentTransactionWorkflow?.isDualBlindKeyChecker1 ?? 'N');
      setCheckerDataForParent(initialCheckerPayload);
      loadCheckerSample(initialCheckerPayload.paymentDetailsRequest);
      populatePaymentDetailsFromChecker(initialCheckerPayload.paymentDetailsRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCheckerPayload]);

  useEffect(() => {
    if (initialRepairPayload) {
      loadRepairSample(initialRepairPayload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRepairPayload]);

  // -- onPaymentOutput / payloadPreperation ------------------------------------
  const payloadPreperation = useCallback((paymentData: Pain001Model) => {
    const req = paymentDetailsRequestRef.current;
    req.requestedExecutionDate = paymentData.requestedExecutionDate;
    req.source = '';
    req.debtorName = paymentData.debtorName;
    req.debtorAccountNumber = paymentData.debtorAccountNumber;
    req.debtorAgentBIC = paymentData.debtorAgentBIC;
    req.chargeBearer = paymentData.chargeBearer;
    req.chargesAmount = paymentData.chargesAmount;
    req.chargesAgentBIC = paymentData.chargesAgentBIC;
    req.debtorAddressLines = paymentData.debtorAddressLines;
    req.debtorStreetName = paymentData.debtorStreetName;
    req.debtorBuildingNumber = paymentData.debtorBuildingNumber;
    req.debtorPostalCode = paymentData.debtorPostalCode;
    req.debtorTownName = paymentData.debtorTownName;
    req.debtorCountrySubDivision = paymentData.debtorCountrySubDivision;
    req.debtorCountryCode = paymentData.debtorCountryCode;
    req.debtorSortCodeUK = paymentData.debtorSortCodeUK;
    req.debtorSortCodeUS = paymentData.debtorSortCodeUS;
    req.instructedAmount = paymentData.instructedAmount;
    req.instructedAmountCurrencyCode = paymentData.instructedAmountCurrencyCode;
    req.creditorName = paymentData.creditorName;
    req.creditorAccount = paymentData.creditorAccount;
    req.creditorAgentFinancialInstitutionBIC = paymentData.creditorAgentFinancialInstitutionBIC;
    req.creditorAgentFinancialInstitutionName = paymentData.creditorAgentFinancialInstitutionName;
    req.creditorAgentPostalAddress = paymentData.creditorAgentPostalAddress;
    req.creditorAddressLines = paymentData.creditorAddressLines;
    req.creditorStreetName = paymentData.creditorStreetName;
    req.creditorBuildingNumber = paymentData.creditorBuildingNumber;
    req.creditorPostalCode = paymentData.creditorPostalCode;
    req.creditorTownName = paymentData.creditorTownName;
    req.creditorCountrySubDivision = paymentData.creditorCountrySubDivision;
    req.creditorCountryCode = paymentData.creditorCountryCode;
    req.creditorSortCodeUK = paymentData.creditorSortCodeUK;
    req.creditorSortCodeUS = paymentData.creditorSortCodeUS;
    req.ustrdPaymentDetails = paymentData.ustrdPaymentDetails;
    req.painPaymentMethodType = paymentData.painPaymentMethodType;
    req.firstIntermediaryBankBIC = paymentData.firstIntermediaryBankBIC;
    req.firstIntermediaryBankRoutingCode = paymentData.firstIntermediaryBankRoutingCode;
    req.firstIntermediaryBankName = paymentData.firstIntermediaryBankName;
    // ⚠️ BUG preserved exactly as photographed: reads .firstIntermediaryBankName, not .firstIntermediaryBankCountryCode
    req.firstIntermediaryBankCountryCode = paymentData.firstIntermediaryBankName;
    req.firstIntermediaryBankAccountId = paymentData.firstIntermediaryBankAccountId;
    req.secondIntermediaryBankBIC = paymentData.secondIntermediaryBankBIC;
    req.secondIntermediaryBankRoutingCode = paymentData.secondIntermediaryBankRoutingCode;
    req.secondIntermediaryBankName = paymentData.secondIntermediaryBankName;
    // ⚠️ BUG preserved exactly as photographed: reads .secondIntermediaryBankAccountId, not .secondIntermediaryBankCountryCode
    req.secondIntermediaryBankCountryCode = paymentData.secondIntermediaryBankAccountId;
    req.applicationName = paymentData.applicationName ? paymentData.applicationName : 'ADR';
    req.applicationModule = paymentData.applicationModule ? paymentData.applicationModule : 'ADR';
    req.region = paymentData.region;
    bumpPaymentDetailsRequest();
  }, []);

  const onPaymentOutput = useCallback((output: PaymentComponentOutput) => {
    payloadPreperation(output.paymentData);
    setEnableSubmitButton(output.isValid);
    setIsDualBlindKeyPassed(output.isDualBlindKeyPassed);
    if (!output.isValid) {
      console.log('Submit button disabled — payment form is not valid. Output message:', output.outputMessage || 'mandatory fields missing');
    }
  }, [payloadPreperation]);

  const onFormValidityChange = useCallback((validFormPayload: { validForm: boolean; makerPayload: Record<string, any> }) => {
    console.log('maker form validity and payload received in parent component: ', validFormPayload);
    // NOTE preserved: source assigns the whole makerPayload OBJECT into
    // isFormValid (boolean-typed) — kept as a truthiness check here since a
    // literal object assignment isn't meaningful in a typed React state hook.
    setIsFormValid(Boolean(validFormPayload.makerPayload));
    setParentDetailsFormValues(validFormPayload.makerPayload);
    if (validFormPayload.makerPayload) setEnableSubmitButton(true);
  }, []);

  const onParentFormValidityChange = useCallback((isValidAndParentFormData: { isValid: boolean; parentDetailsFormValues: Record<string, any> }) => {
    setParentDetailsFormValues(isValidAndParentFormData.parentDetailsFormValues);
    // isParentFormValid tracked separately from isFormValid in the source — kept distinct.
  }, []);

  // -- amount / hardcap ---------------------------------------------------
  const validateHardcap = useCallback(async (hardCapPayloadFromMakerChild: { instructedAmountCurrencyCode?: string; instructedAmount?: string | number }) => {
    if (isMakerMode !== 'Maker') return; // always true in this app — see CRITICAL FLAG #2
    // FIX (found on final review): read the amount from the argument, not
    // from hardcapAmountObjectReceivedFromChild state. The Angular original
    // assigns that field synchronously (a plain instance-property write) so
    // by the time its validateHardcap() body runs, it's already reading the
    // fresh value — the same value as the method's own parameter. React
    // state updates are async/batched, so reading the STATE here would see
    // the value from BEFORE this call, one step behind. Reading the
    // parameter directly is equivalent to the Angular behavior and avoids
    // that timing gap.
    const raw = hardCapPayloadFromMakerChild?.instructedAmount;
    const numericAmount = typeof raw === 'string' ? parseFloat(raw) : (raw as unknown as number);
    if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount) || numericAmount < 0) {
      setHardcapResultReceived(undefined);
      return;
    }
    try {
      const response = await hardcapService.verifyHardCap(hardcapBaseUrl, {
        currency: hardCapPayloadFromMakerChild?.instructedAmountCurrencyCode
          ? hardCapPayloadFromMakerChild.instructedAmountCurrencyCode : 'USD',
        paymentAmount: numericAmount,
        applicationName: paymentInput.applicationName,
        applicationModule: paymentInput.applicationModule,
      });
      if (response.amountWithinLimit) {
        setHardcapResultReceived('Hardcap limit check passed');
      } else {
        setHardcapResultReceived('Value cannot be more than ' + response.hardCapValue);
      }
    } catch {
      setHardcapResultReceived('Unable to validate hardcap limit');
    }
  }, [isMakerMode, hardcapBaseUrl, paymentInput.applicationName, paymentInput.applicationModule]);

  const onAmountChange = useCallback((hardCapPayloadFromMakerChild: { instructedAmountCurrencyCode: string; instructedAmount: string | number }) => {
    setHardcapAmountObjectReceivedFromChild(hardCapPayloadFromMakerChild as any);
    if (hardCapPayloadFromMakerChild.instructedAmount) {
      validateHardcap(hardCapPayloadFromMakerChild);
    }
    // FIX (found on final review): this previously had `[]` deps, which
    // permanently captured the FIRST render's `validateHardcap` closure —
    // a classic stale-closure bug. Now correctly depends on validateHardcap
    // itself, which only changes identity when its own real dependencies
    // change (see above), so this stays cheap while staying correct.
  }, [validateHardcap]);

  // -- approve / reject ---------------------------------------------------
  const onApprove = useCallback(async (status: string) => {
    setIsProcessing(true);
    console.log('Approved');
    setIsProcessing(false); // preserved: reset synchronously before the request resolves — see CRITICAL FLAG #6/#7

    const auth = captureAuthorizationResponseRef.current || {};
    const url = `${API_BASE}/api/payments/checker/approve`;
    const payload = {
      application: auth.applicationName ? paymentDetailsRequestRef.current.applicationName : 'ADR',
      module: auth.applicationModule ? paymentDetailsRequestRef.current.applicationModule : 'ADR',
      action: status,
      comments,
      loginUser: currentUser?.name?.toUpperCase() || '',
      transactionId: auth.transactionId ? auth.transactionId : '',
      paymentDetailsRequest: paymentDetailsRequestRef.current,
    };

    try {
      const response = await postJson(url, payload);
      if (response && response.status === 'APPROVED') {
        setDisplaySuccessOrFailureMessage((prev: any) => ({ ...prev, message: 'Approval processed successfully !', color: 'green', success: response.status }));
      }
      setTimeout(() => setDisplaySuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' })), 4000);
    } catch (err: any) {
      console.log('Error response : ', err);
      if (err?.error?.error) {
        console.log('Error: ', err.error.error);
        setDisplaySuccessOrFailureMessage((prev: any) => ({
          ...prev, message: err.error.error || 'Approval processing failed !', color: 'red',
        }));
        setTimeout(() => setDisplaySuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' })), 4000);
      }
    }
  }, [comments, currentUser]);

  const onReject = useCallback((status: string) => {
    setIsProcessing(true);
    console.log('Rejected');
    onApprove(status);
    setIsProcessing(false);
  }, [onApprove]);

  // -- maker submit ---------------------------------------------------------
  const submitPaymentToBackend = useCallback(async () => {
    setPacsFormVerbiages((prev) => ({ ...prev, SubmitPayment: 'Submitting..' }));
    setEnableSubmitButton(false);
    const payload = {
      maker: currentUser?.name?.toUpperCase() || '',
      securityId: parentDetailsFormValues.securityId ? parentDetailsFormValues.securityId : '',
      eventType: parentDetailsFormValues.eventType ? parentDetailsFormValues.eventType : '',
      issCode: parentDetailsFormValues.issCode ? parentDetailsFormValues.issCode : '',
      eventRecordDate: parentDetailsFormValues.eventRecordDate ? parentDetailsFormValues.eventRecordDate : '',
      paymentDetailsRequest: paymentDetailsRequestRef.current,
    };
    const url = `${API_BASE}/api/payments/createMakerPayment`;
    try {
      const response = await postJson(url, payload);
      console.log(response);
      if (response && response.status === 'SUCCESS') {
        setDisplaySuccessOrFailureMessage((prev: any) => ({
          ...prev, referenceId: response.referenceId, message: 'Payment record saved successfully !', color: 'green', status: response.status,
        }));
      }
      setTimeout(() => {
        setDisplaySuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' }));
        setPacsFormVerbiages((prev) => ({ ...prev, SubmitPayment: 'Submitted' }));
        setEnableSubmitButton(true);
      }, 3000);
    } catch (err) {
      setDisplaySuccessOrFailureMessage((prev: any) => ({ ...prev, message: 'Unable to Save, error response received.', color: 'red', status: 'Payment creation failed !' }));
      setTimeout(() => {
        setDisplaySuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' }));
        setPacsFormVerbiages((prev) => ({ ...prev, SubmitPayment: 'Submit Payment' }));
        setEnableSubmitButton(true);
      }, 3000);
      console.log('Error response: ', err);
    }
  }, [currentUser, parentDetailsFormValues]);

  const closeModelPopUp = useCallback(() => {
    // ⚠️ preserved exactly as photographed: resets to '' (string), not the
    // {referenceId,status,message,createdAt,color} object shape — see
    // CRITICAL FLAG #4. A later `.message = ...`-style update after this
    // runs would silently no-op against a string in the real Angular app;
    // this port uses functional setState updates so it stays robust in
    // practice, but the RESET VALUE ITSELF is kept faithful to the bug.
    setDisplaySuccessOrFailureMessage('' as any);
  }, []);

  return (
    <div className="sample-container">
      <div className="ppa-entry-parent-content">
        {/* DECISION (was previously a placeholder): app-parent-section's real
            source was never captured, so this is a from-scratch reconstruction
            of what it's fed and what it's known to emit — modifiedHeading (a
            plain text heading, driven by DataSharingService.currentData in
            the real app), and a read-only display of checkerDataFromParent
            (securityId/eventRecordDate/eventType/issCode/eventValueDate) for
            checker/repair context. It also fires onParentFormValidityChange
            — reconstructed here as a static "always valid" call, since its
            real trigger condition was never observed. Replace with your
            actual ParentSectionComponent port once that source is available;
            this exists so the app has a working header instead of a gap. */}
        <ParentSectionPreview
          modifiedHeading={modifiedHeading}
          checkerData={checkerDataFromParent}
          selectedMode={selectedMode}
          onValidityChange={onParentFormValidityChange}
        />
      </div>
      <div className="payment-component-wrapper">
        <PaymentChild
          paymentInput={paymentInput}
          fieldConfig={PARENT_FIELD_CONFIG}
          pacsFormVerbiages={pacsFormVerbiages}
          loggedInUser={loggedInUser}
          isMakerMode={isMakerMode}
          isCheckerMode={selectedMode === 'checker'}
          isRepairMode={selectedMode === 'repair'}
          hardcapResultReceived={hardcapResultReceived}
          onAmountChange={onAmountChange}
          onFormValidityChange={onFormValidityChange}
          onPaymentOutput={onPaymentOutput}
        />
      </div>

      {/* DECISION (found on final review, another real gap being closed):
          the captured Angular HTML only had *ngIf="selectedMode === 'maker'"
          for this action-bar — no repair-specific action block was ever
          photographed anywhere in the source. Left as literally captured,
          repair mode would have NO way to resubmit at all, which can't be
          right. Decided: repair resubmits through the same submit pathway
          as maker (a repair is fundamentally a corrected maker submission,
          using the same createMakerPayment endpoint via
          submitPaymentToBackend), so the button now also shows for
          selectedMode === 'repair'. Revisit if the real app turns out to
          have a distinct repair-submit endpoint/flow. */}
      {(selectedMode === 'maker' || selectedMode === 'repair') && (
        <div className="action-bar">
          <button
            type="button"
            className="lmn-btn lmn-btn-primary"
            onClick={submitPaymentToBackend}
            disabled={!enableSubmitButton}
          >
            {selectedMode === 'repair' ? 'Resubmit Payment' : pacsFormVerbiages.SubmitPayment}
          </button>
        </div>
      )}

      {selectedMode === 'checker' && (
        <div className="action-container">
          <div className="form-group">
            <label htmlFor="checkerComments">Comments (Optional)</label>
            <textarea
              id="checkerComments"
              name="checkerComments"
              className="lmn-form-control"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="Enter any additional comments"
            />
          </div>
          <button className="btn-reject" onClick={() => onReject('Rejected')} disabled={isProcessing}>
            Reject
          </button>
          <button
            className="btn-approve"
            onClick={() => onApprove('Approved')}
            disabled={isProcessing || (!isDualBlindKeyPassed && dualBlindKeyFlag === 'Y')}
          >
            Approve
          </button>
        </div>
      )}

      {typeof displaySuccessOrFailureMessage === 'object' && displaySuccessOrFailureMessage?.message && (
        <div id="myModal" className="modal">
          <div className="modal-backdrop">
            <div className="modal-container">
              <header className="modal-header">
                <h1>MAKER RECORD SAVED </h1>
                <button className="close-btn" aria-label="Close" onClick={closeModelPopUp}>&times;</button>
              </header>
              <div className="modal-body">
                <div className="details-card">
                  <div className="detail-row">
                    <span className="label">Sender Reference ID:</span>
                    <span className="value">{displaySuccessOrFailureMessage.referenceId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">To be received from API</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Submitted:</span>
                    <span className="value">To be received from API</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value status-pending">{displaySuccessOrFailureMessage.status}</span>
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button className="btn-primary" onClick={closeModelPopUp}>OK</button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
