import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pain001Model,
  PaymentComponentInput,
  PaymentComponentOutput,
  FormFieldConfig,
  HardcapCheckResponse,
  DualBlindKeyResult,
  createEmptyPain001,
  ALWAYS_REQUIRED_FIELDS,
  PAIN001_MANDATORY_FIELDS,
  CHARGE_BEARER_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  REGION_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '../types/models';
import { DEFAULT_VERBIAGES } from '../types/verbiages';
import { buildPain001FromForm, splitMultiline } from '../utils/paymentUtils';
import * as hardcapService from '../services/hardcapService';
import * as addressService from '../services/addressService';
import * as genericValidator from '../services/genericValidator';
import './payment-flow.css';

// ============================================================================
// React port of ss-payment-flow.component.ts (class SSPaymentMakerComponent).
// See memory files: ss-payment-flow-conversion.md, -part2.md,
// -html-capture.md for the full line-by-line capture this is ported from.
//
// Faithfully preserved on purpose (do NOT "fix" these — they're real):
//   - method name payloadPreperation (typo, kept as a comment marker where relevant)
//   - lookupDebtorAddesss / lookupCreditorAddesss typos (see addressService.ts)
//   - dcreditorTownName typo on the creditor address-lookup patch (see below)
//   - THREE separate live paths touching instructedAmount:
//       1) instructedAmountChange() — fired on (input)/(blur), emits an OBJECT
//          {instructedAmountCurrencyCode, instructedAmount} — this is the one
//          the parent's onAmountChange() actually expects (confirmed).
//       2) a 500ms-debounced valueChanges-equivalent that calls validateHardcap()
//       3) a 400ms-debounced valueChanges-equivalent that sets hardcapChecking
//          and emits a bare number via amountChange (kept for fidelity, but
//          NOTE the parent's onAmountChange expects the object shape from #1,
//          not a bare number — flagged, not resolved, in memory).
//   - dead/legacy code from the Angular source (setupFormValidityListener(),
//     applyDualBlindKeyConstraints_old(), debtorAddressLines3/4 fields, the
//     legacy singular debtorAddressLines UI, initForms()) is DELIBERATELY
//     OMITTED here, per the standing "skip dead code" instruction.
// ============================================================================

const hardCapResponsePassedText = 'Hardcap limit check passed';
const hardCapResponseFailedText = 'Value cannot be more than 1000000';

export interface SSPaymentFlowProps {
  paymentInput: PaymentComponentInput;
  fieldConfig: FormFieldConfig[];
  pacsFormVerbiages?: Record<string, string>;
  loggedInUser?: string;
  isMakerMode?: string | boolean;
  isCheckerMode?: boolean;
  isRepairMode?: boolean;
  repairReviewFieldList?: string[];
  repairNewlyModifyFieldList?: string[];
  hardcapResultReceived?: any;
  onAmountChange?: (payload: { instructedAmountCurrencyCode: string; instructedAmount: string | number }) => void;
  onFormValidityChange?: (payload: { validForm: boolean; makerPayload: Record<string, any> }) => void;
  onFormSubmit?: (value: any) => void;
  onPaymentOutput?: (output: PaymentComponentOutput) => void;
  onFailedFieldListChange?: (list: string[]) => void;
}

type FormValues = Record<string, string>;

