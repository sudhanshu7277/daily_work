import React, {
  FC,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ChangeEvent,
  MouseEvent
} from 'react';
import {
  Pain001Model,
  PaymentMode,
  PaymentComponentInput,
  PaymentComponentOutput,
  FormFieldConfig,
  FormValidityPayload,
  PAIN001_MANDATORY_FIELDS,
  PAIN001_NUMERIC_FIELDS,
  PAYMENT_TYPE_OPTIONS,
  CHARGE_BEARER_OPTIONS,
  createEmptyPain001
} from '../types/models';
import {
  genericValidator,
  ValidationEffect
} from '../services/genericValidator';
import { addressService } from '../services/addressService';
import { buildPain001FromForm } from '../utils/paymentUtils';
import './payment-flow.css';

export interface SSPaymentFlowProps {
  paymentInput: PaymentComponentInput;
  fieldConfig?: FormFieldConfig[];
  initialData?: Partial<Pain001Model>;
  pacsFormVerbiages?: Record<string, string>;
  loggedInUser?: string;
  isMakerMode?: boolean;
  isCheckerMode?: boolean;
  isRepairMode?: boolean;
  repairReviewFieldList?: string[];
  repairNewlyModifyFieldList?: string[];
  hardcapResultReceived?: { amountWithinLimit: boolean; hardCapValue: number } | string | null;
  onPaymentOutput?: (output: PaymentComponentOutput) => void;
  onFormChange?: (val: Record<string, unknown>) => void;
  onFormValidityChange?: (val: FormValidityPayload) => void;
  onFailedFieldListChange?: (fields: string[]) => void;
  onAmountChange?: (val: { instructedAmountCurrencyCode: string; instructedAmount: number }) => void;
}

