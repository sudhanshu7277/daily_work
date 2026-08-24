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
import '../styles/index.css';
import {
  PaymentComponentInput,
  FormFieldConfig,
  Pain001Model,
  PaymentComponentOutput,
  FormValidityPayload,
  PaymentMode,
  createEmptyPain001,
  PAIN001_MANDATORY_FIELDS,
  PAYMENT_TYPE_OPTIONS,
  CHARGE_BEARER_OPTIONS
} from '../models/models';
import {
  ValidationEffect,
  genericValidator,
  addressService,
  LATAM_COUNTRIES
} from '../services';
import { buildPain001FromForm } from '../utils';

export interface SSPaymentFlowProps {
  paymentInput?: PaymentComponentInput;
  fieldConfig?: FormFieldConfig[];
  initialData?: Partial<Pain001Model>;
  pacsFormVerbiages?: Record<string, string>;
  loggedInUser?: string;
  isMakerMode?: boolean;
  isCheckerMode?: boolean;
  isRepairMode?: boolean;
  repairReviewFieldList?: string[];
  repairNewlyModifyFieldList?: string[];
  hardcapResultReceived?: { amountWithinLimit?: boolean; hardCapValue?: number } | string | null;
  onPaymentOutput?: (output: PaymentComponentOutput) => void;
  onFormChange?: (val: Record<string, unknown>) => void;
  onFormValidityChange?: (val: FormValidityPayload) => void;
  onFailedFieldListChange?: (fields: string[]) => void;
  onAmountChange?: (val: { instructedAmountCurrencyCode: string; instructedAmount: number }) => void;
}