export default function PaymentChild(props: SSPaymentFlowProps) {
  const {
    paymentInput,
    fieldConfig,
    pacsFormVerbiages: pacsFormVerbiagesInput,
    loggedInUser = '',
    isMakerMode,
    isCheckerMode = false,
    isRepairMode = false,
    repairReviewFieldList = [],
    repairNewlyModifyFieldList = [],
    hardcapResultReceived,
    onAmountChange,
    onFormValidityChange,
    onPaymentOutput,
    onFailedFieldListChange,
  } = props;

  const pacsFormVerbiages = useMemo(
    () => ({ ...DEFAULT_VERBIAGES, ...(pacsFormVerbiagesInput || {}) }),
    [pacsFormVerbiagesInput],
  );

  const resolvedConfig = fieldConfig?.length > 0 ? fieldConfig : [];
  const configMap = useMemo(() => {
    const map = new Map<string, FormFieldConfig>();
    resolvedConfig.forEach((cfg) => map.set(cfg.fieldName, cfg));
    return map;
  }, [resolvedConfig]);

  // -- form state ------------------------------------------------------------
  const buildInitialValues = useCallback((): FormValues => {
    const empty = createEmptyPain001() as unknown as Record<string, any>;
    const init = (paymentInput.paymentModel || {}) as unknown as Record<string, any>;
    const values: FormValues = {};
    resolvedConfig.forEach((cfg) => {
      values[cfg.fieldName] = String(cfg.value ?? init[cfg.fieldName] ?? empty[cfg.fieldName] ?? '');
    });
    // Ensure debtorAddressLines1/2 and creditorAddressLines1/2 always exist
    // as controls even if not present in fieldConfig (mirrors the "fallback
    // block" at the end of buildForm() in the source).
    ['debtorAddressLines1', 'debtorAddressLines2', 'creditorAddressLines1', 'creditorAddressLines2', 'debtorState', 'creditorState']
      .forEach((f) => { if (!(f in values)) values[f] = String(init[f] ?? ''); });
    return values;
  }, [resolvedConfig, paymentInput.paymentModel]);

  const [formValues, setFormValues] = useState<FormValues>(buildInitialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const initializedRef = useRef(false);

  const [isDebtorCountryReadonly, setIsDebtorCountryReadonly] = useState(false);
  const [isCreditorCountryReadonly, setIsCreditorCountryReadonly] = useState(false);

  const [hardcapChecking, setHardcapChecking] = useState(false);
  const [hardcapError, setHardcapError] = useState('');
  const [hardcapSuccessMessage, setHardcapSuccessMessage] = useState('');
  const [hardcapResponse, setHardcapResponse] = useState<any>(null);

  const [showFirstIntermediaryBank, setShowFirstIntermediaryBank] = useState(true);
  const [showSecondIntermediaryBank, setShowSecondIntermediaryBank] = useState(true);

  const [validationResults, setValidationResults] = useState<Map<string, any>>(new Map());
  const [fieldErrorMessages, setFieldErrorMessages] = useState<Map<string, string>>(new Map());

  const [dualBlindKeyResult, setDualBlindKeyResult] = useState<DualBlindKeyResult>(null);
  const [isDualBlindKeyPassed, setIsDualBlindKeyPassed] = useState(false);
  const dualBlindRekeyTempMap = useRef<Map<string, string>>(new Map());
  const [dualBlindKeyFieldErrors, setDualBlindKeyFieldErrors] = useState<Map<string, string>>(new Map());

  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [failedFieldList, setFailedFieldList] = useState<string[]>([]);

  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
    paymentInformation: false,
    debtorInformation: false,
    debtorAddress: false,
    intermediaryBank: false,
    creditorInformation: false,
    creditorAddress: false,
    paymentDetails: false,
    beneficiaryDetails: false,
    additionalInformation: false,
  });

  // -- derived mode flags ------------------------------------------------------
  // isMakerMode arrives from the parent as a hardcoded STRING ('Maker') in
  // this app, not a real per-mode boolean — see CRITICAL FLAG in memory.
  // paymentInput.paymentMode is the authoritative signal; both are honored
  // here exactly as the Angular fallbacks did: `isMakerMode || paymentMode === 'maker'`.
  const isMakerModeTruthy = Boolean(isMakerMode);
  const isMaker = isMakerModeTruthy || paymentInput?.paymentMode === 'maker';
  // NOTE preserved as photographed: the source computes isRepair using
  // isMakerMode too (not a real isRepairMode check) — likely a source bug,
  // kept exactly as found rather than "corrected" to isRepairMode.
  const isRepair = isMakerModeTruthy || paymentInput?.paymentMode === 'repair';

  const isDualBlindKeyEnabled = paymentInput?.dualBlindKeyFlag === 'Y';

  // -- helpers -----------------------------------------------------------------
  const isHidden = useCallback((fieldName: string) => configMap.get(fieldName)?.hidden === true, [configMap]);
  const getLabel = useCallback(
    (fieldName: string, defaultLabel: string) => configMap.get(fieldName)?.label ?? defaultLabel,
    [configMap],
  );
  const isFieldHidden = useCallback(
    (fieldName: string) => (paymentInput.hideFieldsList || []).includes(fieldName),
    [paymentInput.hideFieldsList],
  );
  const isFieldRejected = useCallback(
    (fieldName: string) => isRepairMode && (paymentInput.rejectedFieldList || []).includes(fieldName),
    [isRepairMode, paymentInput.rejectedFieldList],
  );
  const getFieldLabelClass = useCallback(
    (fieldName: string) => (isFieldRejected(fieldName) ? 'field-label rejected' : 'field-label'),
    [isFieldRejected],
  );
  const isFieldReadonly = useCallback(
    (fieldName: string) => {
      if (fieldName === 'debtorCountryCode' && isDebtorCountryReadonly) return true;
      if (fieldName === 'debtorCountryCode') return false;
      if (fieldName === 'creditorCountryCode' && isCreditorCountryReadonly) return true;
      if (fieldName === 'creditorCountryCode') return false;
      if (!isCheckerMode) return false;
      if (isDualBlindKeyEnabled && (paymentInput.dualBlindKeyFields || []).includes(fieldName)) return false;
      return true;
    },
    [isDebtorCountryReadonly, isCreditorCountryReadonly, isCheckerMode, isDualBlindKeyEnabled, paymentInput.dualBlindKeyFields],
  );
  const isDualBlindKeyField = useCallback(
    (fieldName: string) => isDualBlindKeyEnabled && (paymentInput.dualBlindKeyFields || []).includes(fieldName),
    [isDualBlindKeyEnabled, paymentInput.dualBlindKeyFields],
  );
  const isMandatoryField = useCallback(
    (fieldName: string) => validationResults.get(fieldName)?.required ?? PAIN001_MANDATORY_FIELDS.includes(fieldName),
    [validationResults],
  );
  const isFieldDynamicallyHidden = useCallback(
    (fieldName: string) => validationResults.get(fieldName)?.visible === false,
    [validationResults],
  );
  const getFieldValidationError = useCallback(
    (fieldName: string) => fieldErrorMessages.get(fieldName) ?? '',
    [fieldErrorMessages],
  );
  const isRepairReviewField = useCallback(
    (fieldName: string) => isCheckerMode && Array.isArray(repairReviewFieldList) && repairReviewFieldList.includes(fieldName),
    [isCheckerMode, repairReviewFieldList],
  );
  const isRepairNewlyModifyField = useCallback(
    (fieldName: string) => isCheckerMode && Array.isArray(repairNewlyModifyFieldList) && repairNewlyModifyFieldList.includes(fieldName),
    [isCheckerMode, repairNewlyModifyFieldList],
  );
  const getDualBlindKeyFieldError = useCallback(
    (fieldName: string) => dualBlindKeyFieldErrors.get(fieldName) ?? '',
    [dualBlindKeyFieldErrors],
  );
  const isFieldDisabledForDualBlindKey = useCallback(
    (fieldName: string) => {
      if (!isCheckerMode || !isDualBlindKeyEnabled) return false;
      return !(paymentInput.dualBlindKeyFields || []).includes(fieldName);
    },
    [isCheckerMode, isDualBlindKeyEnabled, paymentInput.dualBlindKeyFields],
  );

  const setField = useCallback((name: string, value: string, emitEvent = true) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getPaymentData = useCallback((): Pain001Model => buildPain001FromForm(formValues), [formValues]);

  const logMissingMandatoryFields = useCallback((): string[] => {
    const missing: string[] = [];
    PAIN001_MANDATORY_FIELDS.forEach((f) => {
      if (!formValues[f]) missing.push(f);
    });
    validationResults.forEach((result, fieldName) => {
      if (result.required && !formValues[fieldName]) missing.push(fieldName);
    });
    if (missing.length > 0) console.warn('[SS-PAYMENT-FLOW] missing mandatory fields:', missing);
    return missing;
  }, [formValues, validationResults]);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    if (message && type) {
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    }
  }, []);

  // -- emitOutput ---------------------------------------------------------------
  const isFormValidRef = useRef(false);
  const emitOutput = useCallback(() => {
    const data = getPaymentData();
    // NOTE: real Angular form validity is a full reactive-forms computation;
    // this port approximates it as "all mandatory fields present" — see
    // README for the gap this leaves vs. the original Validators.required /
    // Validators.min(0.01) rules per control.
    const mandatoryOk = PAIN001_MANDATORY_FIELDS.every((f) => !isHidden(f) && formValues[f]);
    let isValid = mandatoryOk;
    let outputMessage = '';

    if (isCheckerMode && isDualBlindKeyEnabled) {
      if (dualBlindKeyResult === 'failed') {
        isValid = false;
        outputMessage = 'dualBlindKey=failed';
      } else if (dualBlindKeyResult === 'passed') {
        outputMessage = 'dualBlindKey=passed';
      }
    }

    const isMakerEmit = isMakerModeTruthy || paymentInput?.paymentMode === 'maker';
    if (isMakerEmit && hardcapResponse && hardcapResponse.amountWithinLimit === false) {
      isValid = false;
      outputMessage = 'hardcapLimitExceeded';
    }

    if (!isValid && !outputMessage) {
      const missing = logMissingMandatoryFields();
      outputMessage = missing.length > 0 ? `mandatory fields missing: ${missing.join(', ')}` : 'mandatory fields missing';
    }

    isFormValidRef.current = isValid;
    const output: PaymentComponentOutput = {
      paymentData: data,
      isValid,
      outputMessage,
      dualBlindKeyResult,
      isDualBlindKeyPassed,
    };
    onPaymentOutput?.(output);

    // Also mirror the {validForm, makerPayload} shape the parent's
    // onFormValidityChange() reads .makerPayload off of (confirmed via
    // parent capture) — the parent uses this for parentDetailsFormValues
    // across ALL modes, not just maker.
    onFormValidityChange?.({ validForm: isValid, makerPayload: formValues });
  }, [
    getPaymentData, formValues, isHidden, isCheckerMode, isDualBlindKeyEnabled, dualBlindKeyResult,
    isMakerModeTruthy, paymentInput?.paymentMode, hardcapResponse, isDualBlindKeyPassed,
    logMissingMandatoryFields, onPaymentOutput, onFormValidityChange,
  ]);

  const evaluateValidity = useCallback(() => {
    // payloadPreperation() equivalent is folded into emitOutput() here for
    // the React port — the Angular original called it separately but its
    // effect (building the internal paymentDetailsRequest mirror) has no
    // externally-visible consequence for the port beyond what emitOutput
    // already produces.
    emitOutput();
  }, [emitOutput]);

  // -- hardcap validation ---------------------------------------------------
  const resetHardcapValidation = useCallback(() => {
    setHardcapError('');
    setHardcapSuccessMessage('');
    emitOutput();
  }, [emitOutput]);

  const validateHardcap = useCallback(
    async (amount: unknown) => {
      if (!(isMaker || isRepair)) return;
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount as number);
      if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount) || numericAmount < 0) {
        resetHardcapValidation();
        return;
      }
      const currency = (formValues.instructedAmountCurrencyCode || paymentInput.currency || '').toUpperCase();
      if (!currency) {
        resetHardcapValidation();
        return;
      }
      setHardcapChecking(true);
      setHardcapError('');
      setHardcapSuccessMessage('');
      try {
        const response: HardcapCheckResponse = await hardcapService.verifyHardCap(paymentInput.hardcapLimitCheckBaseUrl, {
          currency,
          paymentAmount: numericAmount,
          applicationName: paymentInput.applicationName,
          applicationModule: paymentInput.applicationModule,
        });
        setHardcapChecking(false);
        setHardcapResponse({ amountWithinLimit: response.amountWithinLimit, hardCapValue: response.hardCapValue });
        if (response.amountWithinLimit) {
          setHardcapSuccessMessage(hardCapResponsePassedText);
          setHardcapError('');
        } else {
          setHardcapError('Value cannot be more than ' + response.hardCapValue);
          setHardcapSuccessMessage('');
        }
        evaluateValidity();
      } catch (err) {
        console.error('[HARDCAP-LIB] hardcap API error:', err);
        setHardcapChecking(false);
        setHardcapResponse(null);
        setHardcapError('Unable to validate hardcap limit');
        setHardcapSuccessMessage('');
        emitOutput();
      }
    },
    [isMaker, isRepair, formValues.instructedAmountCurrencyCode, paymentInput, resetHardcapValidation, evaluateValidity, emitOutput],
  );

  // -- @Input() hardcapResultReceived setter equivalent ----------------------
  useEffect(() => {
    if (hardcapResultReceived === undefined || hardcapResultReceived === null) return;
    setHardcapChecking(false);
    console.log('[HARDCAP-LIB] hardcapResultReceived:', hardcapResultReceived);
    if (hardcapResultReceived === hardCapResponsePassedText) {
      setHardcapError('');
      setHardcapSuccessMessage(hardCapResponsePassedText);
    } else if (hardcapResultReceived === hardCapResponseFailedText) {
      setHardcapError(hardCapResponseFailedText);
      setHardcapSuccessMessage('');
    }
    evaluateValidity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardcapResultReceived]);

  // -- instructedAmount: THREE separate live triggers, preserved -------------
  const instructedAmountChange = useCallback(() => {
    const value = formValues.instructedAmount;
    if (!value) {
      setHardcapError('');
      setHardcapSuccessMessage('');
    }
    const instructedAmountCurrencyCode = (formValues.instructedAmountCurrencyCode || '').toUpperCase();
    onAmountChange?.({ instructedAmountCurrencyCode, instructedAmount: value });
  }, [formValues.instructedAmount, formValues.instructedAmountCurrencyCode, onAmountChange]);

  const amountDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    // setupInstructedAmountListener — 500ms debounce, calls validateHardcap
    if (amountDebounceRef.current) clearTimeout(amountDebounceRef.current);
    amountDebounceRef.current = setTimeout(() => {
      validateHardcap(formValues.instructedAmount);
    }, 500);
    return () => { if (amountDebounceRef.current) clearTimeout(amountDebounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.instructedAmount]);

  const subscribeAmountDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    // subscribeAmountChange — 400ms debounce, sets hardcapChecking flag.
    // NOTE: source emits a bare NUMBER here via amountChange, which is
    // inconsistent with what the parent's onAmountChange() actually reads
    // (an object) — preserved as a flagged discrepancy, not resolved.
    if (subscribeAmountDebounceRef.current) clearTimeout(subscribeAmountDebounceRef.current);
    subscribeAmountDebounceRef.current = setTimeout(() => {
      const amount = parseFloat(formValues.instructedAmount);
      if (!isNaN(amount) && amount > 0) {
        setHardcapChecking(true);
        setHardcapResponse(null);
      } else {
        setHardcapChecking(false);
        setHardcapResponse(null);
      }
    }, 400);
    return () => { if (subscribeAmountDebounceRef.current) clearTimeout(subscribeAmountDebounceRef.current); };
  }, [formValues.instructedAmount]);

  const onAmountBlur = useCallback(() => {
    validateHardcap(formValues.instructedAmount);
  }, [validateHardcap, formValues.instructedAmount]);

  // -- BIC -> country code auto-fill listeners (500ms debounce each) --------
  const debtorBicDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const value = formValues.debtorAgentBIC;
    if (debtorBicDebounceRef.current) clearTimeout(debtorBicDebounceRef.current);
    debtorBicDebounceRef.current = setTimeout(() => {
      if (!value) {
        setIsDebtorCountryReadonly(false);
        return;
      }
      setIsDebtorCountryReadonly(true);
      setField('debtorCountryCode', value.substring(4, 6));
    }, 500);
    return () => { if (debtorBicDebounceRef.current) clearTimeout(debtorBicDebounceRef.current); };
  }, [formValues.debtorAgentBIC, setField]);

  const creditorBicDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const value = formValues.creditorAgentFinancialInstitutionBIC;
    if (creditorBicDebounceRef.current) clearTimeout(creditorBicDebounceRef.current);
    creditorBicDebounceRef.current = setTimeout(() => {
      if (!value) {
        setIsCreditorCountryReadonly(false);
        return;
      }
      setIsCreditorCountryReadonly(true);
      setField('creditorCountryCode', value.substring(4, 6));
    }, 500);
    return () => { if (creditorBicDebounceRef.current) clearTimeout(creditorBicDebounceRef.current); };
  }, [formValues.creditorAgentFinancialInstitutionBIC, setField]);

  // -- address lookups (300ms debounce, merged field triggers) ---------------
  const debtorAddrDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (debtorAddrDebounceRef.current) clearTimeout(debtorAddrDebounceRef.current);
    debtorAddrDebounceRef.current = setTimeout(async () => {
      const account = formValues.debtorAccountNumber;
      const bic = formValues.debtorAgentBIC;
      const directCountry = formValues.debtorCountryCode;
      const country = directCountry || (bic ? bic.substring(4, 6) : '');
      if (!account) return;
      if (!/^[A-Z]{2}$/.test(country)) return;
      try {
        const res = await addressService.lookupDebtorAddesss('/shared-services/api/payment/api/payments', {
          account, bic, countryCode: country,
        });
        setFormValues((prev) => ({
          ...prev,
          debtorAddressLines1: res.addressLine?.[0] || '',
          debtorAddressLines2: res.addressLine?.[1] || '',
          debtorStreetName: res.streetName || '',
          debtorBuildingNumber: res.buildingNumber || '',
          debtorPostalCode: res.postalCode || '',
          debtorTownName: res.townName || '',
          debtorCountrySubDivision: res.countrySubDivision || '',
          debtorState: res.state || '',
          debtorCountryCode: res.countryCode || prev.debtorCountryCode,
        }));
      } catch (err) {
        console.log('Error fetching debtor address:', err);
      }
    }, 300);
    return () => { if (debtorAddrDebounceRef.current) clearTimeout(debtorAddrDebounceRef.current); };
  }, [formValues.debtorAccountNumber, formValues.debtorAgentBIC, formValues.debtorCountryCode]);

  const creditorAddrDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (creditorAddrDebounceRef.current) clearTimeout(creditorAddrDebounceRef.current);
    creditorAddrDebounceRef.current = setTimeout(async () => {
      const countryCode = formValues.creditorCountryCode;
      const bic = formValues.creditorAgentFinancialInstitutionBIC;
      let sortCode = '';
      if (countryCode === 'US') sortCode = formValues.creditorSortCodeUS;
      else if (countryCode === 'GB') sortCode = formValues.creditorSortCodeUK;
      // NOTE: account-existence guard is COMMENTED OUT in the source for the
      // creditor path (asymmetric vs. the debtor version above, which DOES
      // gate on account presence) — preserved, not "fixed."
      if (!/^[A-Z]{2}$/.test(countryCode || '')) return;
      try {
        const res = await addressService.lookupCreditorAddesss('/shared-services/api/payment/api/payments', {
          bic, countryCode, shortCode: sortCode ?? '',
        });
        setFormValues((prev) => ({
          ...prev,
          creditorAddressLines1: res.addressLine?.[0] || '',
          creditorAddressLines2: res.addressLine?.[1] || '',
          creditorStreetName: res.streetName || '',
          creditorBuildingNumber: res.buildingNumber || '',
          creditorPostalCode: res.postalCode || '',
          // NOTE: `dcreditorTownName` typo preserved exactly — the source
          // patches this misspelled key, not `creditorTownName`.
          dcreditorTownName: res.townName || '',
          creditorCountrySubDivision: res.countrySubDivision || '',
          creditorState: res.state || '',
          creditorCountryCode: res.countryCode || prev.creditorCountryCode,
        } as any));
      } catch (err) {
        // NOTE: source's null-response warning text incorrectly says "debtor
        // address response" here too (copy-paste bug) — preserved verbatim.
        console.log('Error fetching debtor address response:', err);
      }
    }, 300);
    return () => { if (creditorAddrDebounceRef.current) clearTimeout(creditorAddrDebounceRef.current); };
  }, [formValues.creditorCountryCode, formValues.creditorAgentFinancialInstitutionBIC, formValues.creditorSortCodeUS, formValues.creditorSortCodeUK]);

  // -- dynamic validation (debounced, driven by a fixed list of fields) ------
  const dynamicValidationDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const drivingFieldsKey = [
    formValues.debtorAgentBIC, formValues.debtorAgentBank, formValues.creditorAgentFinancialInstitutionBIC,
    formValues.painPaymentMethodType, formValues.instructedAmountCurrencyCode,
    formValues.debtorStreetName, formValues.debtorBuildingNumber, formValues.debtorPostalCode,
    formValues.debtorAddressLines1, formValues.debtorAddressLines2,
    formValues.creditorStreetName, formValues.creditorBuildingNumber, formValues.creditorPostalCode,
    formValues.creditorAddressLines1, formValues.creditorAddressLines2,
    formValues.chargesAmount, formValues.chargesAgentBIC, formValues.firstIntermediaryBankBIC,
  ].join('|');
  useEffect(() => {
    if (dynamicValidationDebounceRef.current) clearTimeout(dynamicValidationDebounceRef.current);
    dynamicValidationDebounceRef.current = setTimeout(() => {
      const fieldResults = genericValidator.evaluateAllFields(formValues);
      const formRuleEffects = genericValidator.evaluateFormRules(formValues);
      const results = genericValidator.applyToForm(fieldResults, formRuleEffects);
      setValidationResults(results);
      const errMap = new Map<string, string>();
      results.forEach((result, fieldName) => {
        if (result.patternMessage) errMap.set(fieldName, result.patternMessage);
      });
      setFieldErrorMessages(errMap);
      const firstBic = results.get('firstIntermediaryBankBIC');
      if (firstBic) setShowFirstIntermediaryBank(firstBic.visible !== false);
      const secondBic = results.get('secondIntermediaryBankBIC');
      if (secondBic) setShowSecondIntermediaryBank(secondBic.visible !== false);
    }, 300);
    return () => { if (dynamicValidationDebounceRef.current) clearTimeout(dynamicValidationDebounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivingFieldsKey]);

  // -- form value change -> emit + evaluate ----------------------------------
  useEffect(() => {
    evaluateValidity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  // -- dual blind key -----------------------------------------------------
  // storeDualBlindKeyOriginalValuesFrom / clearDualBlindKeyFieldsWith take an
  // explicit values source rather than reading `formValues` state. FIX
  // (found on final review): the Angular original calls
  // storeDualBlindKeyOriginalValues() synchronously right after
  // patchFormFromModel() patches the form — by the time it runs,
  // paymentForm.getRawValue() already reflects the freshly-patched values
  // (Angular forms are synchronous). React's setFormValues is async, so
  // reading the `formValues` state in the same tick as patching would
  // capture the OLD values, not the new checker payload's values. Passing
  // the fresh model directly closes that gap and matches the Angular
  // component's real behavior.
  const storeDualBlindKeyOriginalValuesFrom = useCallback((values: Record<string, any>) => {
    dualBlindRekeyTempMap.current.clear();
    (paymentInput.dualBlindKeyFields || []).forEach((field) => {
      dualBlindRekeyTempMap.current.set(field, String(values[field] ?? '').trim());
    });
  }, [paymentInput.dualBlindKeyFields]);

  const clearDualBlindKeyFields = useCallback(() => {
    setFormValues((prev) => {
      const next = { ...prev };
      (paymentInput.dualBlindKeyFields || []).forEach((field) => { next[field] = ''; });
      return next;
    });
    setIsDualBlindKeyPassed(false);
    setDualBlindKeyFieldErrors(new Map());
  }, [paymentInput.dualBlindKeyFields]);

  const doAllDualBlindKeysMatch = useCallback(
    (trackErrors: boolean): boolean => {
      const errors = new Map(dualBlindKeyFieldErrors);
      const allMatch = (paymentInput.dualBlindKeyFields || []).every((field) => {
        const originalValue = dualBlindRekeyTempMap.current.get(field) ?? '';
        const enteredValue = String(formValues[field] ?? '').trim();
        const matches = originalValue === enteredValue;
        if (!matches && trackErrors) errors.set(field, 'Data does not match');
        return matches;
      });
      if (trackErrors) setDualBlindKeyFieldErrors(errors);
      return allMatch;
    },
    [paymentInput.dualBlindKeyFields, formValues, dualBlindKeyFieldErrors],
  );

  const validateDualBlindKeys = useCallback(() => {
    if (!isCheckerMode || !isDualBlindKeyEnabled) return;
    setDualBlindKeyFieldErrors(new Map());
    const allMatch = doAllDualBlindKeysMatch(true);
    if (allMatch) {
      setDualBlindKeyResult('passed');
      setIsDualBlindKeyPassed(true);
      showNotification('Dual blind key validation passed', 'success');
    } else {
      setDualBlindKeyResult('failed');
      setIsDualBlindKeyPassed(false);
      showNotification('Dual blind key validation failed', 'error');
    }
    emitOutput();
  }, [isCheckerMode, isDualBlindKeyEnabled, doAllDualBlindKeysMatch, showNotification, emitOutput]);

  const validateSingleDualBlindKeyField = useCallback(
    (fieldName: string) => {
      if (!isCheckerMode || !isDualBlindKeyEnabled) return;
      if (!(paymentInput.dualBlindKeyFields || []).includes(fieldName)) return;
      const originalValue = dualBlindRekeyTempMap.current.get(fieldName) ?? '';
      const enteredValue = String(formValues[fieldName] ?? '').trim();
      setDualBlindKeyFieldErrors((prev) => {
        const next = new Map(prev);
        if (originalValue === enteredValue) next.delete(fieldName);
        else next.set(fieldName, 'Data does not match');
        return next;
      });
      const allMatch = doAllDualBlindKeysMatch(false);
      if (allMatch) {
        setDualBlindKeyResult('passed');
        setIsDualBlindKeyPassed(true);
        setDualBlindKeyFieldErrors(new Map());
        showNotification('Dual blind key validation passed', 'success');
      } else {
        setDualBlindKeyResult('failed');
        setIsDualBlindKeyPassed(false);
      }
      emitOutput();
    },
    [isCheckerMode, isDualBlindKeyEnabled, paymentInput.dualBlindKeyFields, formValues, doAllDualBlindKeysMatch, showNotification, emitOutput],
  );

  // -- failed-field toggle (checker double-click) ---------------------------
  const toggleFailedField = useCallback(
    (fieldName: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      if (!isCheckerMode) return;
      if (isDualBlindKeyField(fieldName)) return;
      setFailedFieldList((prev) => {
        const next = prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName];
        onFailedFieldListChange?.(next);
        return next;
      });
    },
    [isCheckerMode, isDualBlindKeyField, onFailedFieldListChange],
  );
  const isFieldFailed = useCallback((fieldName: string) => failedFieldList.includes(fieldName), [failedFieldList]);

  const toggleSection = useCallback((section: string) => {
    console.log('ToggleSection for ' + section);
    setSectionCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // -- applyInputData / ngOnChanges equivalent --------------------------------
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    if (paymentInput?.paymentModel?.instructedAmount) {
      // patchCheckerValuesReceivedFromParent equivalent
      const model = paymentInput.paymentModel as any;
      setFormValues((prev) => {
        const next = { ...prev };
        Object.keys(model).forEach((k) => { next[k] = String(model[k] ?? ''); });
        return next;
      });
      // FIX (found on final review): rebuild dual-blind-key state directly
      // here, on every new checker/repair payload — using the fresh model
      // (not stale formValues state) — instead of a separate effect keyed
      // on [isCheckerMode, isDualBlindKeyEnabled] that would never re-fire
      // for a second payload with the same mode/flag values.
      if (isCheckerMode && isDualBlindKeyEnabled) {
        storeDualBlindKeyOriginalValuesFrom(model);
        clearDualBlindKeyFields();
      }
    } else if (paymentInput.currency) {
      setField('instructedAmountCurrencyCode', paymentInput.currency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentInput]);

  // ---------------------------------------------------------------------------
  // RENDER
  //
  // NOTE ON MARKUP FIDELITY: the photographed .html capture (see
  // ss-payment-flow-html-capture.md) runs through Payment Information,
  // Debtor Information, Debtor Address, Creditor Information, Creditor
  // Address, and the START of Intermediary Bank (first block, first field
  // only) in full per-field detail before cutting off. The sections below
  // reproduce that confirmed structure faithfully. The remainder — the rest
  // of the first intermediary bank block, the entire second intermediary
  // bank block, Additional/Charge/Remittance fields — are NOT independently
  // photographed; they are rendered here using the same "standard field
  // pattern" documented for the confirmed sections, driven off the field
  // list confirmed via the parent's fieldConfig[] and DEFAULT_VERBIAGES
  // keys, rather than invented from scratch. Treat these specific fields as
  // structurally faithful but not pixel-verified against the real markup.
  // ---------------------------------------------------------------------------

  const renderField = (
    fieldName: string,
    defaultLabel: string,
    opts: { placeholder?: string; maxLength?: number; errorFallback?: string; isDualBlind?: boolean; options?: string[] } = {},
  ) => {
    if (isFieldHidden(fieldName) && !configMap.has(fieldName)) return null;
    if (isHidden(fieldName)) return null;
    const value = formValues[fieldName] ?? '';
    const isTouched = touched[fieldName];
    const isInvalid = isTouched && configMap.get(fieldName)?.required && !value;
    const dualBlind = opts.isDualBlind ?? isDualBlindKeyField(fieldName);
    // Default placeholder derived from the label when the call site didn't
    // supply one — every field always shows a grey placeholder hint.
    const placeholder = opts.placeholder ?? `Enter ${defaultLabel.toLowerCase()}`;

    return (
      <div
        key={fieldName}
        className={[
          'form-field',
          isFieldRejected(fieldName) && 'rejected',
          isFieldFailed(fieldName) && 'failed-field',
          isRepairReviewField(fieldName) && 'repair-review-field',
          isRepairNewlyModifyField(fieldName) && 'repair-newly-modify-field',
        ].filter(Boolean).join(' ')}
        onDoubleClick={(e) => toggleFailedField(fieldName, e)}
      >
        <label className={getFieldLabelClass(fieldName)}>
          {getLabel(fieldName, defaultLabel)}
          {isMandatoryField(fieldName) && <span className="mandatory-indicator"> *</span>}
        </label>
        {opts.options ? (
          <select
            value={value}
            disabled={isFieldReadonly(fieldName) || isFieldDisabledForDualBlindKey(fieldName)}
            onChange={(e) => setField(fieldName, e.target.value)}
            onBlur={() => {
              setTouched((t) => ({ ...t, [fieldName]: true }));
              if (dualBlind) validateSingleDualBlindKeyField(fieldName);
            }}
          >
            <option value="">{placeholder}</option>
            {opts.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
        <input
          value={value}
          maxLength={opts.maxLength}
          placeholder={placeholder}
          readOnly={isFieldReadonly(fieldName)}
          disabled={isFieldDisabledForDualBlindKey(fieldName)}
          onChange={(e) => setField(fieldName, e.target.value)}
          onBlur={() => {
            setTouched((t) => ({ ...t, [fieldName]: true }));
            if (dualBlind) validateSingleDualBlindKeyField(fieldName);
          }}
        />
        )}
        {isInvalid && (
          <div className="field-error">{getFieldValidationError(fieldName) || opts.errorFallback || `${defaultLabel} is required`}</div>
        )}
        {dualBlind && getDualBlindKeyFieldError(fieldName) && (
          <div className="field-error dual-blind-error">{getDualBlindKeyFieldError(fieldName)}</div>
        )}
      </div>
    );
  };

  return (
    <div className="ss-payment-flow">
      {/* ---- Payment Details mega-section (debtor side) ---- */}
      <div className="section-main">
        <div className="section-main-header" onClick={() => toggleSection('paymentDetails')}>
          <span>{pacsFormVerbiages.PaymentDetails}</span>
          <span className="chev">{sectionCollapsed.paymentDetails ? '\u25B4' : '\u25BE'}</span>
        </div>
        <div className={`section-main-body ${sectionCollapsed.paymentDetails ? 'collapsed' : ''}`}>
          {/* Section 1: Payment Information */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('paymentInformation')}>
              <span>{pacsFormVerbiages.PaymentInformation}</span>
              <span className="chev">{sectionCollapsed.paymentInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body ${sectionCollapsed.paymentInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('requestedExecutionDate', pacsFormVerbiages.ValueDate, { errorFallback: pacsFormVerbiages.ValueDateIsRequired })}
                {renderField('instructedAmountCurrencyCode', pacsFormVerbiages.Currency, { errorFallback: pacsFormVerbiages.CurrencyIsRequired })}
                <div className="form-field">
                  <label className={getFieldLabelClass('instructedAmount')}>
                    {getLabel('instructedAmount', pacsFormVerbiages.TransactionAmount)}
                    {isMandatoryField('instructedAmount') && <span className="mandatory-indicator"> *</span>}
                  </label>
                  <input
                    value={formValues.instructedAmount ?? ''}
                    onChange={(e) => setField('instructedAmount', e.target.value)}
                    onInput={instructedAmountChange}
                    onBlur={() => { instructedAmountChange(); validateSingleDualBlindKeyField('instructedAmount'); onAmountBlur(); }}
                  />
                  {hardcapChecking && <div className="hint">{pacsFormVerbiages.ValidatingHardcapLimit}</div>}
                  {hardcapError && <div className="field-error">{hardcapError}</div>}
                  {hardcapSuccessMessage && <div className="success-message">{hardcapSuccessMessage}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Debtor Information */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('debtorInformation')}>
              <span>{pacsFormVerbiages.DebtorInfo}</span>
              <span className="chev">{sectionCollapsed.debtorInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body ${sectionCollapsed.debtorInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('debtorName', pacsFormVerbiages.DebtorName, { errorFallback: pacsFormVerbiages.DebtorNameIsRequired })}
                {renderField('debtorAccountNumber', pacsFormVerbiages.DebtorAccountNumber, { errorFallback: pacsFormVerbiages.DebtorAccountNumberIsRequired })}
                {renderField('debtorAgentBIC', pacsFormVerbiages.DebtorAgentBIC, { errorFallback: pacsFormVerbiages.DebtorAgentBicIsRequired })}
              </div>
            </div>
          </div>

          {/* Section 3: Debtor Address Details */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('debtorAddress')}>
              <span>{pacsFormVerbiages.DebtorAddressDetails}</span>
              <span className="chev">{sectionCollapsed.debtorAddress ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body ${sectionCollapsed.debtorAddress ? 'collapsed' : ''}`}>
              {/* debtorAddressLines3/4 and legacy singular debtorAddressLines are DEAD in the
                  source (commented out) — deliberately omitted here. */}
              <div className="form-row-2">
                {renderField('debtorAddressLines1', pacsFormVerbiages.DebtorAddressLine1, { placeholder: 'Address' })}
                {renderField('debtorAddressLines2', pacsFormVerbiages.DebtorAddressLine2, { placeholder: 'Address' })}
              </div>
              <div className="form-row-3">
                {renderField('debtorStreetName', pacsFormVerbiages.DebtorStreet, { placeholder: 'Enter street name', errorFallback: 'Debtor Street is required' })}
                {renderField('debtorBuildingNumber', pacsFormVerbiages.DebtorBuildingNumber, { errorFallback: 'Debtor Building Number is required', isDualBlind: false })}
                {renderField('debtorTownName', pacsFormVerbiages.DebtorTownOrCityName, { errorFallback: 'Debtor Town / City Name is required' })}
              </div>
              <div className="form-row-3">
                {renderField('debtorCountrySubDivision', pacsFormVerbiages.DebtorCountrySubDivisionLabel, { errorFallback: 'Debtor Country Sub Division is required' })}
                {renderField('debtorState', pacsFormVerbiages.DebtorState, { errorFallback: 'Debtor State is required' })}
                {renderField('debtorCountryCode', pacsFormVerbiages.DebtorCountry, { placeholder: 'e.g. US, GB', maxLength: 2, errorFallback: 'Debtor Country is required' })}
              </div>
              <div className="form-row-3">
                {renderField('debtorPostalCode', pacsFormVerbiages.DebtorPostalCode, { errorFallback: 'Debtor Postal Code is required' })}
                {renderField('debtorSortCodeUK', pacsFormVerbiages.DebtorSortCode, { errorFallback: 'Debtor Sort Code is required' })}
                {renderField('debtorSortCodeUS', pacsFormVerbiages.DebtorSortCode, { placeholder: '9-digit ABA routing number', errorFallback: 'Debtor Sort Code (ABA) is required' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Beneficiary Details mega-section (creditor + intermediary side) ---- */}
      <div className="section-main">
        <div className="section-main-header" onClick={() => toggleSection('beneficiaryDetails')}>
          <span>{pacsFormVerbiages.BeneficiaryDetails}</span>
          <span className="chev">{sectionCollapsed.beneficiaryDetails ? '\u25B4' : '\u25BE'}</span>
        </div>
        <div className={`section-main-body ${sectionCollapsed.beneficiaryDetails ? 'collapsed' : ''}`}>
          {/* Section 5: Creditor Information */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('creditorInformation')}>
              <span>{pacsFormVerbiages.CreditorInformation}</span>
              <span className="chev">{sectionCollapsed.creditorInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body ${sectionCollapsed.creditorInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('creditorName', pacsFormVerbiages.CreditorName, { placeholder: 'Enter creditor name', errorFallback: pacsFormVerbiages.CreditorNameIsRequired })}
                {renderField('creditorAccount', pacsFormVerbiages.CreditorAccountNumber, { placeholder: 'Enter account number', errorFallback: pacsFormVerbiages.CreditorAccountNumberIsRequired })}
                {renderField('creditorAgentFinancialInstitutionBIC', pacsFormVerbiages.CreditorAgentBIC, { placeholder: 'Enter BIC', errorFallback: pacsFormVerbiages.Required })}
              </div>
              <div className="form-row-3">
                {renderField('creditorAgentFinancialInstitutionName', pacsFormVerbiages.CreditorAgentBankName, { placeholder: 'Enter bank name', errorFallback: pacsFormVerbiages.Required })}
                {renderField('creditorAgentAccountNumber', 'Creditor Agent Account Number', { placeholder: 'Enter agent account no', errorFallback: pacsFormVerbiages.Required })}
              </div>
            </div>
          </div>

          {/* Section 6: Creditor Address Details */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('creditorAddress')}>
              <span>{pacsFormVerbiages.CreditorAddressDetails}</span>
              <span className="chev">{sectionCollapsed.creditorAddress ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body ${sectionCollapsed.creditorAddress ? 'collapsed' : ''}`}>
              <div className="form-row-2">
                {renderField('creditorAddressLines1', pacsFormVerbiages.CreditorAddressLine1, { placeholder: 'Address', errorFallback: 'Creditor Address Line 1 is required' })}
                {renderField('creditorAddressLines2', pacsFormVerbiages.CreditorAddressLine2, { placeholder: 'Address', errorFallback: 'Creditor Address Line 2 is required' })}
              </div>
              <div className="form-row-3">
                {renderField('creditorStreetName', pacsFormVerbiages.CreditorStreet, { placeholder: 'Enter street name', errorFallback: 'Creditor Street is required' })}
                {renderField('creditorBuildingNumber', pacsFormVerbiages.CreditorBuildingNumber, { errorFallback: 'Creditor Building Number is required', isDualBlind: false })}
                {renderField('creditorTownName', pacsFormVerbiages.CreditorTownOrCityName, { errorFallback: 'Creditor Town / City Name is required' })}
              </div>
              <div className="form-row-3">
                {renderField('creditorCountrySubDivision', pacsFormVerbiages.CreditorCountrySubDivisionLabel, { errorFallback: 'Creditor Sub Division is required' })}
                {renderField('creditorState', pacsFormVerbiages.CreditorState, { errorFallback: 'Creditor State is required' })}
                {renderField('creditorCountryCode', pacsFormVerbiages.CreditorCountry, { placeholder: 'e.g. US, GB', maxLength: 2, errorFallback: 'Creditor Country is required' })}
              </div>
              <div className="form-row-3">
                {renderField('creditorPostalCode', pacsFormVerbiages.CreditorPostalCode, { errorFallback: 'Creditor Postal Code is required' })}
                {renderField('creditorSortCodeUK', pacsFormVerbiages.CreditorSortCode, { errorFallback: 'Creditor Sort Code is required' })}
                {renderField('creditorSortCodeUS', pacsFormVerbiages.CreditorSortCode, { placeholder: '9-digit ABA routing number', errorFallback: 'Creditor Sort Code (ABA) is required' })}
              </div>
            </div>
          </div>

          {/* Section 4 (out-of-order in source, preserved positionally as Intermediary Bank Details) */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('intermediaryBank')}>
              <span>{pacsFormVerbiages.IntermediaryBankDetails}</span>
              <span className="chev">{sectionCollapsed.intermediaryBank ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body ${sectionCollapsed.intermediaryBank ? 'collapsed' : ''}`}>
              {showFirstIntermediaryBank && (
                <>
                  <div className="form-row-3">
                    {/* firstIntermediaryBankBIC confirmed to have NO mandatory-indicator span and
                        NO dual-blind-key wiring, unlike every debtor/creditor field — preserved. */}
                    <div className="form-field">
                      <label className="field-label">{getLabel('firstIntermediaryBankBIC', pacsFormVerbiages.FirstIntermediaryBankSWIFTCode)}</label>
                      <input
                        value={formValues.firstIntermediaryBankBIC ?? ''}
                        placeholder="Enter SWIFT/BIC"
                        readOnly={isFieldReadonly('firstIntermediaryBankBIC')}
                        onChange={(e) => setField('firstIntermediaryBankBIC', e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, firstIntermediaryBankBIC: true }))}
                      />
                      {touched.firstIntermediaryBankBIC && !formValues.firstIntermediaryBankBIC && (
                        <div className="field-error">{getFieldValidationError('firstIntermediaryBankBIC') || 'FirstIntermediary BankBIC required'}</div>
                      )}
                    </div>
                    {renderField('firstIntermediaryBankRoutingCode', pacsFormVerbiages.FirstIntermediaryBankRoutingCode)}
                    {renderField('firstIntermediaryBankName', pacsFormVerbiages.FirstIntermediaryBankName)}
                  </div>
                  <div className="form-row-2">
                    {renderField('firstIntermediaryBankCountryCode', pacsFormVerbiages.FirstIntermediaryBankCountryCode, { maxLength: 2 })}
                    {renderField('firstIntermediaryBankAccountId', pacsFormVerbiages.FirstIntermediaryAccountNumber)}
                  </div>
                </>
              )}
              {showSecondIntermediaryBank && (
                <div className="form-row-3">
                  {renderField('secondIntermediaryBankBIC', pacsFormVerbiages.SecondIntermediaryBankSWIFTCode, { placeholder: 'Enter SWIFT/BIC' })}
                  {renderField('secondIntermediaryBankRoutingCode', pacsFormVerbiages.SecondIntermediaryBankRoutingCode)}
                  {renderField('secondIntermediaryBankName', pacsFormVerbiages.SecondIntermediaryBankName)}
                  {renderField('secondIntermediaryBankCountryCode', pacsFormVerbiages.SecondIntermediaryBankCountryCode, { maxLength: 2 })}
                  {renderField('secondIntermediaryBankAccountId', pacsFormVerbiages.SecondIntermediaryAccountNumber)}
                </div>
              )}
            </div>
          </div>

          {/* Additional Information: charges, payment type, remittance — field
              existence confirmed via parent fieldConfig[] and DEFAULT_VERBIAGES,
              but exact markup/grouping was not independently photographed. */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('additionalInformation')}>
              <span>{pacsFormVerbiages.AdditionalDetails}</span>
              <span className="chev">{sectionCollapsed.additionalInformation ? '\u25B4' : '\u25BE'}</span>
            </div>
            <div className={`section-body ${sectionCollapsed.additionalInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('chargeBearer', pacsFormVerbiages.ChargeDetails, { errorFallback: pacsFormVerbiages.Required, options: CHARGE_BEARER_OPTIONS })}
                {renderField('chargesAmount', pacsFormVerbiages.ChargesAmount)}
                {renderField('chargesAgentBIC', pacsFormVerbiages.ChargesAgentBic)}
              </div>
              <div className="form-row-2">
                {renderField('painPaymentMethodType', pacsFormVerbiages.PaymentType, { errorFallback: pacsFormVerbiages.PaymentTypeIsRequired, options: PAYMENT_TYPE_OPTIONS })}
                {renderField('ustrdPaymentDetails', pacsFormVerbiages.RemittanceInformation)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}