export const PaymentChild: FC<SSPaymentFlowProps> = ({
  paymentInput,
  fieldConfig = [],
  initialData,
  pacsFormVerbiages = {},
  isMakerMode,
  isCheckerMode,
  isRepairMode,
  repairReviewFieldList = [],
  repairNewlyModifyFieldList = [],
  hardcapResultReceived,
  onPaymentOutput,
  onFormChange,
  onFormValidityChange,
  onFailedFieldListChange,
  onAmountChange
}) => {
  const selectedMode: PaymentMode = isCheckerMode ? 'checker' : isRepairMode ? 'repair' : 'maker';
  const isChecker = selectedMode === 'checker';
  const isRepair = selectedMode === 'repair';
  const isDualBlindEnabled = paymentInput?.dualBlindKeyFlag === 'Y' && isChecker;

  const configMap = useMemo(() => {
    const map = new Map<string, FormFieldConfig>();
    fieldConfig.forEach(cfg => map.set(cfg.fieldName, cfg));
    return map;
  }, [fieldConfig]);

  const dynamicFieldConfigs = useMemo(() => {
    return fieldConfig.filter(cfg => !PAIN001_MANDATORY_FIELDS.includes(cfg.fieldName));
  }, [fieldConfig]);

  const [formValues, setFormValues] = useState<Pain001Model>(() => {
    const empty = createEmptyPain001() as Record<string, any>;
    const init = { ...(initialData || {}), ...(paymentInput?.paymentModel || {}) } as Record<string, any>;
    const values: Record<string, any> = {};

    fieldConfig.forEach(cfg => {
      const rawVal = cfg.value ?? init[cfg.fieldName] ?? empty[cfg.fieldName] ?? '';
      values[cfg.fieldName] = PAIN001_NUMERIC_FIELDS.includes(cfg.fieldName as any)
        ? (Number(rawVal) || 0)
        : String(rawVal ?? '');
    });

    [
      'debtorAddressLines1',
      'debtorAddressLines2',
      'creditorAddressLines1',
      'creditorAddressLines2',
      'debtorState',
      'creditorState'
    ].forEach(f => {
      if (!(f in values)) {
        values[f] = String(init[f] ?? '');
      }
    });

    return { ...empty, ...values } as Pain001Model;
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<string[]>(paymentInput?.rejectedFieldList || []);
  const [newlyModifiedFields, setNewlyModifiedFields] = useState<string[]>(repairNewlyModifyFieldList);
  const [dualBlindErrors, setDualBlindErrors] = useState<Map<string, string>>(new Map());
  const [isDualBlindPassed, setIsDualBlindPassed] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<Map<string, ValidationEffect>>(new Map());
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' }>>([]);

  const [isDebtorCountryReadonly, setIsDebtorCountryReadonly] = useState<boolean>(false);
  const [isCreditorCountryReadonly, setIsCreditorCountryReadonly] = useState<boolean>(false);
  const [hardcapChecking, setHardcapChecking] = useState<boolean>(false);
  const [hardcapError, setHardcapError] = useState<string>('');
  const [hardcapSuccessMessage, setHardcapSuccessMessage] = useState<string>('');

  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
    paymentDetails: false,
    paymentInformation: false,
    debtorInformation: false,
    debtorAddress: false,
    beneficiaryDetails: false,
    creditorInformation: false,
    creditorAddress: false,
    intermediaryBank: false,
    additionalInformation: false,
    dynamicAdditionalFields: false
  });

  const dualBlindCache = useRef<Map<string, string>>(new Map());
  const debtorBicDebouncer = useRef<NodeJS.Timeout>();
  const creditorBicDebouncer = useRef<NodeJS.Timeout>();
  const debtorAddrDebouncer = useRef<NodeJS.Timeout>();
  const creditorAddrDebouncer = useRef<NodeJS.Timeout>();
  const amountDebouncer = useRef<NodeJS.Timeout>();

  const toggleSection = (sectionKey: string) => {
    setSectionCollapsed(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const setField = useCallback((fieldName: keyof Pain001Model, value: unknown, emitEvent = true) => {
    setFormValues(prev => {
      const isNumeric = PAIN001_NUMERIC_FIELDS.includes(fieldName as any);
      const cleanVal = isNumeric ? (value === '' ? 0 : Number(value)) : value;
      const next = { ...prev, [fieldName]: cleanVal };
      if (emitEvent) {
        onFormChange?.(next as unknown as Record<string, unknown>);
      }
      return next;
    });

    if (isRepair && !newlyModifiedFields.includes(fieldName as string)) {
      setNewlyModifiedFields(prev => [...prev, fieldName as string]);
    }
  }, [isRepair, newlyModifiedFields, onFormChange]);

  useEffect(() => {
    if (isDualBlindEnabled && paymentInput?.paymentModel) {
      dualBlindCache.current.clear();
      paymentInput.dualBlindKeyFields?.forEach(field => {
        const raw = (paymentInput.paymentModel as any)?.[field];
        dualBlindCache.current.set(field, String(raw ?? '').trim());
      });

      setFormValues(prev => {
        const masked = { ...prev };
        paymentInput.dualBlindKeyFields?.forEach(field => {
          (masked as any)[field] = '';
        });
        return masked;
      });
    }
  }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, paymentInput?.paymentModel]);

  const validateSingleDualBlindKeyField = useCallback((fieldName: string) => {
    if (!isDualBlindEnabled || !paymentInput.dualBlindKeyFields?.includes(fieldName)) return;
    const original = dualBlindCache.current.get(fieldName) ?? '';
    const current = String((formValues as any)[fieldName] ?? '').trim();

    setDualBlindErrors(prev => {
      const next = new Map(prev);
      if (original !== current) {
        next.set(fieldName, 'Data does not match');
      } else {
        next.delete(fieldName);
      }
      return next;
    });
  }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]);

  useEffect(() => {
    if (!isDualBlindEnabled) {
      setIsDualBlindPassed(true);
      return;
    }
    const allMatched = (paymentInput.dualBlindKeyFields || []).every(f => {
      const orig = dualBlindCache.current.get(f) ?? '';
      const curr = String((formValues as any)[f] ?? '').trim();
      return orig !== '' && orig === curr;
    });
    setIsDualBlindPassed(allMatched);
  }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]);

  useEffect(() => {
    const rawForm = formValues as unknown as Record<string, unknown>;
    const fieldMap = genericValidator.evaluateAllFields(rawForm);
    const formEffects = genericValidator.evaluateFormRules(rawForm);
    const finalMap = genericValidator.applyToForm(fieldMap, formEffects);
    setValidationResults(finalMap);
  }, [formValues]);

  useEffect(() => {
    if (debtorBicDebouncer.current) clearTimeout(debtorBicDebouncer.current);
    debtorBicDebouncer.current = setTimeout(() => {
      const val = formValues.debtorAgentBIC;
      if (val && val.length >= 6) {
        setIsDebtorCountryReadonly(true);
        setField('debtorCountryCode', val.substring(4, 6).toUpperCase());
      } else {
        setIsDebtorCountryReadonly(false);
      }
    }, 500);
    return () => clearTimeout(debtorBicDebouncer.current);
  }, [formValues.debtorAgentBIC, setField]);

  useEffect(() => {
    if (creditorBicDebouncer.current) clearTimeout(creditorBicDebouncer.current);
    creditorBicDebouncer.current = setTimeout(() => {
      const val = formValues.creditorAgentFinancialInstitutionBIC;
      if (val && val.length >= 6) {
        setIsCreditorCountryReadonly(true);
        setField('creditorCountryCode', val.substring(4, 6).toUpperCase());
      } else {
        setIsCreditorCountryReadonly(false);
      }
    }, 500);
    return () => clearTimeout(creditorBicDebouncer.current);
  }, [formValues.creditorAgentFinancialInstitutionBIC, setField]);

  useEffect(() => {
    if (debtorAddrDebouncer.current) clearTimeout(debtorAddrDebouncer.current);
    debtorAddrDebouncer.current = setTimeout(async () => {
      const { debtorAccountNumber, debtorAgentBIC, debtorCountryCode } = formValues;
      if (!debtorAccountNumber || !/^[A-Z]{2}$/.test(debtorCountryCode || '')) return;

      try {
        const res = await addressService.lookupDebtorAddresss('/shared-services/api/payment/api/payments', {
          account: debtorAccountNumber,
          bic: debtorAgentBIC,
          countryCode: debtorCountryCode
        });

        setFormValues(prev => ({
          ...prev,
          debtorAddressLines1: res.addressLine?.[0] || prev.debtorAddressLines1,
          debtorAddressLines2: res.addressLine?.[1] || prev.debtorAddressLines2,
          debtorStreetName: res.streetName || prev.debtorStreetName,
          debtorBuildingNumber: res.buildingNumber || prev.debtorBuildingNumber,
          debtorPostalCode: res.postalCode || prev.debtorPostalCode,
          debtorTownName: res.townName || prev.debtorTownName,
          debtorCountrySubDivision: res.countrySubDivision || prev.debtorCountrySubDivision,
          debtorState: res.state || prev.debtorState,
          debtorCountryCode: res.countryCode || prev.debtorCountryCode
        }));
      } catch (err) {
        console.error('Debtor address lookup failed:', err);
      }
    }, 300);
    return () => clearTimeout(debtorAddrDebouncer.current);
  }, [formValues.debtorAccountNumber, formValues.debtorAgentBIC, formValues.debtorCountryCode]);

  useEffect(() => {
    if (creditorAddrDebouncer.current) clearTimeout(creditorAddrDebouncer.current);
    creditorAddrDebouncer.current = setTimeout(async () => {
      const { creditorCountryCode, creditorAgentFinancialInstitutionBIC, creditorSortCodeUS, creditorSortCodeUK } = formValues;
      if (!/^[A-Z]{2}$/.test(creditorCountryCode || '')) return;

      let shortCode = '';
      if (creditorCountryCode === 'US') shortCode = creditorSortCodeUS;
      else if (creditorCountryCode === 'GB') shortCode = creditorSortCodeUK;

      try {
        const res = await addressService.lookupCreditorAddesss('/shared-services/api/payment/api/payments', {
          bic: creditorAgentFinancialInstitutionBIC,
          countryCode: creditorCountryCode,
          shortCode
        });

        setFormValues(prev => ({
          ...prev,
          creditorAddressLines1: res.addressLine?.[0] || prev.creditorAddressLines1,
          creditorAddressLines2: res.addressLine?.[1] || prev.creditorAddressLines2,
          creditorStreetName: res.streetName || prev.creditorStreetName,
          creditorBuildingNumber: res.buildingNumber || prev.creditorBuildingNumber,
          creditorPostalCode: res.postalCode || prev.creditorPostalCode,
          creditorTownName: res.townName || prev.creditorTownName,
          creditorCountrySubDivision: res.countrySubDivision || prev.creditorCountrySubDivision,
          creditorState: res.state || prev.creditorState,
          creditorCountryCode: res.countryCode || prev.creditorCountryCode
        }));
      } catch (err) {
        console.error('Creditor address lookup failed:', err);
      }
    }, 300);
    return () => clearTimeout(creditorAddrDebouncer.current);
  }, [formValues.creditorCountryCode, formValues.creditorAgentFinancialInstitutionBIC, formValues.creditorSortCodeUS, formValues.creditorSortCodeUK]);

  const instructedAmountChange = () => {
    if (amountDebouncer.current) clearTimeout(amountDebouncer.current);
    amountDebouncer.current = setTimeout(() => {
      const amount = Number(formValues.instructedAmount);
      if (!amount || isNaN(amount) || amount <= 0) {
        setHardcapChecking(false);
        setHardcapError('');
        setHardcapSuccessMessage('');
        return;
      }
      setHardcapChecking(true);
      onAmountChange?.({
        instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
        instructedAmount: amount
      });
    }, 400);
  };

  const onAmountBlur = () => {
    if (formValues.instructedAmount > 0) {
      onAmountChange?.({
        instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
        instructedAmount: Number(formValues.instructedAmount)
      });
    }
  };

  useEffect(() => {
    if (hardcapResultReceived !== undefined && hardcapResultReceived !== null) {
      setHardcapChecking(false);
      if (typeof hardcapResultReceived === 'string') {
        if (hardcapResultReceived.includes('passed')) {
          setHardcapSuccessMessage(hardcapResultReceived);
          setHardcapError('');
        } else {
          setHardcapError(hardcapResultReceived);
          setHardcapSuccessMessage('');
        }
      } else if (typeof hardcapResultReceived === 'object') {
        if (hardcapResultReceived.amountWithinLimit) {
          setHardcapSuccessMessage('Hardcap limit check passed');
          setHardcapError('');
        } else {
          setHardcapError(`Value cannot be more than ${hardcapResultReceived.hardCapValue}`);
          setHardcapSuccessMessage('');
        }
      }
    }
  }, [hardcapResultReceived]);

  const isFieldReadonly = useCallback((fieldName: keyof Pain001Model) => {
    if (fieldName === 'debtorCountryCode' && isDebtorCountryReadonly) return true;
    if (fieldName === 'debtorCountryCode') return false;
    if (fieldName === 'creditorCountryCode' && isCreditorCountryReadonly) return true;
    if (fieldName === 'creditorCountryCode') return false;

    if (!isChecker) return false;
    if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName as string)) {
      return false;
    }
    return true;
  }, [isDebtorCountryReadonly, isCreditorCountryReadonly, isChecker, isDualBlindEnabled, paymentInput?.dualBlindKeyFields]);

  const handleDoubleClickFailedField = (fieldName: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!isChecker) return;
    if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName)) return;

    setFailedFields(prev => {
      const next = prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName];
      onFailedFieldListChange?.(next);
      return next;
    });
  };

  const isFormValid = useMemo(() => {
    for (const [fName, rule] of validationResults.entries()) {
      if (rule.visible !== false && rule.required) {
        const val = (formValues as any)[fName];
        if (val === '' || val === null || val === undefined || val === 0) return false;
      }
      if (rule.visible !== false && rule.pattern) {
        const val = String((formValues as any)[fName] || '');
        if (val && !new RegExp(rule.pattern).test(val)) return false;
      }
    }

    const hasMissingMandatory = PAIN001_MANDATORY_FIELDS.some(f => {
      const val = (formValues as any)[f];
      return val === '' || val === null || val === undefined || val === 0;
    });
    if (hasMissingMandatory) return false;

    if (isChecker && isDualBlindEnabled && !isDualBlindPassed) return false;
    if (isChecker && failedFields.length > 0) return false;
    if (hardcapError) return false;

    return true;
  }, [validationResults, formValues, isChecker, isDualBlindEnabled, isDualBlindPassed, failedFields, hardcapError]);

  useEffect(() => {
    const payload: PaymentComponentOutput = {
      paymentData: buildPain001FromForm(formValues),
      isValid: isFormValid,
      outputMessage: isFormValid ? 'Valid' : 'Invalid form requirements',
      dualBlindKeyResult: isDualBlindEnabled ? (isDualBlindPassed ? 'passed' : 'failed') : null,
      isDualBlindKeyPassed: isDualBlindPassed
    };

    onPaymentOutput?.(payload);
    onFormValidityChange?.({
      validForm: isFormValid,
      makerPayload: formValues as unknown as Record<string, unknown>
    });
  }, [isFormValid, formValues, isDualBlindEnabled, isDualBlindPassed, onPaymentOutput, onFormValidityChange]);

  const renderField = (
    fieldName: keyof Pain001Model,
    defaultLabel: string,
    opts: {
      type?: 'text' | 'number' | 'date' | 'textarea';
      options?: readonly string[] | string[];
      placeholder?: string;
      maxLength?: number;
      errorFallback?: string;
      isDualBlind?: boolean;
    } = {}
  ) => {
    const rule = validationResults.get(fieldName as string);
    if (rule?.visible === false) return null;
    if (paymentInput?.hideFieldsList?.includes(fieldName as string)) return null;

    const value = (formValues as any)[fieldName] ?? '';
    const isRequired = rule?.required ?? configMap.get(fieldName as string)?.required ?? PAIN001_MANDATORY_FIELDS.includes(fieldName as string);
    const isReadonly = isFieldReadonly(fieldName);
    const hasDualBlindErr = dualBlindErrors.has(fieldName as string);
    const isFailed = failedFields.includes(fieldName as string);
    const isRepairHighlight = isRepair && repairReviewFieldList.includes(fieldName as string);
    const isNewlyMod = isRepair && newlyModifiedFields.includes(fieldName as string);

    const containerClass = [
      'form-field',
      isFailed && 'failed-field',
      isRepairHighlight && 'repair-review-field',
      isNewlyMod && 'repair-newly-modify-field'
    ].filter(Boolean).join(' ');

    const labelClass = ['field-label', isFailed && 'rejected'].filter(Boolean).join(' ');

    return (
      <div
        key={fieldName as string}
        className={containerClass}
        onDoubleClick={e => handleDoubleClickFailedField(fieldName as string, e)}
      >
        <label className={labelClass}>
          {pacsFormVerbiages[fieldName as string] || defaultLabel}
          {isRequired && <span className="mandatory-indicator"> *</span>}
        </label>

        {opts.options ? (
          <select
            value={value}
            disabled={isReadonly}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setField(fieldName, e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, [fieldName]: true }))}
          >
            <option value="">{opts.placeholder || `-- Select ${defaultLabel} --`}</option>
            {opts.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : opts.type === 'textarea' ? (
          <textarea
            value={value}
            rows={3}
            readOnly={isReadonly}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${defaultLabel}`}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setField(fieldName, e.target.value)}
            onBlur={() => {
              setTouched(t => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        ) : (
          <input
            type={opts.type || 'text'}
            value={value}
            readOnly={isReadonly}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${defaultLabel}`}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField(fieldName, e.target.value)}
            onBlur={() => {
              setTouched(t => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        )}

        {hasDualBlindErr && (
          <div className="field-error dual-blind-error">{dualBlindErrors.get(fieldName as string)}</div>
        )}
        {touched[fieldName as string] && isRequired && !value && (
          <div className="field-error">{opts.errorFallback || `${defaultLabel} is required`}</div>
        )}
        {touched[fieldName as string] && rule?.pattern && value && !new RegExp(rule.pattern).test(String(value)) && (
          <div className="field-error">{rule.patternMessage || 'Invalid format'}</div>
        )}
      </div>
    );
  };

  const showFirstIntermediaryBank = validationResults.get('firstIntermediaryBankBIC')?.visible !== false;
  const showSecondIntermediaryBank = Boolean(formValues.firstIntermediaryBankBIC) && validationResults.get('secondIntermediaryBankBIC')?.visible !== false;

  return (
    <div className="ss-payment-flow">
      {/* MEGA-SECTION 1: Payment Details (Debtor Side) */}
      <div className="section-main noBorders">
        <div className="section-main-header" onClick={() => toggleSection('paymentDetails')}>
          <span>{pacsFormVerbiages.PaymentDetails || 'Payment Details'}</span>
          <span className="chev">{sectionCollapsed.paymentDetails ? '\u25B4' : '\u25BE'}</span>
        </div>

        <div className={`section-main-body ${sectionCollapsed.paymentDetails ? 'collapsed' : ''}`}>
          {/* Section 1: Payment Information */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('paymentInformation')}>
              <span>{pacsFormVerbiages.PaymentInformation || 'Payment Information'}</span>
              <span className="chev">{sectionCollapsed.paymentInformation ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.paymentInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('painPaymentMethodType', pacsFormVerbiages.PaymentType || 'Payment Type', {
                  options: PAYMENT_TYPE_OPTIONS,
                  errorFallback: pacsFormVerbiages.PaymentTypeIsRequired || 'Payment Type is required'
                })}
                {renderField('requestedExecutionDate', pacsFormVerbiages.ValueDate || 'Value Date', {
                  type: 'date',
                  errorFallback: pacsFormVerbiages.ValueDateIsRequired || 'Value Date is required'
                })}
                {renderField('instructedAmountCurrencyCode', pacsFormVerbiages.Currency || 'Currency', {
                  errorFallback: pacsFormVerbiages.CurrencyIsRequired || 'Currency is required'
                })}
              </div>

              <div className="form-field">
                <label className="field-label">
                  {pacsFormVerbiages.TransactionAmount || 'Transaction Amount'}
                  <span className="mandatory-indicator"> *</span>
                </label>
                <input
                  type="number"
                  value={formValues.instructedAmount ?? ''}
                  readOnly={isFieldReadonly('instructedAmount')}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setField('instructedAmount', e.target.value)}
                  onInput={instructedAmountChange}
                  onBlur={() => {
                    instructedAmountChange();
                    validateSingleDualBlindKeyField('instructedAmount');
                    onAmountBlur();
                  }}
                />
                {hardcapChecking && <div className="hint">{pacsFormVerbiages.ValidatingHardcapLimit || 'Validating hardcap limit...'}</div>}
                {hardcapError && <div className="field-error">{hardcapError}</div>}
                {hardcapSuccessMessage && <div className="success-message">{hardcapSuccessMessage}</div>}
              </div>
            </div>
          </div>

          {/* Section 2: Debtor Information */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('debtorInformation')}>
              <span>{pacsFormVerbiages.DebtorInfo || 'Debtor Information'}</span>
              <span className="chev">{sectionCollapsed.debtorInformation ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.debtorInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('debtorName', pacsFormVerbiages.DebtorName || 'Debtor Name', {
                  errorFallback: pacsFormVerbiages.DebtorNameIsRequired || 'Debtor Name is required'
                })}
                {renderField('debtorAccountNumber', pacsFormVerbiages.DebtorAccountNumber || 'Debtor Account Number', {
                  errorFallback: pacsFormVerbiages.DebtorAccountNumberIsRequired || 'Debtor Account Number is required'
                })}
                {renderField('debtorAgentBIC', pacsFormVerbiages.DebtorAgentBIC || 'Debtor Agent BIC', {
                  errorFallback: pacsFormVerbiages.DebtorAgentBicIsRequired || 'Debtor Agent BIC is required'
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Debtor Address Details */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('debtorAddress')}>
              <span>{pacsFormVerbiages.DebtorAddressDetails || 'Debtor Address Details'}</span>
              <span className="chev">{sectionCollapsed.debtorAddress ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.debtorAddress ? 'collapsed' : ''}`}>
              <div className="form-row-2">
                {renderField('debtorAddressLines1', pacsFormVerbiages.DebtorAddressLine1 || 'Debtor Address Line 1', { placeholder: 'Address 1' })}
                {renderField('debtorAddressLines2', pacsFormVerbiages.DebtorAddressLine2 || 'Debtor Address Line 2', { placeholder: 'Address 2' })}
              </div>

              <div className="form-row-3">
                {renderField('debtorStreetName', pacsFormVerbiages.DebtorStreet || 'Debtor Street', { errorFallback: 'Debtor Street is required' })}
                {renderField('debtorBuildingNumber', pacsFormVerbiages.DebtorBuildingNumber || 'Debtor Building Number', { isDualBlind: false })}
                {renderField('debtorTownName', pacsFormVerbiages.DebtorTownOrCityName || 'Debtor Town / City Name')}
              </div>

              <div className="form-row-3">
                {renderField('debtorCountrySubDivision', pacsFormVerbiages.DebtorCountrySubDivisionLabel || 'Debtor State')}
                {renderField('debtorState', pacsFormVerbiages.DebtorState || 'Debtor State')}
                {renderField('debtorCountryCode', pacsFormVerbiages.DebtorCountry || 'Debtor Country', { maxLength: 2 })}
              </div>

              <div className="form-row-3">
                {renderField('debtorPostalCode', pacsFormVerbiages.DebtorPostalCode || 'Debtor Postal Code')}
                {renderField('debtorSortCodeUK', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (UK)')}
                {renderField('debtorSortCodeUS', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (US)')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEGA-SECTION 2: Beneficiary Details (Creditor + Intermediary Side) */}
      <div className="section-main">
        <div className="section-main-header" onClick={() => toggleSection('beneficiaryDetails')}>
          <span>{pacsFormVerbiages.BeneficiaryDetails || 'Beneficiary Details'}</span>
          <span className="chev">{sectionCollapsed.beneficiaryDetails ? '\u25B4' : '\u25BE'}</span>
        </div>

        <div className={`section-main-body ${sectionCollapsed.beneficiaryDetails ? 'collapsed' : ''}`}>
          {/* Section 5: Creditor Information */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('creditorInformation')}>
              <span>{pacsFormVerbiages.CreditorInformation || 'Creditor Information'}</span>
              <span className="chev">{sectionCollapsed.creditorInformation ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.creditorInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('creditorName', pacsFormVerbiages.CreditorName || 'Creditor Name', {
                  errorFallback: pacsFormVerbiages.CreditorNameIsRequired || 'Creditor Name is required'
                })}
                {renderField('creditorAccount', pacsFormVerbiages.CreditorAccountNumber || 'Creditor Account Number', {
                  errorFallback: pacsFormVerbiages.CreditorAccountNumberIsRequired || 'Creditor Account Number is required'
                })}
                {renderField('creditorAgentFinancialInstitutionBIC', pacsFormVerbiages.CreditorAgentBIC || 'Creditor Agent BIC', {
                  errorFallback: pacsFormVerbiages.Required || 'Required'
                })}
              </div>

              <div className="form-row-3">
                {renderField('creditorAgentFinancialInstitutionName', pacsFormVerbiages.CreditorAgentBankName || 'Creditor Agent Bank Name', {
                  errorFallback: pacsFormVerbiages.Required || 'Required'
                })}
                {renderField('creditorAgentPostalAddress', 'Creditor Agent Account Number', {
                  errorFallback: pacsFormVerbiages.Required || 'Required'
                })}
              </div>
            </div>
          </div>

          {/* Section 6: Creditor Address Details */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('creditorAddress')}>
              <span>{pacsFormVerbiages.CreditorAddressDetails || 'Creditor Address Details'}</span>
              <span className="chev">{sectionCollapsed.creditorAddress ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.creditorAddress ? 'collapsed' : ''}`}>
              <div className="form-row-2">
                {renderField('creditorAddressLines1', pacsFormVerbiages.CreditorAddressLine1 || 'Creditor Address Line 1', {
                  errorFallback: 'Creditor Address Line 1 is required'
                })}
                {renderField('creditorAddressLines2', pacsFormVerbiages.CreditorAddressLine2 || 'Creditor Address Line 2')}
              </div>

              <div className="form-row-3">
                {renderField('creditorStreetName', pacsFormVerbiages.CreditorStreet || 'Creditor Street')}
                {renderField('creditorBuildingNumber', pacsFormVerbiages.CreditorBuildingNumber || 'Creditor Building Number', { isDualBlind: false })}
                {renderField('creditorTownName', pacsFormVerbiages.CreditorTownOrCityName || 'Creditor Town / City Name')}
              </div>

              <div className="form-row-3">
                {renderField('creditorCountrySubDivision', pacsFormVerbiages.CreditorCountrySubDivisionLabel || 'Creditor State')}
                {renderField('creditorState', pacsFormVerbiages.CreditorState || 'Creditor State')}
                {renderField('creditorCountryCode', pacsFormVerbiages.CreditorCountry || 'Creditor Country', { maxLength: 2 })}
              </div>

              <div className="form-row-3">
                {renderField('creditorPostalCode', pacsFormVerbiages.CreditorPostalCode || 'Creditor Postal Code')}
                {renderField('creditorSortCodeUK', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (UK)')}
                {renderField('creditorSortCodeUS', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (US)')}
              </div>
            </div>
          </div>

          {/* Section 4: Intermediary Bank Routing */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('intermediaryBank')}>
              <span>{pacsFormVerbiages.IntermediaryBankDetails || 'Intermediary Bank Details'}</span>
              <span className="chev">{sectionCollapsed.intermediaryBank ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.intermediaryBank ? 'collapsed' : ''}`}>
              {showFirstIntermediaryBank && (
                <>
                  <div className="form-row-3">
                    <div className="form-field">
                      <label className="field-label">
                        {pacsFormVerbiages.FirstIntermediaryBankSWIFTCode || '1st Intermediary Bank SWIFT Code'}
                      </label>
                      <input
                        value={formValues.firstIntermediaryBankBIC ?? ''}
                        placeholder="Enter SWIFT/BIC"
                        readOnly={isFieldReadonly('firstIntermediaryBankBIC')}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setField('firstIntermediaryBankBIC', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, firstIntermediaryBankBIC: true }))}
                      />
                      {touched.firstIntermediaryBankBIC && !formValues.firstIntermediaryBankBIC && (
                        <div className="field-error">First Intermediary Bank BIC is required</div>
                      )}
                    </div>
                    {renderField('firstIntermediaryBankRoutingCode', pacsFormVerbiages.FirstIntermediaryBankRoutingCode || '1st Intermediary Routing Code')}
                    {renderField('firstIntermediaryBankName', pacsFormVerbiages.FirstIntermediaryBankName || '1st Intermediary Bank Name')}
                  </div>

                  <div className="form-row-2">
                    {renderField('firstIntermediaryBankCountryCode', pacsFormVerbiages.FirstIntermediaryBankCountryCode || '1st Intermediary Country Code', { maxLength: 2 })}
                    {renderField('firstIntermediaryBankAccountNumber', pacsFormVerbiages.FirstIntermediaryAccountNumber || '1st Intermediary Account Number')}
                  </div>
                </>
              )}

              {showSecondIntermediaryBank && (
                <div className="form-row-3">
                  {renderField('secondIntermediaryBankBIC', pacsFormVerbiages.SecondIntermediaryBankSWIFTCode || '2nd Intermediary SWIFT Code')}
                  {renderField('secondIntermediaryBankRoutingCode', pacsFormVerbiages.SecondIntermediaryBankRoutingCode || '2nd Intermediary Routing Code')}
                  {renderField('secondIntermediaryBankName', pacsFormVerbiages.SecondIntermediaryBankName || '2nd Intermediary Bank Name')}
                  {renderField('secondIntermediaryBankCountryCode', pacsFormVerbiages.SecondIntermediaryBankCountryCode || '2nd Intermediary Country Code', { maxLength: 2 })}
                  {renderField('secondIntermediaryBankAccountNumber', pacsFormVerbiages.SecondIntermediaryAccountNumber || '2nd Intermediary Account Number')}
                </div>
              )}
            </div>
          </div>

          {/* Section 8: Charges & Additional Remittance Details */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('additionalInformation')}>
              <span>{pacsFormVerbiages.AdditionalDetails || 'Additional Details'}</span>
              <span className="chev">{sectionCollapsed.additionalInformation ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.additionalInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('chargeBearer', pacsFormVerbiages.ChargeDetails || 'Charge Details', {
                  options: CHARGE_BEARER_OPTIONS,
                  errorFallback: pacsFormVerbiages.Required || 'Required'
                })}
                {renderField('chargesAmount', pacsFormVerbiages.ChargesAmount || 'Charges Amount', { type: 'number' })}
                {renderField('chargesAgentBIC', pacsFormVerbiages.ChargesAgentBic || 'Charges Agent BIC')}
              </div>

              <div className="form-row-2">
                {renderField('painPaymentMethodType', pacsFormVerbiages.PaymentType || 'Payment Type', {
                  options: PAYMENT_TYPE_OPTIONS,
                  errorFallback: pacsFormVerbiages.PaymentTypeIsRequired || 'Payment Type is required'
                })}
                {renderField('ustrdPaymentDetails', pacsFormVerbiages.RemittanceInformation || 'Remittance Information', { type: 'textarea' })}
              </div>
            </div>
          </div>

          {/* Dynamic FieldConfig Custom Extensibility Section */}
          {dynamicFieldConfigs.length > 0 && (
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('dynamicAdditionalFields')}>
                <span>{pacsFormVerbiages.AdditionalFields || 'Additional Fields'}</span>
                <span className="chev">{sectionCollapsed.dynamicAdditionalFields ? '\u25B4' : '\u25BE'}</span>
              </div>

              <div className={`section-body ${sectionCollapsed.dynamicAdditionalFields ? 'collapsed' : ''}`}>
                <div className="form-row-2">
                  {dynamicFieldConfigs.map(cfg =>
                    renderField(cfg.fieldName as keyof Pain001Model, cfg.label ?? cfg.fieldName, {
                      options: cfg.options,
                      type: cfg.type
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentChild;