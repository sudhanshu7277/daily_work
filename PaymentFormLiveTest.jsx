import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// ============================================================================
// LIVE RUNTIME TEST — this is the REAL PaymentChild/PaymentParent logic
// (state machine, effects, validation, hardcap debounce, dual-blind-key
// matching, mode switching, submit/approve/reject flows), translated from
// the shipped .tsx to plain JS so it can run directly in this artifact.
// Only the network layer (hardcapService, addressService, backend POSTs) is
// mocked with simulated delays — everything else is the real behavior.
// Test buttons at the top let you drive maker -> checker -> repair without
// needing a real backend. Open the browser console to see the same
// console.log/warn lines the real components emit.
// ============================================================================

// ---- mocked network layer --------------------------------------------------
function mockVerifyHardCap(request) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ amountWithinLimit: request.paymentAmount <= 1000000, hardCapValue: 1000000 });
    }, 400);
  });
}
function mockLookupAddress() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        addressLine: ['500 Market Street', 'Suite 300'],
        streetName: 'Market Street', buildingNumber: '500', postalCode: '94105',
        townName: 'San Francisco', countrySubDivision: 'CA', state: 'CA', countryCode: 'US',
      });
    }, 350);
  });
}
let simulateBackendError = false;
function mockPostJson(url, payload) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('[MOCK POST]', url, payload);
      if (simulateBackendError) {
        const err = new Error('simulated failure');
        err.error = { error: 'Simulated backend rejection for this test' };
        reject(err);
      } else if (url.includes('createMakerPayment')) {
        resolve({ referenceId: 'REF-' + Math.floor(Math.random() * 900000 + 100000), status: 'SUCCESS', message: 'ok' });
      } else {
        resolve({ status: payload.action === 'Rejected' ? 'REJECTED' : 'APPROVED', message: 'ok' });
      }
    }, 500);
  });
}