export const SSPaymentFlow: FC<SSPaymentFlowProps> = ({
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
  const selectedMode: PaymentMode = isMakerMode
    ? 'maker'
    : isCheckerMode
    ? 'checker'
    : isRepairMode
    ? 'repair'
    : 'maker';

  const isChecker = selectedMode === 'checker';
  const isRepair = selectedMode === 'repair';
  const isMaker = selectedMode === 'maker';
  const isDualBlindEnabled = paymentInput?.dualBlindKeyFlag === 'Y' && isChecker;

  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

  const configMap = useMemo(() => {
    const map = new Map<string, FormFieldConfig>();
    fieldConfig.forEach(cfg => map.set(cfg.fieldName, cfg));
    return map;
  }, [fieldConfig]);

  // Form Values Initialization
  const [formValues, setFormValues] = useState<Pain001Model>(() => {
    const empty = createEmptyPain001() as Record<string, any>;
    const init = {
      ...(initialData || {}),
      ...(paymentInput?.paymentModel || {})
    } as Record<string, any>;

    const values: Record<string, any> = {};

    fieldConfig.forEach(cfg => {
      values[cfg.fieldName] = cfg.value ?? init[cfg.fieldName] ?? empty[cfg.fieldName] ?? '';
    });

    if (!values.painPaymentMethodType) values.painPaymentMethodType = init.painPaymentMethodType || empty.painPaymentMethodType || 'CBT';
    if (!values.instructedAmountCurrencyCode) values.instructedAmountCurrencyCode = init.instructedAmountCurrencyCode || paymentInput?.currency || 'USD';
    if (!values.requestedExecutionDate) values.requestedExecutionDate = init.requestedExecutionDate || todayDateString;
    if (!values.debtorName && init.debtorName) values.debtorName = init.debtorName;
    if (!values.debtorAccountNumber && init.debtorAccountNumber) values.debtorAccountNumber = init.debtorAccountNumber;
    if (!values.instructedAmount && (init.instructedAmount || (paymentInput as any)?.amount)) {
      values.instructedAmount = init.instructedAmount || (paymentInput as any)?.amount;
    }
    if (!values.chargeBearer) values.chargeBearer = init.chargeBearer || 'DEBT';

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

  // Keep state synchronized with async props
  useEffect(() => {
    const source = (paymentInput?.paymentModel || initialData) as Record<string, any>;
    if (source && Object.keys(source).length > 0) {
      setFormValues(prev => ({
        ...prev,
        ...source,
        debtorName: source.debtorName || prev.debtorName,
        debtorAccountNumber: source.debtorAccountNumber || prev.debtorAccountNumber,
        instructedAmount: source.instructedAmount || (paymentInput as any)?.amount || prev.instructedAmount,
        instructedAmountCurrencyCode: source.instructedAmountCurrencyCode || paymentInput?.currency || prev.instructedAmountCurrencyCode || 'USD',
        painPaymentMethodType: source.painPaymentMethodType || prev.painPaymentMethodType || 'CBT',
        requestedExecutionDate: source.requestedExecutionDate || prev.requestedExecutionDate || todayDateString
      }));
    }
  }, [paymentInput?.paymentModel, initialData, paymentInput?.currency, todayDateString]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<string[]>(
    () => (paymentInput as any)?.rejectedFieldList || []
  );
  const [newlyModifiedFields, setNewlyModifiedFields] = useState<string[]>(
    () => (repairNewlyModifyFieldList as string[]) || []
  );
  const [dualBlindErrors, setDualBlindErrors] = useState<Map<string, string>>(new Map());
  const [isDualBlindPassed, setIsDualBlindPassed] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<Map<string, ValidationEffect>>(new Map());

  const [isDebtorCountryReadonly, setIsDebtorCountryReadonly] = useState<boolean>(false);
  const [isCreditorCountryReadonly, setIsCreditorCountryReadonly] = useState<boolean>(false);
  const [showSecondIntermediary, setShowSecondIntermediary] = useState<boolean>(false);

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
    additionalDetails: false,
    chargeDetails: false,
    taxDetails: false
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

  const setField = useCallback(
    (fieldName: keyof Pain001Model, value: unknown, emitEvent = true) => {
      setFormValues(prev => {
        if ((prev as any)[fieldName] === value) return prev;
        return { ...prev, [fieldName]: value };
      });

      if (isRepair) {
        setNewlyModifiedFields(prev =>
          prev.includes(fieldName as string) ? prev : [...prev, fieldName as string]
        );
      }

      if (emitEvent) {
        queueMicrotask(() => {
          setFormValues(latest => {
            onFormChange?.(latest as unknown as Record<string, unknown>);
            return latest;
          });
        });
      }
    },
    [isRepair, onFormChange]
  );

  // Initialize Dual Blind Cache (Checker)
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

  const validateSingleDualBlindKeyField = useCallback(
    (fieldName: string) => {
      if (!isDualBlindEnabled || !paymentInput?.dualBlindKeyFields?.includes(fieldName)) return;
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
    },
    [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]
  );

  useEffect(() => {
    if (!isDualBlindEnabled) {
      setIsDualBlindPassed(true);
      return;
    }
    const allMatched = (paymentInput?.dualBlindKeyFields || []).every(f => {
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

  // Debtor BIC Derivation
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
    }, 400);
    return () => clearTimeout(debtorBicDebouncer.current);
  }, [formValues.debtorAgentBIC, setField]);

  // Creditor BIC Derivation
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
    }, 400);
    return () => clearTimeout(creditorBicDebouncer.current);
  }, [formValues.creditorAgentFinancialInstitutionBIC, setField]);

  // Debtor Address Lookup
  useEffect(() => {
    if (isChecker) return;
    if (debtorAddrDebouncer.current) clearTimeout(debtorAddrDebouncer.current);
    debtorAddrDebouncer.current = setTimeout(async () => {
      const { debtorAccountNumber, debtorAgentBIC, debtorCountryCode } = formValues;
      if (!debtorAccountNumber || !/^[A-Z]{2}$/.test(debtorCountryCode || '')) return;

      try {
        const lookupFn =
          (addressService as any).lookupDebtorAddress || (addressService as any).lookupDebtorAddresss;
        const res = await lookupFn.call(addressService, '/shared-services/api/payment/api/payments', {
          account: debtorAccountNumber,
          bic: debtorAgentBIC,
          countryCode: debtorCountryCode
        });

        if (res) {
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
        }
      } catch (err) {
        console.warn('Debtor address lookup failed:', err);
      }
    }, 300);

    return () => clearTimeout(debtorAddrDebouncer.current);
  }, [formValues.debtorAccountNumber, formValues.debtorAgentBIC, formValues.debtorCountryCode, isChecker]);

  // Creditor Address Lookup
  useEffect(() => {
    if (isChecker) return;
    if (creditorAddrDebouncer.current) clearTimeout(creditorAddrDebouncer.current);
    creditorAddrDebouncer.current = setTimeout(async () => {
      const {
        creditorAccount,
        creditorCountryCode,
        creditorAgentFinancialInstitutionBIC,
        creditorSortCodeUS,
        creditorSortCodeUK
      } = formValues;

      if (!creditorAccount || !/^[A-Z]{2}$/.test(creditorCountryCode || '')) return;

      let shortCode = '';
      if (creditorCountryCode === 'US') shortCode = creditorSortCodeUS || '';
      else if (creditorCountryCode === 'GB') shortCode = creditorSortCodeUK || '';

      try {
        const lookupFn =
          (addressService as any).lookupCreditorAddress ||
          (addressService as any).lookupCreditorAddresss;
        if (typeof lookupFn === 'function') {
          const res = await lookupFn.call(
            addressService,
            '/shared-services/api/payment/api/payments',
            {
              account: creditorAccount,
              bic: creditorAgentFinancialInstitutionBIC || '',
              countryCode: creditorCountryCode || '',
              shortCode
            }
          );

          if (res) {
            setFormValues(prev => ({
              ...prev,
              creditorAddressLines1: res.addressLine?.[0] || prev.creditorAddressLines1,
              creditorAddressLines2: res.addressLine?.[1] || prev.creditorAddressLines2,
              creditorStreetName: res.streetName || prev.creditorStreetName,
              creditorBuildingNumber: res.buildingNumber || prev.creditorBuildingNumber,
              creditorPostalCode: res.postalCode || prev.creditorPostalCode,
              creditorTownName: res.townName || prev.creditorTownName
            }));
          }
        }
      } catch (err) {
        console.warn('Creditor address lookup failed:', err);
      }
    }, 300);

    return () => clearTimeout(creditorAddrDebouncer.current);
  }, [
    formValues.creditorAccount,
    formValues.creditorCountryCode,
    formValues.creditorAgentFinancialInstitutionBIC,
    formValues.creditorSortCodeUS,
    formValues.creditorSortCodeUK,
    isChecker
  ]);

  const instructedAmountChange = (rawInputVal?: string) => {
    if (amountDebouncer.current) clearTimeout(amountDebouncer.current);
    amountDebouncer.current = setTimeout(() => {
      const valToParse =
        rawInputVal !== undefined ? rawInputVal : String(formValues.instructedAmount ?? '');
      const parsedAmount = parseFloat(valToParse);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setHardcapChecking(false);
        setHardcapError('');
        setHardcapSuccessMessage('');
        return;
      }

      setHardcapChecking(true);
      onAmountChange?.({
        instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
        instructedAmount: parsedAmount
      });
    }, 400);
  };

  const onAmountBlur = () => {
    const parsedAmount = parseFloat(String(formValues.instructedAmount ?? ''));
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onAmountChange?.({
        instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
        instructedAmount: parsedAmount
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
          setHardcapError(`Value cannot be more than $${hardcapResultReceived.hardCapValue}`);
          setHardcapSuccessMessage('');
        }
      }
    }
  }, [hardcapResultReceived]);

  const isFieldReadonly = useCallback(
    (fieldName: keyof Pain001Model): boolean => {
      const cfg = configMap.get(fieldName as string);
      if (cfg && cfg.disabled !== undefined) {
        return Boolean(cfg.disabled);
      }

      const val = (formValues as any)[fieldName];
      const isFieldEmpty = val === undefined || val === null || String(val).trim() === '';
      const isRequired =
        PAIN001_MANDATORY_FIELDS.includes(fieldName as string) ||
        Boolean(configMap.get(fieldName as string)?.required);

      if (isFieldEmpty && isRequired && !isChecker) {
        return false;
      }

      if (isMaker) {
        return false;
      }

      if (isChecker) {
        if (fieldName === 'debtorCountryCode') return true;
        if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName as string)) {
          return false;
        }
        return true;
      }

      if (fieldName === 'debtorCountryCode' && isDebtorCountryReadonly) return true;
      if (fieldName === 'debtorCountryCode') return false;
      if (fieldName === 'creditorCountryCode' && isCreditorCountryReadonly) return true;
      if (fieldName === 'creditorCountryCode') return false;

      if (isRepair) {
        if (repairReviewFieldList && repairReviewFieldList.length > 0) {
          return !repairReviewFieldList.includes(fieldName as string);
        }
        return false;
      }

      return false;
    },
    [
      isMaker,
      isChecker,
      isDualBlindEnabled,
      paymentInput?.dualBlindKeyFields,
      isDebtorCountryReadonly,
      isCreditorCountryReadonly,
      isRepair,
      repairReviewFieldList,
      configMap,
      formValues
    ]
  );

  const handleDoubleClickFailedField = (fieldName: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!isChecker) return;
    if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName)) return;

    setFailedFields(prev => {
      const next = prev.includes(fieldName) ? prev.filter(f => f !== fieldName) : [...prev, fieldName];
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

    queueMicrotask(() => {
      onPaymentOutput?.(payload);
      onFormValidityChange?.({
        validForm: isFormValid,
        makerPayload: formValues as unknown as Record<string, unknown>
      });
    });
  }, [isFormValid, formValues, isDualBlindEnabled, isDualBlindPassed, onPaymentOutput, onFormValidityChange]);

  // Reusable Field Rendering Engine with Full Testing Library Accessibility & Label Overrides
  const renderField = (
    fieldName: keyof Pain001Model,
    defaultLabel: string,
    opts: {
      type?: 'text' | 'number' | 'date' | 'textarea' | string;
      options?: readonly string[] | string[];
      placeholder?: string;
      maxLength?: number;
      minDate?: string;
      errorFallback?: string;
      autoUppercase?: boolean;
      numericOnly?: boolean;
    } = {}
  ) => {
    const rule = validationResults.get(fieldName as string);
    if (rule?.visible === false) return null;
    if (paymentInput?.hideFieldsList?.includes(fieldName as string)) return null;

    const value = (formValues as any)[fieldName] ?? '';
    const isRequired = Boolean(
      rule?.required ??
        configMap.get(fieldName as string)?.required ??
        PAIN001_MANDATORY_FIELDS.includes(fieldName as string)
    );

    const isReadonly = isFieldReadonly(fieldName);
    const showMandatoryIndicator = isChecker ? !isReadonly && isRequired : isRequired;

    const hasDualBlindErr = dualBlindErrors.has(fieldName as string);
    const isFailed = failedFields.includes(fieldName as string);
    const isRepairHighlight = isRepair && repairReviewFieldList.includes(fieldName as string);
    const isNewlyMod = isRepair && newlyModifiedFields.includes(fieldName as string);

    const isPatternInvalid = Boolean(
      touched[fieldName as string] &&
        rule?.pattern &&
        value &&
        !new RegExp(rule.pattern).test(String(value))
    );

    const isRequiredMissing = Boolean(touched[fieldName as string] && isRequired && !value);
    const hasInputError = isPatternInvalid || isRequiredMissing || hasDualBlindErr || isFailed;

    const containerClass = [
      'form-field',
      hasInputError && 'field-invalid',
      isFailed && 'failed-field',
      isRepairHighlight && 'repair-review-field',
      isNewlyMod && 'repair-newly-modify-field'
    ]
      .filter(Boolean)
      .join(' ');

    const labelClass = ['field-label', isFailed && 'rejected'].filter(Boolean).join(' ');

    // Prioritize pacsFormVerbiages -> configMap.label -> defaultLabel
    const resolvedLabel =
      pacsFormVerbiages[fieldName as string] ||
      configMap.get(fieldName as string)?.label ||
      defaultLabel;

    const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (opts.numericOnly) {
        val = val.replace(/\D/g, '');
      }
      if (opts.autoUppercase) {
        val = val.toUpperCase();
      }
      setField(fieldName, val);
    };

    return (
      <div
        key={fieldName as string}
        className={containerClass}
        onDoubleClick={e => handleDoubleClickFailedField(fieldName as string, e)}
      >
        <label htmlFor={fieldName as string} className={labelClass}>
          {resolvedLabel}
          {showMandatoryIndicator && <span className="mandatory-indicator">*</span>}
        </label>

        {opts.options ? (
          <select
            id={fieldName as string}
            name={fieldName as string}
            value={value}
            disabled={isReadonly}
            className={hasInputError ? 'input-error' : ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setField(fieldName, e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, [fieldName]: true }))}
          >
            <option value="">{opts.placeholder || `-- Select ${resolvedLabel} --`}</option>
            {opts.options.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : opts.type === 'textarea' ? (
          <textarea
            id={fieldName as string}
            name={fieldName as string}
            value={value}
            rows={3}
            readOnly={isReadonly}
            className={hasInputError ? 'input-error' : ''}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
            onChange={handleTextChange}
            onBlur={() => {
              setTouched(t => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        ) : (
          <input
            id={fieldName as string}
            name={fieldName as string}
            type={opts.type || 'text'}
            value={value}
            readOnly={isReadonly}
            min={opts.minDate}
            className={hasInputError ? 'input-error' : ''}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
            onChange={handleTextChange}
            onBlur={() => {
              setTouched(t => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        )}

        {hasDualBlindErr && (
          <div className="field-error dual-blind-error">
            {dualBlindErrors.get(fieldName as string)}
          </div>
        )}
        {isRequiredMissing && (
          <div className="field-error">{opts.errorFallback || `${resolvedLabel} is required`}</div>
        )}
        {isPatternInvalid && (
          <div className="field-error">{rule?.patternMessage || 'Invalid format'}</div>
        )}
      </div>
    );
  };

  const isIntermediaryVisible = formValues.painPaymentMethodType !== 'BKT';
  const debtorBicCountry = (formValues.debtorAgentBIC || '').substring(4, 6).toUpperCase();
  const showTaxDetails = LATAM_COUNTRIES.includes(debtorBicCountry);

  return (
    <div className="ss-payment-flow">
      {/* MEGA-SECTION 1: Payment Details (Debtor Side) */}
      <div className="section-main noBorders">
        <div
          className="section-main-header"
          onClick={() => toggleSection('paymentDetails')}
        >
          <span>{pacsFormVerbiages.PaymentDetails || 'Payment Details'}</span>
          <span className="chev">{sectionCollapsed.paymentDetails ? '\u25B4' : '\u25BE'}</span>
        </div>

        <div className={`section-main-body ${sectionCollapsed.paymentDetails ? 'collapsed' : ''}`}>
          {/* Section 1: Payment Information */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection('paymentInformation')}
            >
              <span>{pacsFormVerbiages.PaymentInformation || 'Payment Information'}</span>
              <span className="chev">
                {sectionCollapsed.paymentInformation ? '\u25B4' : '\u25BE'}
              </span>
            </div>

            <div className={`section-body ${sectionCollapsed.paymentInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('painPaymentMethodType', pacsFormVerbiages.PaymentType || 'Payment Type', {
                  options: PAYMENT_TYPE_OPTIONS,
                  errorFallback: 'Payment Type is required'
                })}
                {renderField('requestedExecutionDate', pacsFormVerbiages.ValueDate || 'Value Date', {
                  type: 'date',
                  minDate: todayDateString,
                  errorFallback: 'Value Date is required'
                })}
                {renderField('instructedAmountCurrencyCode', pacsFormVerbiages.Currency || 'Currency', {
                  maxLength: 3,
                  autoUppercase: true,
                  errorFallback: 'Currency is required'
                })}
              </div>

              <div className="form-field">
                <label htmlFor="instructedAmount" className="field-label">
                  {pacsFormVerbiages.TransactionAmount || configMap.get('instructedAmount')?.label || 'Transaction Amount'}
                  {(!isChecker || (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes('instructedAmount'))) && (
                    <span className="mandatory-indicator">*</span>
                  )}
                </label>
                <input
                  id="instructedAmount"
                  name="instructedAmount"
                  type="number"
                  placeholder="Enter Transaction Amount"
                  value={formValues.instructedAmount === 0 ? '' : formValues.instructedAmount ?? ''}
                  readOnly={isFieldReadonly('instructedAmount')}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const rawVal = e.target.value;
                    setField('instructedAmount', rawVal);
                    instructedAmountChange(rawVal);
                  }}
                  onBlur={() => {
                    validateSingleDualBlindKeyField('instructedAmount');
                    onAmountBlur();
                  }}
                />
                {hardcapChecking && (
                  <div className="hint">
                    {pacsFormVerbiages.ValidatingHardcapLimit || 'Validating hardcap limit...'}
                  </div>
                )}
                {hardcapError && <div className="field-error">{hardcapError}</div>}
                {hardcapSuccessMessage && <div className="success-message">{hardcapSuccessMessage}</div>}
              </div>
            </div>
          </div>

          {/* Section 2: Debtor Information */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection('debtorInformation')}
            >
              <span>{pacsFormVerbiages.DebtorInfo || 'Debtor Information'}</span>
              <span className="chev">
                {sectionCollapsed.debtorInformation ? '\u25B4' : '\u25BE'}
              </span>
            </div>

            <div className={`section-body ${sectionCollapsed.debtorInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('debtorName', pacsFormVerbiages.DebtorName || 'Debtor Name', {
                  errorFallback: 'Debtor Name is required'
                })}
                {renderField(
                  'debtorAccountNumber',
                  pacsFormVerbiages.DebtorAccountNumber || 'Debtor Account Number',
                  {
                    numericOnly: true,
                    errorFallback: 'Debtor Account Number is required'
                  }
                )}
                {renderField('debtorAgentBIC', pacsFormVerbiages.DebtorAgentBIC || 'Debtor Agent BIC', {
                  autoUppercase: true,
                  errorFallback: 'Debtor Agent BIC is required'
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Debtor Address Details */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection('debtorAddress')}
            >
              <span>{pacsFormVerbiages.DebtorAddressDetails || 'Debtor Address Details'}</span>
              <span className="chev">{sectionCollapsed.debtorAddress ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.debtorAddress ? 'collapsed' : ''}`}>
              <div className="form-row-2">
                {renderField('debtorAddressLines1', pacsFormVerbiages.DebtorAddressLine1 || 'Debtor Address Line 1', {
                  placeholder: 'Address 1'
                })}
                {renderField('debtorAddressLines2', pacsFormVerbiages.DebtorAddressLine2 || 'Debtor Address Line 2', {
                  placeholder: 'Address 2'
                })}
              </div>

              <div className="form-row-3">
                {renderField('debtorStreetName', pacsFormVerbiages.DebtorStreet || 'Debtor Street')}
                {renderField('debtorBuildingNumber', pacsFormVerbiages.DebtorBuildingNumber || 'Debtor Building Number')}
                {renderField('debtorTownName', pacsFormVerbiages.DebtorTownOrCityName || 'Debtor Town / City Name')}
              </div>

              <div className="form-row-3">
                {renderField('debtorCountrySubDivision', pacsFormVerbiages.DebtorCountrySubDivisionLabel || 'Debtor Country Sub-division')}
                {renderField('debtorState', pacsFormVerbiages.DebtorState || 'Debtor State')}
                {renderField('debtorCountryCode', pacsFormVerbiages.DebtorCountry || 'Debtor Country', {
                  maxLength: 2,
                  autoUppercase: true
                })}
              </div>

              <div className="form-row-3">
                {renderField('debtorPostalCode', pacsFormVerbiages.DebtorPostalCode || 'Debtor Postal Code')}
                {renderField('debtorSortCodeUK', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (UK)')}
                {renderField('debtorSortCodeUS', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (US)', {
                  numericOnly: true,
                  maxLength: 9
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEGA-SECTION 2: Beneficiary Details (Creditor Side) */}
      <div className="section-main">
        <div
          className="section-main-header"
          onClick={() => toggleSection('beneficiaryDetails')}
        >
          <span>{pacsFormVerbiages.BeneficiaryDetails || 'Beneficiary Details'}</span>
          <span className="chev">{sectionCollapsed.beneficiaryDetails ? '\u25B4' : '\u25BE'}</span>
        </div>

        <div className={`section-main-body ${sectionCollapsed.beneficiaryDetails ? 'collapsed' : ''}`}>
          {/* Section 5: Creditor Information */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection('creditorInformation')}
            >
              <span>{pacsFormVerbiages.CreditorInformation || 'Creditor Information'}</span>
              <span className="chev">
                {sectionCollapsed.creditorInformation ? '\u25B4' : '\u25BE'}
              </span>
            </div>

            <div className={`section-body ${sectionCollapsed.creditorInformation ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('creditorName', pacsFormVerbiages.CreditorName || 'Creditor Name', {
                  errorFallback: 'Creditor Name is required'
                })}
                {renderField('creditorAccount', pacsFormVerbiages.CreditorAccountNumber || 'Creditor Account Number', {
                  errorFallback: 'Creditor Account Number is required'
                })}
                {renderField('creditorAgentFinancialInstitutionBIC', pacsFormVerbiages.CreditorAgentBIC || 'Creditor Agent BIC', {
                  autoUppercase: true,
                  errorFallback: 'Required'
                })}
              </div>

              <div className="form-row-3">
                {renderField('creditorAgentFinancialInstitutionName', pacsFormVerbiages.CreditorAgentBankName || 'Creditor Agent Bank Name', {
                  errorFallback: 'Required'
                })}
                {renderField('creditorAgentPostalAddress', 'Creditor Agent Account Number')}
              </div>
            </div>
          </div>

          {/* Section 6: Creditor Address Details */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection('creditorAddress')}
            >
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
                {renderField('creditorBuildingNumber', pacsFormVerbiages.CreditorBuildingNumber || 'Creditor Building Number')}
                {renderField('creditorTownName', pacsFormVerbiages.CreditorTownOrCityName || 'Creditor Town / City Name')}
              </div>

              <div className="form-row-3">
                {renderField('creditorCountrySubDivision', pacsFormVerbiages.CreditorCountrySubDivisionLabel || 'Creditor Country Sub-division')}
                {renderField('creditorState', pacsFormVerbiages.CreditorState || 'Creditor State')}
                {renderField('creditorCountryCode', pacsFormVerbiages.CreditorCountry || 'Creditor Country', {
                  maxLength: 2,
                  autoUppercase: true
                })}
              </div>

              <div className="form-row-3">
                {renderField('creditorPostalCode', pacsFormVerbiages.CreditorPostalCode || 'Creditor Postal Code')}
                {renderField('creditorSortCodeUK', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (UK)')}
                {renderField('creditorSortCodeUS', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (US)', {
                  numericOnly: true,
                  maxLength: 9
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Intermediary Bank Routing */}
          {isIntermediaryVisible && (
            <div className="section">
              <div
                className="section-header"
                onClick={() => toggleSection('intermediaryBank')}
              >
                <span>{pacsFormVerbiages.IntermediaryBankDetails || 'Intermediary Bank Details'}</span>
                <span className="chev">
                  {sectionCollapsed.intermediaryBank ? '\u25B4' : '\u25BE'}
                </span>
              </div>

              <div className={`section-body ${sectionCollapsed.intermediaryBank ? 'collapsed' : ''}`}>
                <div className="form-row-3">
                  {renderField('firstIntermediaryBankBIC', pacsFormVerbiages.FirstIntermediaryBankSWIFTCode || '1st Intermediary Bank SWIFT Code', {
                    autoUppercase: true,
                    placeholder: 'Enter SWIFT/BIC'
                  })}
                  {renderField('firstIntermediaryBankRoutingCode', pacsFormVerbiages.FirstIntermediaryBankRoutingCode || '1st Intermediary Routing Code')}
                  {renderField('firstIntermediaryBankName', pacsFormVerbiages.FirstIntermediaryBankName || '1st Intermediary Bank Name')}
                </div>

                <div className="form-row-2">
                  {renderField('firstIntermediaryBankCountryCode', pacsFormVerbiages.FirstIntermediaryBankCountryCode || '1st Intermediary Country Code', {
                    maxLength: 2,
                    autoUppercase: true
                  })}
                  {renderField('firstIntermediaryBankAccountNumber', pacsFormVerbiages.FirstIntermediaryAccountNumber || '1st Intermediary Account Number')}
                </div>

                {!showSecondIntermediary && !formValues.secondIntermediaryBankBIC && !isChecker && (
                  <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      className="lmn-btn"
                      style={{ fontSize: '12px', height: '30px' }}
                      onClick={() => setShowSecondIntermediary(true)}
                    >
                      + Add 2nd Intermediary Bank
                    </button>
                  </div>
                )}

                {(showSecondIntermediary || Boolean(formValues.secondIntermediaryBankBIC) || isChecker) && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #d9e2ec' }}>
                    <div className="form-row-3">
                      {renderField('secondIntermediaryBankBIC', pacsFormVerbiages.SecondIntermediaryBankSWIFTCode || '2nd Intermediary SWIFT Code', {
                        autoUppercase: true,
                        placeholder: 'Enter SWIFT/BIC'
                      })}
                      {renderField('secondIntermediaryBankRoutingCode', pacsFormVerbiages.SecondIntermediaryBankRoutingCode || '2nd Intermediary Routing Code')}
                      {renderField('secondIntermediaryBankName', pacsFormVerbiages.SecondIntermediaryBankName || '2nd Intermediary Bank Name')}
                    </div>

                    <div className="form-row-2">
                      {renderField('secondIntermediaryBankCountryCode', pacsFormVerbiages.SecondIntermediaryBankCountryCode || '2nd Intermediary Country Code', {
                        maxLength: 2,
                        autoUppercase: true
                      })}
                      {renderField('secondIntermediaryBankAccountNumber', pacsFormVerbiages.SecondIntermediaryAccountNumber || '2nd Intermediary Account Number')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MEGA-SECTION 3: Remittance & Charges (Additional Information) */}
      <div className="section-main">
        <div
          className="section-main-header"
          onClick={() => toggleSection('additionalInformation')}
        >
          <span>{pacsFormVerbiages.RemittanceAndCharges || pacsFormVerbiages.AdditionalInformation || 'Remittance & Charges'}</span>
          <span className="chev">
            {sectionCollapsed.additionalInformation ? '\u25B4' : '\u25BE'}
          </span>
        </div>

        <div className={`section-main-body ${sectionCollapsed.additionalInformation ? 'collapsed' : ''}`}>
          {/* Sub-section 1: Additional Details */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection('additionalDetails')}
            >
              <span>{pacsFormVerbiages.AdditionalDetails || 'Additional Details'}</span>
              <span className="chev">
                {sectionCollapsed.additionalDetails ? '\u25B4' : '\u25BE'}
              </span>
            </div>

            <div className={`section-body ${sectionCollapsed.additionalDetails ? 'collapsed' : ''}`}>
              {renderField('ustrdPaymentDetails', pacsFormVerbiages.RemittanceInformation || 'Remittance Information', {
                placeholder: 'Enter remittance details',
                type: 'textarea'
              })}
            </div>
          </div>

          {/* Sub-section 2: Charge Details */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection('chargeDetails')}
            >
              <span>{pacsFormVerbiages.ChargeDetails || 'Charge Details'}</span>
              <span className="chev">{sectionCollapsed.chargeDetails ? '\u25B4' : '\u25BE'}</span>
            </div>

            <div className={`section-body ${sectionCollapsed.chargeDetails ? 'collapsed' : ''}`}>
              <div className="form-row-3">
                {renderField('chargeBearer', pacsFormVerbiages.ChargeInformation || 'Charge Information', {
                  options: CHARGE_BEARER_OPTIONS,
                  errorFallback: 'Required'
                })}
                {renderField('chargesAmount', pacsFormVerbiages.ChargesAmount || 'Charges Amount', {
                  type: 'number',
                  placeholder: 'Enter Charges Amount'
                })}
                {renderField('chargesAgentBIC', pacsFormVerbiages.ChargesAgentBic || 'Charges Agent BIC', {
                  autoUppercase: true,
                  placeholder: 'Enter Charges Agent BIC'
                })}
              </div>
            </div>
          </div>

          {/* Sub-section 3: Tax Details (LATAM) */}
          {showTaxDetails && (
            <div className="section">
              <div
                className="section-header"
                onClick={() => toggleSection('taxDetails')}
              >
                <span>{pacsFormVerbiages.TaxDetails || 'Tax Details'}</span>
                <span className="chev">{sectionCollapsed.taxDetails ? '\u25B4' : '\u25BE'}</span>
              </div>

              <div className={`section-body ${sectionCollapsed.taxDetails ? 'collapsed' : ''}`}>
                <div className="form-row-3">
                  {renderField('taxIdNumber', pacsFormVerbiages.TaxIdNumber || 'Tax ID Number', {
                    placeholder: 'Enter Tax ID Number',
                    errorFallback: 'Tax ID Number is required'
                  })}
                  {renderField('taxIdType', pacsFormVerbiages.TaxIdType || 'Tax ID Type', {
                    placeholder: 'Enter Tax ID Type',
                    errorFallback: 'Tax ID Type is required'
                  })}
                  {renderField('purposeOfPayment', pacsFormVerbiages.PurposeOfPayment || 'Purpose of Payment', {
                    placeholder: 'Enter Purpose of Payment',
                    errorFallback: 'Purpose of Payment is required'
                  })}
                </div>

                <div className="form-row-3">
                  {renderField('taxPurposeCode', pacsFormVerbiages.TaxPurposeCode || 'Tax Purpose Code', {
                    placeholder: 'Enter Tax Purpose Code',
                    errorFallback: 'Tax Purpose Code is required'
                  })}
                  {renderField('regulatoryReportingCode', pacsFormVerbiages.RegulatoryReportingCode || 'Regulatory Reporting Code', {
                    placeholder: 'Enter Regulatory Reporting Code',
                    errorFallback: 'Regulatory Reporting Code is required'
                  })}
                  {renderField('invoiceReferenceNumber', pacsFormVerbiages.InvoiceReferenceNumber || 'Invoice / Reference Number', {
                    placeholder: 'Enter Invoice / Reference Number',
                    errorFallback: 'Invoice / Reference Number is required'
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SSPaymentFlow;