// ---- field config (same as PARENT_FIELD_CONFIG in the real code) ----------
const FIELD_CONFIG = [
  { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true },
  { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true },
  { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true },
  { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
  { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true },
  { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false, required: true },
  { fieldName: 'debtorAddressLines1', label: 'Debtor Address Line 1', hidden: false, required: false },
  { fieldName: 'debtorStreetName', label: 'Debtor Street', hidden: false, required: false },
  { fieldName: 'debtorCountryCode', label: 'Debtor Country', hidden: false, required: false },
  { fieldName: 'creditorName', label: 'Creditor Name', hidden: false, required: true },
  { fieldName: 'creditorAccount', label: 'Creditor Account Number', hidden: false, required: true },
  { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', hidden: false, required: true },
  { fieldName: 'firstIntermediaryBankBIC', label: '1st Intermediary Bank SWIFT Code', hidden: false, required: false },
  { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false, required: true },
];
const MANDATORY = FIELD_CONFIG.filter(f => f.required).map(f => f.fieldName);
const DUAL_BLIND_FIELDS = ['instructedAmount', 'creditorName', 'debtorName', 'debtorAccountNumber', 'debtorAgentBIC', 'instructedAmountCurrencyCode', 'creditorAccount', 'creditorAgentFinancialInstitutionBIC'];

function parseCommaSeparated(input) {
  if (!input || !input.trim()) return [];
  return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// ---- PaymentChild (real logic, JS translation) -----------------------------
function PaymentChild({ paymentInput, isCheckerMode, isRepairMode, hardcapResultReceived, onAmountChange, onFormValidityChange, onPaymentOutput, log }) {
  const buildInitial = useCallback(() => {
    const init = paymentInput.paymentModel || {};
    const values = {};
    FIELD_CONFIG.forEach((cfg) => { values[cfg.fieldName] = String(init[cfg.fieldName] ?? ''); });
    return values;
  }, []);
  const [formValues, setFormValues] = useState(buildInitial);
  const [touched, setTouched] = useState({});
  const [hardcapChecking, setHardcapChecking] = useState(false);
  const [hardcapError, setHardcapError] = useState('');
  const [hardcapSuccessMessage, setHardcapSuccessMessage] = useState('');
  const [hardcapResponse, setHardcapResponse] = useState(null);
  const [dualBlindKeyResult, setDualBlindKeyResult] = useState(null);
  const [isDualBlindKeyPassed, setIsDualBlindKeyPassed] = useState(false);
  const dualBlindOriginals = useRef(new Map());
  const [dualBlindErrors, setDualBlindErrors] = useState(new Map());
  const initializedRef = useRef(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState({
    paymentDetails: false, paymentInformation: false, debtorInformation: false, debtorAddress: false,
    beneficiaryDetails: false, creditorInformation: false, intermediaryBank: false, additionalInformation: false,
  });
  const toggleSection = useCallback((section) => {
    setSectionCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const isDualBlindKeyEnabled = paymentInput.dualBlindKeyFlag === 'Y';

  const setField = useCallback((name, value) => setFormValues((prev) => ({ ...prev, [name]: value })), []);

  const isFieldReadonly = useCallback((fieldName) => {
    if (!isCheckerMode) return false;
    if (isDualBlindKeyEnabled && (paymentInput.dualBlindKeyFields || []).includes(fieldName)) return false;
    return true;
  }, [isCheckerMode, isDualBlindKeyEnabled, paymentInput.dualBlindKeyFields]);

  const emitOutput = useCallback(() => {
    const mandatoryOk = MANDATORY.every((f) => formValues[f]);
    let isValid = mandatoryOk;
    let outputMessage = '';
    if (isCheckerMode && isDualBlindKeyEnabled) {
      if (dualBlindKeyResult === 'failed') { isValid = false; outputMessage = 'dualBlindKey=failed'; }
      else if (dualBlindKeyResult === 'passed') { outputMessage = 'dualBlindKey=passed'; }
    }
    if (paymentInput.paymentMode === 'maker' && hardcapResponse && hardcapResponse.amountWithinLimit === false) {
      isValid = false; outputMessage = 'hardcapLimitExceeded';
    }
    if (!isValid && !outputMessage) outputMessage = 'mandatory fields missing';
    onPaymentOutput?.({ paymentData: formValues, isValid, outputMessage, dualBlindKeyResult, isDualBlindKeyPassed });
    onFormValidityChange?.({ validForm: isValid, makerPayload: formValues });
  }, [formValues, isCheckerMode, isDualBlindKeyEnabled, dualBlindKeyResult, paymentInput.paymentMode, hardcapResponse, isDualBlindKeyPassed, onPaymentOutput, onFormValidityChange]);

  useEffect(() => { emitOutput(); }, [formValues]); // eslint-disable-line

  // hardcap validation, 500ms debounce
  const hcTimer = useRef();
  useEffect(() => {
    if (hcTimer.current) clearTimeout(hcTimer.current);
    hcTimer.current = setTimeout(async () => {
      const amount = parseFloat(formValues.instructedAmount);
      if (isNaN(amount) || amount < 0) { setHardcapError(''); setHardcapSuccessMessage(''); return; }
      const currency = (formValues.instructedAmountCurrencyCode || paymentInput.currency || '').toUpperCase();
      if (!currency) return;
      setHardcapChecking(true);
      log(`[child] validating hardcap for ${amount} ${currency}...`);
      const response = await mockVerifyHardCap({ paymentAmount: amount });
      setHardcapChecking(false);
      setHardcapResponse(response);
      if (response.amountWithinLimit) { setHardcapSuccessMessage('Hardcap limit check passed'); setHardcapError(''); log('[child] hardcap PASSED'); }
      else { setHardcapError('Value cannot be more than ' + response.hardCapValue); setHardcapSuccessMessage(''); log('[child] hardcap FAILED — over limit'); }
    }, 500);
    return () => clearTimeout(hcTimer.current);
  }, [formValues.instructedAmount, formValues.instructedAmountCurrencyCode]); // eslint-disable-line

  // instructedAmountChange -> onAmountChange (object payload, the real live path)
  const instructedAmountChange = useCallback(() => {
    onAmountChange?.({ instructedAmountCurrencyCode: (formValues.instructedAmountCurrencyCode || '').toUpperCase(), instructedAmount: formValues.instructedAmount });
  }, [formValues.instructedAmount, formValues.instructedAmountCurrencyCode, onAmountChange]);

  // debtor address auto-lookup, 300ms debounce (mocked)
  const addrTimer = useRef();
  useEffect(() => {
    if (addrTimer.current) clearTimeout(addrTimer.current);
    if (!formValues.debtorAccountNumber || !/^[A-Z]{2}$/.test(formValues.debtorCountryCode || '')) return;
    addrTimer.current = setTimeout(async () => {
      setAddressLoading(true);
      log('[child] looking up debtor address...');
      const res = await mockLookupAddress();
      setAddressLoading(false);
      setFormValues((prev) => ({ ...prev, debtorAddressLines1: res.addressLine[0], debtorStreetName: res.streetName }));
      log('[child] debtor address auto-filled');
    }, 300);
    return () => clearTimeout(addrTimer.current);
  }, [formValues.debtorAccountNumber, formValues.debtorCountryCode]); // eslint-disable-line

  // dual blind key match check
  const doAllMatch = useCallback((trackErrors) => {
    const errors = new Map(dualBlindErrors);
    const allMatch = (paymentInput.dualBlindKeyFields || []).every((field) => {
      const original = dualBlindOriginals.current.get(field) ?? '';
      const entered = String(formValues[field] ?? '').trim();
      const matches = original === entered;
      if (!matches && trackErrors) errors.set(field, 'Data does not match');
      return matches;
    });
    if (trackErrors) setDualBlindErrors(errors);
    return allMatch;
  }, [formValues, dualBlindErrors, paymentInput.dualBlindKeyFields]);

  const validateSingleDualBlindKeyField = useCallback((fieldName) => {
    if (!isCheckerMode || !isDualBlindKeyEnabled) return;
    if (!(paymentInput.dualBlindKeyFields || []).includes(fieldName)) return;
    const original = dualBlindOriginals.current.get(fieldName) ?? '';
    const entered = String(formValues[fieldName] ?? '').trim();
    setDualBlindErrors((prev) => {
      const next = new Map(prev);
      if (original === entered) next.delete(fieldName); else next.set(fieldName, 'Data does not match');
      return next;
    });
    const allMatch = doAllMatch(false);
    if (allMatch) { setDualBlindKeyResult('passed'); setIsDualBlindKeyPassed(true); log('[child] dual blind key MATCHED'); }
    else { setDualBlindKeyResult('failed'); setIsDualBlindKeyPassed(false); }
  }, [isCheckerMode, isDualBlindKeyEnabled, paymentInput.dualBlindKeyFields, formValues, doAllMatch]);

  // applyInputData / ngOnChanges equivalent — sets up dual-blind-key state on new checker payload
  useEffect(() => {
    if (!initializedRef.current) { initializedRef.current = true; return; }
    if (paymentInput.paymentModel && paymentInput.paymentModel.instructedAmount) {
      const model = paymentInput.paymentModel;
      setFormValues((prev) => {
        const next = { ...prev };
        Object.keys(model).forEach((k) => { next[k] = String(model[k] ?? ''); });
        return next;
      });
      if (isCheckerMode && isDualBlindKeyEnabled) {
        dualBlindOriginals.current.clear();
        (paymentInput.dualBlindKeyFields || []).forEach((f) => dualBlindOriginals.current.set(f, String(model[f] ?? '').trim()));
        setFormValues((prev) => {
          const next = { ...prev };
          (paymentInput.dualBlindKeyFields || []).forEach((f) => { next[f] = ''; });
          return next;
        });
        setIsDualBlindKeyPassed(false);
        setDualBlindErrors(new Map());
        log('[child] dual-blind-key fields cleared for re-key, new checker payload loaded');
      }
    } else if (paymentInput.currency) {
      setField('instructedAmountCurrencyCode', paymentInput.currency);
    }
  }, [paymentInput]); // eslint-disable-line

  const field = (fieldName, label, opts = {}) => {
    const cfg = FIELD_CONFIG.find((c) => c.fieldName === fieldName);
    if (!cfg) return null;
    const value = formValues[fieldName] ?? '';
    const isDualBlind = isDualBlindKeyEnabled && (paymentInput.dualBlindKeyFields || []).includes(fieldName);
    const isInvalid = touched[fieldName] && cfg.required && !value;
    return (
      <div className="ff" key={fieldName}>
        <label>{label}{cfg.required && <span className="req"> *</span>}</label>
        {opts.options ? (
          <select
            value={value}
            disabled={isFieldReadonly(fieldName)}
            onChange={(e) => setField(fieldName, e.target.value)}
            onBlur={() => { setTouched((t) => ({ ...t, [fieldName]: true })); if (isDualBlind) validateSingleDualBlindKeyField(fieldName); }}
          >
            <option value="">{opts.placeholder || `Select ${label.toLowerCase()}`}</option>
            {opts.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
        <input
          value={value}
          placeholder={opts.placeholder || `Enter ${label.toLowerCase()}`}
          readOnly={isFieldReadonly(fieldName)}
          onChange={(e) => setField(fieldName, e.target.value)}
          onInput={fieldName === 'instructedAmount' ? instructedAmountChange : undefined}
          onBlur={() => { setTouched((t) => ({ ...t, [fieldName]: true })); if (fieldName === 'instructedAmount') instructedAmountChange(); if (isDualBlind) validateSingleDualBlindKeyField(fieldName); }}
        />
        )}
        {fieldName === 'instructedAmount' && hardcapChecking && <div className="hint">Validating hardcap limit...</div>}
        {fieldName === 'instructedAmount' && hardcapError && <div className="err">{hardcapError}</div>}
        {fieldName === 'instructedAmount' && hardcapSuccessMessage && <div className="ok">{hardcapSuccessMessage}</div>}
        {fieldName === 'debtorAccountNumber' && addressLoading && <div className="hint">Looking up address...</div>}
        {isInvalid && <div className="err">{label} is required</div>}
        {isDualBlind && dualBlindErrors.get(fieldName) && <div className="err">{dualBlindErrors.get(fieldName)}</div>}
      </div>
    );
  };

  return (
    <div className="ss-payment-flow">
      <div className="section-main">
        <div className="section-main-header" onClick={() => toggleSection('paymentDetails')}>
          <span>Payment details</span>
          <span className="chev">{sectionCollapsed.paymentDetails ? '\u25B4' : '\u25BE'}</span>
        </div>
        <div className={`section-main-body ${sectionCollapsed.paymentDetails ? 'collapsed' : ''}`}>
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('paymentInformation')}>
              <span>Payment information</span>
              <span className="chev">{sectionCollapsed.paymentInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body grid3 ${sectionCollapsed.paymentInformation ? 'collapsed' : ''}`}>
              {field('requestedExecutionDate', 'Value Date')}
              {field('instructedAmountCurrencyCode', 'Currency')}
              {field('instructedAmount', 'Transaction Amount')}
            </div>
          </div>
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('debtorInformation')}>
              <span>Debtor information</span>
              <span className="chev">{sectionCollapsed.debtorInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body grid3 ${sectionCollapsed.debtorInformation ? 'collapsed' : ''}`}>
              {field('debtorName', 'Debtor Name')}
              {field('debtorAccountNumber', 'Debtor Account Number')}
              {field('debtorAgentBIC', 'Debtor Agent BIC')}
            </div>
          </div>
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('debtorAddress')}>
              <span>Debtor address details</span>
              <span className="chev">{sectionCollapsed.debtorAddress ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body grid3 ${sectionCollapsed.debtorAddress ? 'collapsed' : ''}`}>
              {field('debtorAddressLines1', 'Debtor Address Line 1')}
              {field('debtorStreetName', 'Debtor Street')}
              {field('debtorCountryCode', 'Debtor Country', { placeholder: 'e.g. US, GB' })}
            </div>
          </div>
        </div>
      </div>
      <div className="section-main">
        <div className="section-main-header" onClick={() => toggleSection('beneficiaryDetails')}>
          <span>Beneficiary details</span>
          <span className="chev">{sectionCollapsed.beneficiaryDetails ? '\u25B4' : '\u25BE'}</span>
        </div>
        <div className={`section-main-body ${sectionCollapsed.beneficiaryDetails ? 'collapsed' : ''}`}>
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('creditorInformation')}>
              <span>Creditor information</span>
              <span className="chev">{sectionCollapsed.creditorInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body grid3 ${sectionCollapsed.creditorInformation ? 'collapsed' : ''}`}>
              {field('creditorName', 'Creditor Name')}
              {field('creditorAccount', 'Creditor Account Number')}
              {field('creditorAgentFinancialInstitutionBIC', 'Creditor Agent BIC')}
            </div>
          </div>
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('intermediaryBank')}>
              <span>Intermediary bank details</span>
              <span className="chev">{sectionCollapsed.intermediaryBank ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body grid3 ${sectionCollapsed.intermediaryBank ? 'collapsed' : ''}`}>
              {field('firstIntermediaryBankBIC', '1st Intermediary Bank SWIFT Code', { placeholder: 'Enter SWIFT/BIC' })}
            </div>
          </div>
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('additionalInformation')}>
              <span>Additional details</span>
              <span className="chev">{sectionCollapsed.additionalInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body grid3 ${sectionCollapsed.additionalInformation ? 'collapsed' : ''}`}>
              {field('chargeBearer', 'Charge Information', { options: ['DEBT', 'CRED', 'SHAR', 'SLEV'] })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- PaymentParent (real logic, JS translation) ----------------------------
function emptyPaymentDetailsRequest() {
  const req = {};
  FIELD_CONFIG.forEach((f) => { req[f.fieldName] = ''; });
  return req;
}

export default function PaymentParentTestHarness() {
  const [selectedMode, setSelectedMode] = useState('maker');
  const [dualBlindKeyFlag, setDualBlindKeyFlag] = useState('N');
  const [currency] = useState('USD');
  const [comments, setComments] = useState('');
  const [isDualBlindKeyPassed, setIsDualBlindKeyPassed] = useState(false);
  const [enableSubmitButton, setEnableSubmitButton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parentDetailsFormValues, setParentDetailsFormValues] = useState({});
  const [currentPaymentModel, setCurrentPaymentModel] = useState(null);
  const [displayMsg, setDisplayMsg] = useState({ message: '', color: '', referenceId: '', status: '' });
  const [logs, setLogs] = useState([]);
  const paymentDetailsRequestRef = useRef(emptyPaymentDetailsRequest());

  const log = useCallback((msg) => setLogs((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}  ${msg}`]), []);

  const paymentInput = useMemo(() => ({
    currency, dualBlindKeyFlag,
    dualBlindKeyFields: DUAL_BLIND_FIELDS,
    paymentModel: currentPaymentModel,
    paymentMode: selectedMode,
  }), [currency, dualBlindKeyFlag, currentPaymentModel, selectedMode]);

  const onPaymentOutput = useCallback((output) => {
    const req = paymentDetailsRequestRef.current;
    Object.keys(req).forEach((k) => { req[k] = output.paymentData[k] ?? req[k]; });
    setEnableSubmitButton(output.isValid);
    setIsDualBlindKeyPassed(output.isDualBlindKeyPassed);
  }, []);

  const onFormValidityChange = useCallback((payload) => {
    setParentDetailsFormValues(payload.makerPayload);
    if (payload.makerPayload) setEnableSubmitButton(Boolean(payload.validForm));
  }, []);

  const onAmountChange = useCallback((payload) => {
    log(`[parent] received amount change from child: ${JSON.stringify(payload)}`);
  }, [log]);

  const submitPaymentToBackend = useCallback(async () => {
    setEnableSubmitButton(false);
    log('[parent] submitting payment to backend...');
    try {
      const res = await mockPostJson('/api/payments/createMakerPayment', paymentDetailsRequestRef.current);
      setDisplayMsg({ message: 'Payment record saved successfully !', color: 'green', referenceId: res.referenceId, status: res.status });
      log('[parent] submit SUCCESS: ' + res.referenceId);
    } catch (err) {
      setDisplayMsg({ message: err.error?.error || 'Unable to Save, error response received.', color: 'red', status: 'Payment creation failed !' });
      log('[parent] submit FAILED (this is expected if "simulate backend error" is on)');
    } finally {
      setEnableSubmitButton(true);
    }
  }, [log]);

  const onApprove = useCallback(async (status) => {
    setIsProcessing(true);
    log(`[parent] ${status.toLowerCase()} clicked, calling backend...`);
    try {
      const res = await mockPostJson('/api/payments/checker/approve', { action: status, comments, paymentDetailsRequest: paymentDetailsRequestRef.current });
      setDisplayMsg({ message: status === 'Rejected' ? 'Rejection processed successfully !' : 'Approval processed successfully !', color: 'green', status: res.status });
      log(`[parent] ${status.toLowerCase()} SUCCESS`);
    } catch (err) {
      setDisplayMsg({ message: err.error?.error || 'Approval processing failed !', color: 'red' });
      log(`[parent] ${status.toLowerCase()} FAILED (this is expected if "simulate backend error" is on)`);
    } finally {
      setIsProcessing(false);
    }
  }, [comments, log]);

  const loadCheckerSample = useCallback(() => {
    setCurrentPaymentModel({
      instructedAmount: 45000, instructedAmountCurrencyCode: 'USD', requestedExecutionDate: '2026-07-18',
      debtorName: 'Acme Trading Ltd', debtorAccountNumber: 'GB29NWBK60161331926819', debtorAgentBIC: 'NWBKGB2LXXX',
      creditorName: 'Beacon Supplies Inc', creditorAccount: 'US64SVBKUS6S3300958879', creditorAgentFinancialInstitutionBIC: 'SVBKUS6S',
      chargeBearer: 'SHAR',
    });
    setSelectedMode('checker');
    setDualBlindKeyFlag('Y');
    log('[test harness] loaded a checker sample payload with dual-blind-key ON');
  }, [log]);

  const loadRepairSample = useCallback(() => {
    setCurrentPaymentModel({
      instructedAmount: 250000, instructedAmountCurrencyCode: 'USD', requestedExecutionDate: '2026-07-18',
      debtorName: '', debtorAccountNumber: 'GB29NWBK60161331926819', debtorAgentBIC: 'NWBKGB2LXXX',
      creditorName: '', creditorAccount: 'US64SVBKUS6S3300958879', creditorAgentFinancialInstitutionBIC: 'SVBKUS6S',
      chargeBearer: 'DEBT',
    });
    setSelectedMode('repair');
    setDualBlindKeyFlag('N');
    log('[test harness] loaded a repair sample payload (debtorName/creditorName rejected/blanked)');
  }, [log]);

  const resetToMaker = useCallback(() => {
    setCurrentPaymentModel(null);
    setSelectedMode('maker');
    setDualBlindKeyFlag('N');
    setDisplayMsg({ message: '', color: '', referenceId: '', status: '' });
    log('[test harness] reset to a fresh maker form');
  }, [log]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        .sample-container{background:#fff;padding:16px;display:flex;flex-direction:column;gap:16px}
        .section-main{border:1px solid #d8d8d8;border-radius:12px;overflow:hidden;background:#fff}
        .section-main-header{background-color:#185fa5 !important;color:#fff !important;padding:10px 16px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:space-between}
        .section-main-body{padding:16px;display:flex;flex-direction:column;gap:12px}
        .section-main-body.collapsed{display:none !important}
        .section{border:1px solid #d8d8d8;border-radius:6px;background:#fff;overflow:hidden}
        .section-header{background-color:#185fa5 !important;color:#fff !important;padding:8px 12px;font-weight:500;font-size:0.9em;cursor:pointer;display:flex;align-items:center;justify-content:space-between}
        .section-body{padding:12px}
        .section-body.collapsed{display:none !important}
        .chev{font-size:14px}
        .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
        .ff{display:flex;flex-direction:column;gap:4px}
        .ff label{font-size:12px;font-weight:600;color:#4a4a4a}
        .ff input, .ff select{background:#fff;border:1px solid #c7c7c7;border-radius:8px;padding:8px 10px}
        .req{color:#b42318}
        .err{color:#b42318;font-size:11px}
        .ok{color:#15803d;font-size:11px}
        .hint{color:#6a6a6a;font-size:11px}
        .test-bar{display:flex;gap:8px;flex-wrap:wrap;padding:12px;background:#f5f5f5;border-radius:8px;margin-bottom:12px}
        .test-bar button{padding:6px 12px;border-radius:6px;border:1px solid #185fa5;background:#fff;color:#185fa5;cursor:pointer;font-size:13px}
        .test-bar button.active{background:#185fa5;color:#fff}
        .log-panel{background:#1a1a1a;color:#a0e0a0;font-family:monospace;font-size:11px;padding:10px;border-radius:8px;height:140px;overflow-y:auto;margin-top:12px}
      `}</style>

      <div className="test-bar">
        <button className={selectedMode === 'maker' ? 'active' : ''} onClick={resetToMaker}>Reset: Maker</button>
        <button className={selectedMode === 'checker' ? 'active' : ''} onClick={loadCheckerSample}>Load: Checker sample (dual-blind ON)</button>
        <button className={selectedMode === 'repair' ? 'active' : ''} onClick={loadRepairSample}>Load: Repair sample</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <input type="checkbox" onChange={(e) => { simulateBackendError = e.target.checked; }} /> Simulate backend error
        </label>
      </div>

      <div className="sample-container">
        <PaymentChild
          paymentInput={paymentInput}
          isCheckerMode={selectedMode === 'checker'}
          isRepairMode={selectedMode === 'repair'}
          onAmountChange={onAmountChange}
          onFormValidityChange={onFormValidityChange}
          onPaymentOutput={onPaymentOutput}
          log={log}
        />

        {(selectedMode === 'maker' || selectedMode === 'repair') && (
          <div>
            <button style={{ background: enableSubmitButton ? '#185fa5' : '#ccc', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: enableSubmitButton ? 'pointer' : 'not-allowed', marginBottom: selectedMode === 'repair' ? 8 : 0 }}
              disabled={!enableSubmitButton} onClick={submitPaymentToBackend}>
              {selectedMode === 'repair' ? 'Resubmit payment' : 'Submit payment'} {enableSubmitButton ? '' : '(fill mandatory fields to enable)'}
            </button>
            {selectedMode === 'repair' && (
              <div className="hint">Rejected fields shown blank for correction: debtor name, creditor name. Fill them in to enable resubmission.</div>
            )}
          </div>
        )}

        {selectedMode === 'checker' && (
          <div>
            <div className="ff" style={{ marginBottom: 8 }}>
              <label>Comments (optional)</label>
              <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={2} style={{ border: '1px solid #c7c7c7', borderRadius: 8, padding: 8 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button disabled={isProcessing} onClick={() => onApprove('Rejected')} style={{ background: '#fbeaea', color: '#b42318', border: '1px solid #f0c9c9', padding: '10px 20px', borderRadius: 8 }}>Reject</button>
              <button disabled={isProcessing || (!isDualBlindKeyPassed && dualBlindKeyFlag === 'Y')} onClick={() => onApprove('Approved')} style={{ background: '#e9f7ef', color: '#15803d', border: '1px solid #bfe8cf', padding: '10px 20px', borderRadius: 8 }}>Approve</button>
              <span className="hint">{dualBlindKeyFlag === 'Y' && !isDualBlindKeyPassed ? 'Re-key the dual-blind-key fields (name/account/BIC) to match before approving' : ''}</span>
            </div>
          </div>
        )}

        {displayMsg.message && (
          <div style={{ padding: 12, borderRadius: 8, background: displayMsg.color === 'green' ? '#e9f7ef' : '#fbeaea', color: displayMsg.color === 'green' ? '#15803d' : '#b42318' }}>
            {displayMsg.message} {displayMsg.referenceId ? `(Ref: ${displayMsg.referenceId})` : ''}
          </div>
        )}

        <div className="log-panel">
          {logs.length === 0 ? 'Interact with the form — parent/child communication events will log here...' : logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
