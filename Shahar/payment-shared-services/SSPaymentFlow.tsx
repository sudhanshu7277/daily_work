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
import '../../styles/index.css';
import {
  PaymentComponentInput,
  FormFieldConfig,
  Pain001Model,
  PaymentComponentOutput,
  createEmptyPain001
} from '../../models/models';

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
  onFailedFieldListChange?: (fields: string[]) => void;
  onAmountChange?: (val: { instructedAmountCurrencyCode: string; instructedAmount: number }) => void;
}

export const PAIN001_MANDATORY_FIELDS = [
  'instructedAmountCurrencyCode',
  'instructedAmount',
  'debtorName',
  'debtorAccountNumber',
  'debtorAgentBIC',
  'creditorName',
  'creditorAccount',
  'creditorAgentFinancialInstitutionBIC',
  'chargeBearer',
  'requestedExecutionDate'
];

export const SSPaymentFlow: FC<SSPaymentFlowProps> = ({
  paymentInput,
  fieldConfig = [],
  initialData,
  pacsFormVerbiages = {},
  isMakerMode = false,
  isCheckerMode = false,
  isRepairMode = false,
  repairReviewFieldList = [],
  repairNewlyModifyFieldList = [],
  hardcapResultReceived,
  onPaymentOutput,
  onFormChange,
  onFailedFieldListChange,
  onAmountChange
}) => {
  // Mode detection
  const mode = paymentInput?.paymentMode || (isCheckerMode ? 'checker' : isRepairMode ? 'repair' : 'maker');
  const isChecker = isCheckerMode || mode === 'checker';
  const isRepair = isRepairMode || mode === 'repair';
  const isMaker = isMakerMode || (!isChecker && !isRepair);

  // Section Toggle States
  const [sectionOpen, setSectionOpen] = useState<{ [key: string]: boolean }>({
    paymentInfo: true,
    debtorInfo: true,
    beneficiaryInfo: true,
    intermediaryBank: true,
    additionalInfo: true,
    taxDetails: true
  });

  const [showSecondIntermediary, setShowSecondIntermediary] = useState<boolean>(false);
  const [failedFieldList, setFailedFieldList] = useState<string[]>([]);

  // Config Map
  const configMap = useMemo(() => {
    const map = new Map<string, FormFieldConfig>();
    fieldConfig.forEach(cfg => map.set(cfg.fieldName, cfg));
    return map;
  }, [fieldConfig]);

  // Form Data State Initialization
  const [formData, setFormData] = useState<Pain001Model>(() => {
    const base = createEmptyPain001();
    const source = paymentInput?.paymentModel || initialData || {};
    const merged = { ...base, ...source };

    if (!merged.painPaymentMethodType) merged.painPaymentMethodType = 'CBT';
    if (!merged.instructedAmountCurrencyCode) merged.instructedAmountCurrencyCode = paymentInput?.currency || 'USD';
    if (!merged.requestedExecutionDate) merged.requestedExecutionDate = new Date().toISOString().split('T')[0];
    if (!merged.chargeBearer) merged.chargeBearer = 'DEBT';

    return merged;
  });

  // Hydration sync from parent props
  useEffect(() => {
    const source = paymentInput?.paymentModel || initialData;
    if (source && Object.keys(source).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...source,
        painPaymentMethodType: source.painPaymentMethodType || prev.painPaymentMethodType || 'CBT',
        instructedAmountCurrencyCode: source.instructedAmountCurrencyCode || paymentInput?.currency || prev.instructedAmountCurrencyCode || 'USD',
        requestedExecutionDate: source.requestedExecutionDate || prev.requestedExecutionDate || new Date().toISOString().split('T')[0]
      }));
    }
  }, [paymentInput?.paymentModel, initialData, paymentInput?.currency]);

  const toggleSection = (section: string) => {
    setSectionOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Mode-Aware Field Enablement
  const isFieldDisabled = useCallback(
    (fieldName: string): boolean => {
      // 1. Explicit override from fieldConfig takes priority if provided
      const cfg = configMap.get(fieldName);
      if (cfg && cfg.disabled !== undefined) {
        return Boolean(cfg.disabled);
      }

      // 2. Maker Mode: Everything is fully enabled
      if (isMaker) {
        return false;
      }

      // 3. Checker Mode: Only dual-blind re-key fields are enabled; rest are read-only
      if (isChecker) {
        const blindFields = paymentInput?.dualBlindKeyFields || [
          'instructedAmount',
          'creditorName',
          'debtorName',
          'debtorAccountNumber',
          'creditorAccount',
          'debtorAgentBIC'
        ];
        return !blindFields.includes(fieldName);
      }

      // 4. Repair Mode: Only Checker-rejected fields are enabled for editing
      if (isRepair) {
        if (repairReviewFieldList && repairReviewFieldList.length > 0) {
          return !repairReviewFieldList.includes(fieldName);
        }
        return false;
      }

      return false;
    },
    [isMaker, isChecker, isRepair, configMap, paymentInput?.dualBlindKeyFields, repairReviewFieldList]
  );

  const isFieldHidden = useCallback(
    (fieldName: string): boolean => {
      const cfg = configMap.get(fieldName);
      return Boolean(cfg?.hidden);
    },
    [configMap]
  );

  const getFieldLabel = useCallback(
    (fieldName: string, defaultLabel: string): string => {
      if (pacsFormVerbiages[fieldName]) return pacsFormVerbiages[fieldName];
      const cfg = configMap.get(fieldName);
      if (cfg?.label) return cfg.label;
      return defaultLabel;
    },
    [pacsFormVerbiages, configMap]
  );

  const isFieldRequired = useCallback(
    (fieldName: string): boolean => {
      const cfg = configMap.get(fieldName);
      if (cfg?.required !== undefined) return Boolean(cfg.required);
      return PAIN001_MANDATORY_FIELDS.includes(fieldName);
    },
    [configMap]
  );

  // Dual Blind Key Verification (Checker Mode)
  const isDualBlindPassed = useMemo(() => {
    if (!isChecker || paymentInput?.dualBlindKeyFlag !== 'Y') {
      return true;
    }
    const blindFields = paymentInput?.dualBlindKeyFields || [
      'instructedAmount',
      'creditorName',
      'debtorName',
      'debtorAccountNumber',
      'creditorAccount',
      'debtorAgentBIC'
    ];
    const source = (paymentInput?.sourcePaymentModel || paymentInput?.paymentModel || {}) as Record<string, any>;
    const current = formData as unknown as Record<string, any>;

    for (const f of blindFields) {
      const srcVal = String(source[f] ?? '').trim().toLowerCase();
      const currVal = String(current[f] ?? '').trim().toLowerCase();
      if (!currVal || srcVal !== currVal) {
        return false;
      }
    }
    return true;
  }, [isChecker, paymentInput, formData]);

  // Form Validity Evaluation
  const isFormValid = useMemo(() => {
    for (const f of PAIN001_MANDATORY_FIELDS) {
      if (!isFieldHidden(f)) {
        const val = (formData as any)[f];
        if (val === undefined || val === null || String(val).trim() === '') {
          return false;
        }
      }
    }

    for (const [key, cfg] of configMap.entries()) {
      if (cfg.required && !cfg.hidden) {
        const val = (formData as any)[key];
        if (val === undefined || val === null || String(val).trim() === '') {
          return false;
        }
      }
    }

    const amt = Number(formData.instructedAmount);
    if (isNaN(amt) || amt <= 0) {
      return false;
    }

    if (isChecker && !isDualBlindPassed) {
      return false;
    }

    return true;
  }, [formData, isFieldHidden, configMap, isChecker, isDualBlindPassed]);

  // Emit Output upstream
  const prevOutputRef = useRef<string>('');
  useEffect(() => {
    const payload: PaymentComponentOutput = {
      isValid: isFormValid,
      isDualBlindKeyPassed: isDualBlindPassed,
      paymentData: formData
    };
    const stringified = JSON.stringify({
      valid: isFormValid,
      dualBlind: isDualBlindPassed,
      data: formData
    });

    if (prevOutputRef.current !== stringified) {
      prevOutputRef.current = stringified;
      if (onPaymentOutput) {
        onPaymentOutput(payload);
      }
    }
  }, [isFormValid, isDualBlindPassed, formData, onPaymentOutput]);

  // Input Handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (onFormChange) {
      onFormChange({ [name]: value });
    }

    if (name === 'instructedAmount' || name === 'instructedAmountCurrencyCode') {
      if (onAmountChange) {
        onAmountChange({
          instructedAmountCurrencyCode: name === 'instructedAmountCurrencyCode' ? value : updated.instructedAmountCurrencyCode,
          instructedAmount: Number(name === 'instructedAmount' ? value : updated.instructedAmount) || 0
        });
      }
    }
  };

  // Double Click Discrepancy Tagging (Checker)
  const handleFieldDoubleClick = (fieldName: string, e: MouseEvent) => {
    if (!isChecker) return;
    e.stopPropagation();

    let nextList: string[];
    if (failedFieldList.includes(fieldName)) {
      nextList = failedFieldList.filter(f => f !== fieldName);
    } else {
      nextList = [...failedFieldList, fieldName];
    }
    setFailedFieldList(nextList);
    if (onFailedFieldListChange) {
      onFailedFieldListChange(nextList);
    }
  };

  const getFieldContainerClass = (fieldName: string): string => {
    const classes = ['form-group'];
    if (failedFieldList.includes(fieldName)) {
      classes.push('flagged-error');
    }
    if (isRepair) {
      if (repairNewlyModifyFieldList.includes(fieldName)) {
        classes.push('modified-green');
      } else if (repairReviewFieldList.includes(fieldName)) {
        classes.push('review-amber');
      }
    }
    return classes.join(' ');
  };

  return (
    <div className="payment-flow-container card-container">
      {/* 1. PAYMENT INFORMATION */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('paymentInfo')}>
          <span>Payment Details</span>
          <span className="toggle-icon">{sectionOpen.paymentInfo ? '▼' : '▲'}</span>
        </div>

        {sectionOpen.paymentInfo && (
          <div className="section-body">
            <div className="form-row-3">
              {!isFieldHidden('painPaymentMethodType') && (
                <div
                  className={getFieldContainerClass('painPaymentMethodType')}
                  onDoubleClick={e => handleFieldDoubleClick('painPaymentMethodType', e)}
                >
                  <label htmlFor="painPaymentMethodType">
                    {getFieldLabel('painPaymentMethodType', 'Payment Type')}
                    {isFieldRequired('painPaymentMethodType') && <span className="required-star">*</span>}
                  </label>
                  <select
                    id="painPaymentMethodType"
                    name="painPaymentMethodType"
                    className="form-control"
                    value={formData.painPaymentMethodType || 'CBT'}
                    disabled={isFieldDisabled('painPaymentMethodType')}
                    onChange={handleInputChange}
                  >
                    <option value="CBT">CBT</option>
                    <option value="BKT">BKT</option>
                    <option value="DFT">DFT</option>
                  </select>
                </div>
              )}

              {!isFieldHidden('requestedExecutionDate') && (
                <div
                  className={getFieldContainerClass('requestedExecutionDate')}
                  onDoubleClick={e => handleFieldDoubleClick('requestedExecutionDate', e)}
                >
                  <label htmlFor="requestedExecutionDate">
                    {getFieldLabel('requestedExecutionDate', 'Value Date')}
                    {isFieldRequired('requestedExecutionDate') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="date"
                    id="requestedExecutionDate"
                    name="requestedExecutionDate"
                    className="form-control"
                    placeholder="YYYY-MM-DD"
                    value={formData.requestedExecutionDate || ''}
                    disabled={isFieldDisabled('requestedExecutionDate')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('instructedAmountCurrencyCode') && (
                <div
                  className={getFieldContainerClass('instructedAmountCurrencyCode')}
                  onDoubleClick={e => handleFieldDoubleClick('instructedAmountCurrencyCode', e)}
                >
                  <label htmlFor="instructedAmountCurrencyCode">
                    {getFieldLabel('instructedAmountCurrencyCode', 'Currency')}
                    {isFieldRequired('instructedAmountCurrencyCode') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="text"
                    id="instructedAmountCurrencyCode"
                    name="instructedAmountCurrencyCode"
                    className="form-control"
                    placeholder="Enter Currency (e.g. USD)"
                    value={formData.instructedAmountCurrencyCode || ''}
                    disabled={isFieldDisabled('instructedAmountCurrencyCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-1">
              {!isFieldHidden('instructedAmount') && (
                <div
                  className={getFieldContainerClass('instructedAmount')}
                  onDoubleClick={e => handleFieldDoubleClick('instructedAmount', e)}
                >
                  <label htmlFor="instructedAmount">
                    {getFieldLabel('instructedAmount', 'Transaction Amount')}
                    {isFieldRequired('instructedAmount') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="number"
                    id="instructedAmount"
                    name="instructedAmount"
                    className="form-control"
                    placeholder="Enter transaction amount"
                    value={formData.instructedAmount || ''}
                    disabled={isFieldDisabled('instructedAmount')}
                    onChange={handleInputChange}
                  />
                  {hardcapResultReceived && typeof hardcapResultReceived === 'object' && hardcapResultReceived.amountWithinLimit && (
                    <div className="hardcap-passed text-success">✓ Hardcap limit check passed</div>
                  )}
                  {hardcapResultReceived && typeof hardcapResultReceived === 'object' && hardcapResultReceived.amountWithinLimit === false && (
                    <div className="hardcap-failed text-danger">⚠ Amount exceeds configured hardcap limit</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. DEBTOR INFORMATION */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('debtorInfo')}>
          <span>Debtor Information</span>
          <span className="toggle-icon">{sectionOpen.debtorInfo ? '▼' : '▲'}</span>
        </div>

        {sectionOpen.debtorInfo && (
          <div className="section-body">
            <div className="form-row-3">
              {!isFieldHidden('debtorName') && (
                <div className={getFieldContainerClass('debtorName')} onDoubleClick={e => handleFieldDoubleClick('debtorName', e)}>
                  <label htmlFor="debtorName">
                    {getFieldLabel('debtorName', 'Debtor Name')}
                    {isFieldRequired('debtorName') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="text"
                    id="debtorName"
                    name="debtorName"
                    className="form-control"
                    placeholder="Enter Debtor Name"
                    value={formData.debtorName || ''}
                    disabled={isFieldDisabled('debtorName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorAccountNumber') && (
                <div className={getFieldContainerClass('debtorAccountNumber')} onDoubleClick={e => handleFieldDoubleClick('debtorAccountNumber', e)}>
                  <label htmlFor="debtorAccountNumber">
                    {getFieldLabel('debtorAccountNumber', 'Debtor Account Number')}
                    {isFieldRequired('debtorAccountNumber') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="text"
                    id="debtorAccountNumber"
                    name="debtorAccountNumber"
                    className="form-control"
                    placeholder="Enter Debtor Account Number"
                    value={formData.debtorAccountNumber || ''}
                    disabled={isFieldDisabled('debtorAccountNumber')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorAgentBIC') && (
                <div className={getFieldContainerClass('debtorAgentBIC')} onDoubleClick={e => handleFieldDoubleClick('debtorAgentBIC', e)}>
                  <label htmlFor="debtorAgentBIC">
                    {getFieldLabel('debtorAgentBIC', 'Debtor Agent BIC')}
                    {isFieldRequired('debtorAgentBIC') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="text"
                    id="debtorAgentBIC"
                    name="debtorAgentBIC"
                    className="form-control"
                    placeholder="Enter Debtor Agent BIC"
                    value={formData.debtorAgentBIC || ''}
                    disabled={isFieldDisabled('debtorAgentBIC')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="section-title">Debtor Address Details</div>
            <div className="form-row-3">
              {!isFieldHidden('debtorAddressLines1') && (
                <div className={getFieldContainerClass('debtorAddressLines1')} onDoubleClick={e => handleFieldDoubleClick('debtorAddressLines1', e)}>
                  <label htmlFor="debtorAddressLines1">{getFieldLabel('debtorAddressLines1', 'Debtor Address Line 1')}</label>
                  <input
                    type="text"
                    id="debtorAddressLines1"
                    name="debtorAddressLines1"
                    className="form-control"
                    placeholder="Address 1"
                    value={formData.debtorAddressLines1 || ''}
                    disabled={isFieldDisabled('debtorAddressLines1')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorAddressLines2') && (
                <div className={getFieldContainerClass('debtorAddressLines2')} onDoubleClick={e => handleFieldDoubleClick('debtorAddressLines2', e)}>
                  <label htmlFor="debtorAddressLines2">{getFieldLabel('debtorAddressLines2', 'Debtor Address Line 2')}</label>
                  <input
                    type="text"
                    id="debtorAddressLines2"
                    name="debtorAddressLines2"
                    className="form-control"
                    placeholder="Address 2"
                    value={formData.debtorAddressLines2 || ''}
                    disabled={isFieldDisabled('debtorAddressLines2')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorStreetName') && (
                <div className={getFieldContainerClass('debtorStreetName')} onDoubleClick={e => handleFieldDoubleClick('debtorStreetName', e)}>
                  <label htmlFor="debtorStreetName">{getFieldLabel('debtorStreetName', 'Debtor Street')}</label>
                  <input
                    type="text"
                    id="debtorStreetName"
                    name="debtorStreetName"
                    className="form-control"
                    placeholder="Enter Debtor Street"
                    value={formData.debtorStreetName || ''}
                    disabled={isFieldDisabled('debtorStreetName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('debtorBuildingNumber') && (
                <div className={getFieldContainerClass('debtorBuildingNumber')} onDoubleClick={e => handleFieldDoubleClick('debtorBuildingNumber', e)}>
                  <label htmlFor="debtorBuildingNumber">{getFieldLabel('debtorBuildingNumber', 'Debtor Building Number')}</label>
                  <input
                    type="text"
                    id="debtorBuildingNumber"
                    name="debtorBuildingNumber"
                    className="form-control"
                    placeholder="Enter Debtor Building Number"
                    value={formData.debtorBuildingNumber || ''}
                    disabled={isFieldDisabled('debtorBuildingNumber')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorTownName') && (
                <div className={getFieldContainerClass('debtorTownName')} onDoubleClick={e => handleFieldDoubleClick('debtorTownName', e)}>
                  <label htmlFor="debtorTownName">{getFieldLabel('debtorTownName', 'Debtor Town / City Name')}</label>
                  <input
                    type="text"
                    id="debtorTownName"
                    name="debtorTownName"
                    className="form-control"
                    placeholder="Enter Debtor Town / City Name"
                    value={formData.debtorTownName || ''}
                    disabled={isFieldDisabled('debtorTownName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorCountrySubDivision') && (
                <div className={getFieldContainerClass('debtorCountrySubDivision')} onDoubleClick={e => handleFieldDoubleClick('debtorCountrySubDivision', e)}>
                  <label htmlFor="debtorCountrySubDivision">{getFieldLabel('debtorCountrySubDivision', 'Debtor Country Sub-division')}</label>
                  <input
                    type="text"
                    id="debtorCountrySubDivision"
                    name="debtorCountrySubDivision"
                    className="form-control"
                    placeholder="Enter Debtor Country Sub-division"
                    value={formData.debtorCountrySubDivision || ''}
                    disabled={isFieldDisabled('debtorCountrySubDivision')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('debtorState') && (
                <div className={getFieldContainerClass('debtorState')} onDoubleClick={e => handleFieldDoubleClick('debtorState', e)}>
                  <label htmlFor="debtorState">{getFieldLabel('debtorState', 'Debtor State')}</label>
                  <input
                    type="text"
                    id="debtorState"
                    name="debtorState"
                    className="form-control"
                    placeholder="Enter Debtor State"
                    value={formData.debtorState || ''}
                    disabled={isFieldDisabled('debtorState')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorCountryCode') && (
                <div className={getFieldContainerClass('debtorCountryCode')} onDoubleClick={e => handleFieldDoubleClick('debtorCountryCode', e)}>
                  <label htmlFor="debtorCountryCode">{getFieldLabel('debtorCountryCode', 'Debtor Country')}</label>
                  <input
                    type="text"
                    id="debtorCountryCode"
                    name="debtorCountryCode"
                    className="form-control"
                    placeholder="Enter Debtor Country"
                    value={formData.debtorCountryCode || ''}
                    disabled={isFieldDisabled('debtorCountryCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorPostalCode') && (
                <div className={getFieldContainerClass('debtorPostalCode')} onDoubleClick={e => handleFieldDoubleClick('debtorPostalCode', e)}>
                  <label htmlFor="debtorPostalCode">{getFieldLabel('debtorPostalCode', 'Debtor Postal Code')}</label>
                  <input
                    type="text"
                    id="debtorPostalCode"
                    name="debtorPostalCode"
                    className="form-control"
                    placeholder="Enter Debtor Postal Code"
                    value={formData.debtorPostalCode || ''}
                    disabled={isFieldDisabled('debtorPostalCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('debtorSortCodeUS') && (
                <div className={getFieldContainerClass('debtorSortCodeUS')} onDoubleClick={e => handleFieldDoubleClick('debtorSortCodeUS', e)}>
                  <label htmlFor="debtorSortCodeUS">{getFieldLabel('debtorSortCodeUS', 'Debtor Sort Code (US)')}</label>
                  <input
                    type="text"
                    id="debtorSortCodeUS"
                    name="debtorSortCodeUS"
                    className="form-control"
                    placeholder="Enter Debtor Sort Code (US)"
                    value={formData.debtorSortCodeUS || ''}
                    disabled={isFieldDisabled('debtorSortCodeUS')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. BENEFICIARY / CREDITOR INFORMATION */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('beneficiaryInfo')}>
          <span>Beneficiary Details</span>
          <span className="toggle-icon">{sectionOpen.beneficiaryInfo ? '▼' : '▲'}</span>
        </div>

        {sectionOpen.beneficiaryInfo && (
          <div className="section-body">
            <div className="form-row-3">
              {!isFieldHidden('creditorName') && (
                <div className={getFieldContainerClass('creditorName')} onDoubleClick={e => handleFieldDoubleClick('creditorName', e)}>
                  <label htmlFor="creditorName">
                    {getFieldLabel('creditorName', 'Creditor Name')}
                    {isFieldRequired('creditorName') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="text"
                    id="creditorName"
                    name="creditorName"
                    className="form-control"
                    placeholder="Enter Creditor Name"
                    value={formData.creditorName || ''}
                    disabled={isFieldDisabled('creditorName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorAccount') && (
                <div className={getFieldContainerClass('creditorAccount')} onDoubleClick={e => handleFieldDoubleClick('creditorAccount', e)}>
                  <label htmlFor="creditorAccount">
                    {getFieldLabel('creditorAccount', 'Creditor Account Number')}
                    {isFieldRequired('creditorAccount') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="text"
                    id="creditorAccount"
                    name="creditorAccount"
                    className="form-control"
                    placeholder="Enter Creditor Account Number"
                    value={formData.creditorAccount || ''}
                    disabled={isFieldDisabled('creditorAccount')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorAgentFinancialInstitutionBIC') && (
                <div className={getFieldContainerClass('creditorAgentFinancialInstitutionBIC')} onDoubleClick={e => handleFieldDoubleClick('creditorAgentFinancialInstitutionBIC', e)}>
                  <label htmlFor="creditorAgentFinancialInstitutionBIC">
                    {getFieldLabel('creditorAgentFinancialInstitutionBIC', 'Creditor Agent BIC')}
                    {isFieldRequired('creditorAgentFinancialInstitutionBIC') && <span className="required-star">*</span>}
                  </label>
                  <input
                    type="text"
                    id="creditorAgentFinancialInstitutionBIC"
                    name="creditorAgentFinancialInstitutionBIC"
                    className="form-control"
                    placeholder="Enter Creditor Agent BIC"
                    value={formData.creditorAgentFinancialInstitutionBIC || ''}
                    disabled={isFieldDisabled('creditorAgentFinancialInstitutionBIC')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('creditorAgentFinancialInstitutionName') && (
                <div className={getFieldContainerClass('creditorAgentFinancialInstitutionName')} onDoubleClick={e => handleFieldDoubleClick('creditorAgentFinancialInstitutionName', e)}>
                  <label htmlFor="creditorAgentFinancialInstitutionName">{getFieldLabel('creditorAgentFinancialInstitutionName', 'Creditor Agent Bank Name')}</label>
                  <input
                    type="text"
                    id="creditorAgentFinancialInstitutionName"
                    name="creditorAgentFinancialInstitutionName"
                    className="form-control"
                    placeholder="Enter Creditor Agent Bank Name"
                    value={formData.creditorAgentFinancialInstitutionName || ''}
                    disabled={isFieldDisabled('creditorAgentFinancialInstitutionName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorAgentAccount') && (
                <div className={getFieldContainerClass('creditorAgentAccount')} onDoubleClick={e => handleFieldDoubleClick('creditorAgentAccount', e)}>
                  <label htmlFor="creditorAgentAccount">{getFieldLabel('creditorAgentAccount', 'Creditor Agent Account Number')}</label>
                  <input
                    type="text"
                    id="creditorAgentAccount"
                    name="creditorAgentAccount"
                    className="form-control"
                    placeholder="Enter Creditor Agent Account Number"
                    value={formData.creditorAgentAccount || ''}
                    disabled={isFieldDisabled('creditorAgentAccount')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="section-title">Creditor Address Details</div>
            <div className="form-row-3">
              {!isFieldHidden('creditorAddressLines1') && (
                <div className={getFieldContainerClass('creditorAddressLines1')} onDoubleClick={e => handleFieldDoubleClick('creditorAddressLines1', e)}>
                  <label htmlFor="creditorAddressLines1">{getFieldLabel('creditorAddressLines1', 'Creditor Address Line 1')}</label>
                  <input
                    type="text"
                    id="creditorAddressLines1"
                    name="creditorAddressLines1"
                    className="form-control"
                    placeholder="Enter Creditor Address Line 1"
                    value={formData.creditorAddressLines1 || ''}
                    disabled={isFieldDisabled('creditorAddressLines1')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorAddressLines2') && (
                <div className={getFieldContainerClass('creditorAddressLines2')} onDoubleClick={e => handleFieldDoubleClick('creditorAddressLines2', e)}>
                  <label htmlFor="creditorAddressLines2">{getFieldLabel('creditorAddressLines2', 'Creditor Address Line 2')}</label>
                  <input
                    type="text"
                    id="creditorAddressLines2"
                    name="creditorAddressLines2"
                    className="form-control"
                    placeholder="Enter Creditor Address Line 2"
                    value={formData.creditorAddressLines2 || ''}
                    disabled={isFieldDisabled('creditorAddressLines2')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorStreetName') && (
                <div className={getFieldContainerClass('creditorStreetName')} onDoubleClick={e => handleFieldDoubleClick('creditorStreetName', e)}>
                  <label htmlFor="creditorStreetName">{getFieldLabel('creditorStreetName', 'Creditor Street')}</label>
                  <input
                    type="text"
                    id="creditorStreetName"
                    name="creditorStreetName"
                    className="form-control"
                    placeholder="Enter Creditor Street"
                    value={formData.creditorStreetName || ''}
                    disabled={isFieldDisabled('creditorStreetName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('creditorBuildingNumber') && (
                <div className={getFieldContainerClass('creditorBuildingNumber')} onDoubleClick={e => handleFieldDoubleClick('creditorBuildingNumber', e)}>
                  <label htmlFor="creditorBuildingNumber">{getFieldLabel('creditorBuildingNumber', 'Creditor Building Number')}</label>
                  <input
                    type="text"
                    id="creditorBuildingNumber"
                    name="creditorBuildingNumber"
                    className="form-control"
                    placeholder="Enter Creditor Building Number"
                    value={formData.creditorBuildingNumber || ''}
                    disabled={isFieldDisabled('creditorBuildingNumber')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorTownName') && (
                <div className={getFieldContainerClass('creditorTownName')} onDoubleClick={e => handleFieldDoubleClick('creditorTownName', e)}>
                  <label htmlFor="creditorTownName">{getFieldLabel('creditorTownName', 'Creditor Town / City Name')}</label>
                  <input
                    type="text"
                    id="creditorTownName"
                    name="creditorTownName"
                    className="form-control"
                    placeholder="Enter Creditor Town / City Name"
                    value={formData.creditorTownName || ''}
                    disabled={isFieldDisabled('creditorTownName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorCountrySubDivision') && (
                <div className={getFieldContainerClass('creditorCountrySubDivision')} onDoubleClick={e => handleFieldDoubleClick('creditorCountrySubDivision', e)}>
                  <label htmlFor="creditorCountrySubDivision">{getFieldLabel('creditorCountrySubDivision', 'Creditor Country Sub-division')}</label>
                  <input
                    type="text"
                    id="creditorCountrySubDivision"
                    name="creditorCountrySubDivision"
                    className="form-control"
                    placeholder="Enter Creditor Country Sub-division"
                    value={formData.creditorCountrySubDivision || ''}
                    disabled={isFieldDisabled('creditorCountrySubDivision')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('creditorState') && (
                <div className={getFieldContainerClass('creditorState')} onDoubleClick={e => handleFieldDoubleClick('creditorState', e)}>
                  <label htmlFor="creditorState">{getFieldLabel('creditorState', 'Creditor State')}</label>
                  <input
                    type="text"
                    id="creditorState"
                    name="creditorState"
                    className="form-control"
                    placeholder="Enter Creditor State"
                    value={formData.creditorState || ''}
                    disabled={isFieldDisabled('creditorState')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorCountryCode') && (
                <div className={getFieldContainerClass('creditorCountryCode')} onDoubleClick={e => handleFieldDoubleClick('creditorCountryCode', e)}>
                  <label htmlFor="creditorCountryCode">{getFieldLabel('creditorCountryCode', 'Creditor Country')}</label>
                  <input
                    type="text"
                    id="creditorCountryCode"
                    name="creditorCountryCode"
                    className="form-control"
                    placeholder="Enter Creditor Country"
                    value={formData.creditorCountryCode || ''}
                    disabled={isFieldDisabled('creditorCountryCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorPostalCode') && (
                <div className={getFieldContainerClass('creditorPostalCode')} onDoubleClick={e => handleFieldDoubleClick('creditorPostalCode', e)}>
                  <label htmlFor="creditorPostalCode">{getFieldLabel('creditorPostalCode', 'Creditor Postal Code')}</label>
                  <input
                    type="text"
                    id="creditorPostalCode"
                    name="creditorPostalCode"
                    className="form-control"
                    placeholder="Enter Creditor Postal Code"
                    value={formData.creditorPostalCode || ''}
                    disabled={isFieldDisabled('creditorPostalCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('creditorSortCodeUS') && (
                <div className={getFieldContainerClass('creditorSortCodeUS')} onDoubleClick={e => handleFieldDoubleClick('creditorSortCodeUS', e)}>
                  <label htmlFor="creditorSortCodeUS">{getFieldLabel('creditorSortCodeUS', 'Creditor Sort Code (US)')}</label>
                  <input
                    type="text"
                    id="creditorSortCodeUS"
                    name="creditorSortCodeUS"
                    className="form-control"
                    placeholder="Enter Creditor Sort Code (US)"
                    value={formData.creditorSortCodeUS || ''}
                    disabled={isFieldDisabled('creditorSortCodeUS')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. INTERMEDIARY BANK DETAILS */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('intermediaryBank')}>
          <span>Intermediary Bank Details</span>
          <span className="toggle-icon">{sectionOpen.intermediaryBank ? '▼' : '▲'}</span>
        </div>

        {sectionOpen.intermediaryBank && (
          <div className="section-body">
            <div className="section-title">1st Intermediary Bank</div>
            <div className="form-row-3">
              {!isFieldHidden('firstIntermediaryBankBIC') && (
                <div className={getFieldContainerClass('firstIntermediaryBankBIC')} onDoubleClick={e => handleFieldDoubleClick('firstIntermediaryBankBIC', e)}>
                  <label htmlFor="firstIntermediaryBankBIC">{getFieldLabel('firstIntermediaryBankBIC', '1st Intermediary Bank SWIFT Code')}</label>
                  <input
                    type="text"
                    id="firstIntermediaryBankBIC"
                    name="firstIntermediaryBankBIC"
                    className="form-control"
                    placeholder="Enter SWIFT/BIC"
                    value={formData.firstIntermediaryBankBIC || ''}
                    disabled={isFieldDisabled('firstIntermediaryBankBIC')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('firstIntermediaryBankRoutingCode') && (
                <div className={getFieldContainerClass('firstIntermediaryBankRoutingCode')} onDoubleClick={e => handleFieldDoubleClick('firstIntermediaryBankRoutingCode', e)}>
                  <label htmlFor="firstIntermediaryBankRoutingCode">{getFieldLabel('firstIntermediaryBankRoutingCode', '1st Intermediary Routing Code')}</label>
                  <input
                    type="text"
                    id="firstIntermediaryBankRoutingCode"
                    name="firstIntermediaryBankRoutingCode"
                    className="form-control"
                    placeholder="Enter 1st Intermediary Routing Code"
                    value={formData.firstIntermediaryBankRoutingCode || ''}
                    disabled={isFieldDisabled('firstIntermediaryBankRoutingCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('firstIntermediaryBankName') && (
                <div className={getFieldContainerClass('firstIntermediaryBankName')} onDoubleClick={e => handleFieldDoubleClick('firstIntermediaryBankName', e)}>
                  <label htmlFor="firstIntermediaryBankName">{getFieldLabel('firstIntermediaryBankName', '1st Intermediary Bank Name')}</label>
                  <input
                    type="text"
                    id="firstIntermediaryBankName"
                    name="firstIntermediaryBankName"
                    className="form-control"
                    placeholder="Enter 1st Intermediary Bank Name"
                    value={formData.firstIntermediaryBankName || ''}
                    disabled={isFieldDisabled('firstIntermediaryBankName')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('firstIntermediaryBankCountryCode') && (
                <div className={getFieldContainerClass('firstIntermediaryBankCountryCode')} onDoubleClick={e => handleFieldDoubleClick('firstIntermediaryBankCountryCode', e)}>
                  <label htmlFor="firstIntermediaryBankCountryCode">{getFieldLabel('firstIntermediaryBankCountryCode', '1st Intermediary Country Code')}</label>
                  <input
                    type="text"
                    id="firstIntermediaryBankCountryCode"
                    name="firstIntermediaryBankCountryCode"
                    className="form-control"
                    placeholder="Enter 1st Intermediary Country Code"
                    value={formData.firstIntermediaryBankCountryCode || ''}
                    disabled={isFieldDisabled('firstIntermediaryBankCountryCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('firstIntermediaryBankAccountNumber') && (
                <div className={getFieldContainerClass('firstIntermediaryBankAccountNumber')} onDoubleClick={e => handleFieldDoubleClick('firstIntermediaryBankAccountNumber', e)}>
                  <label htmlFor="firstIntermediaryBankAccountNumber">{getFieldLabel('firstIntermediaryBankAccountNumber', '1st Intermediary Account Number')}</label>
                  <input
                    type="text"
                    id="firstIntermediaryBankAccountNumber"
                    name="firstIntermediaryBankAccountNumber"
                    className="form-control"
                    placeholder="Enter 1st Intermediary Account Number"
                    value={formData.firstIntermediaryBankAccountNumber || ''}
                    disabled={isFieldDisabled('firstIntermediaryBankAccountNumber')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            {!showSecondIntermediary ? (
              <button
                type="button"
                className="btn-add-intermediary"
                onClick={() => setShowSecondIntermediary(true)}
              >
                + Add 2nd Intermediary Bank
              </button>
            ) : (
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                <div className="section-title">2nd Intermediary Bank</div>
                <div className="form-row-3">
                  {!isFieldHidden('secondIntermediaryBankBIC') && (
                    <div className={getFieldContainerClass('secondIntermediaryBankBIC')} onDoubleClick={e => handleFieldDoubleClick('secondIntermediaryBankBIC', e)}>
                      <label htmlFor="secondIntermediaryBankBIC">{getFieldLabel('secondIntermediaryBankBIC', '2nd Intermediary Bank SWIFT Code')}</label>
                      <input
                        type="text"
                        id="secondIntermediaryBankBIC"
                        name="secondIntermediaryBankBIC"
                        className="form-control"
                        placeholder="Enter 2nd Intermediary SWIFT Code"
                        value={formData.secondIntermediaryBankBIC || ''}
                        disabled={isFieldDisabled('secondIntermediaryBankBIC')}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  {!isFieldHidden('secondIntermediaryBankRoutingCode') && (
                    <div className={getFieldContainerClass('secondIntermediaryBankRoutingCode')} onDoubleClick={e => handleFieldDoubleClick('secondIntermediaryBankRoutingCode', e)}>
                      <label htmlFor="secondIntermediaryBankRoutingCode">{getFieldLabel('secondIntermediaryBankRoutingCode', '2nd Intermediary Routing Code')}</label>
                      <input
                        type="text"
                        id="secondIntermediaryBankRoutingCode"
                        name="secondIntermediaryBankRoutingCode"
                        className="form-control"
                        placeholder="Enter 2nd Intermediary Routing Code"
                        value={formData.secondIntermediaryBankRoutingCode || ''}
                        disabled={isFieldDisabled('secondIntermediaryBankRoutingCode')}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  {!isFieldHidden('secondIntermediaryBankName') && (
                    <div className={getFieldContainerClass('secondIntermediaryBankName')} onDoubleClick={e => handleFieldDoubleClick('secondIntermediaryBankName', e)}>
                      <label htmlFor="secondIntermediaryBankName">{getFieldLabel('secondIntermediaryBankName', '2nd Intermediary Bank Name')}</label>
                      <input
                        type="text"
                        id="secondIntermediaryBankName"
                        name="secondIntermediaryBankName"
                        className="form-control"
                        placeholder="Enter 2nd Intermediary Bank Name"
                        value={formData.secondIntermediaryBankName || ''}
                        disabled={isFieldDisabled('secondIntermediaryBankName')}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>

                <div className="form-row-3">
                  {!isFieldHidden('secondIntermediaryBankCountryCode') && (
                    <div className={getFieldContainerClass('secondIntermediaryBankCountryCode')} onDoubleClick={e => handleFieldDoubleClick('secondIntermediaryBankCountryCode', e)}>
                      <label htmlFor="secondIntermediaryBankCountryCode">{getFieldLabel('secondIntermediaryBankCountryCode', '2nd Intermediary Country Code')}</label>
                      <input
                        type="text"
                        id="secondIntermediaryBankCountryCode"
                        name="secondIntermediaryBankCountryCode"
                        className="form-control"
                        placeholder="Enter 2nd Intermediary Country Code"
                        value={formData.secondIntermediaryBankCountryCode || ''}
                        disabled={isFieldDisabled('secondIntermediaryBankCountryCode')}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  {!isFieldHidden('secondIntermediaryBankAccountNumber') && (
                    <div className={getFieldContainerClass('secondIntermediaryBankAccountNumber')} onDoubleClick={e => handleFieldDoubleClick('secondIntermediaryBankAccountNumber', e)}>
                      <label htmlFor="secondIntermediaryBankAccountNumber">{getFieldLabel('secondIntermediaryBankAccountNumber', '2nd Intermediary Account Number')}</label>
                      <input
                        type="text"
                        id="secondIntermediaryBankAccountNumber"
                        name="secondIntermediaryBankAccountNumber"
                        className="form-control"
                        placeholder="Enter 2nd Intermediary Account Number"
                        value={formData.secondIntermediaryBankAccountNumber || ''}
                        disabled={isFieldDisabled('secondIntermediaryBankAccountNumber')}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. ADDITIONAL INFORMATION & CHARGES */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('additionalInfo')}>
          <span>Additional Information</span>
          <span className="toggle-icon">{sectionOpen.additionalInfo ? '▼' : '▲'}</span>
        </div>

        {sectionOpen.additionalInfo && (
          <div className="section-body">
            <div className="form-row-1">
              {!isFieldHidden('ustrdPaymentDetails') && (
                <div className={getFieldContainerClass('ustrdPaymentDetails')} onDoubleClick={e => handleFieldDoubleClick('ustrdPaymentDetails', e)}>
                  <label htmlFor="ustrdPaymentDetails">{getFieldLabel('ustrdPaymentDetails', 'Remittance Information')}</label>
                  <textarea
                    id="ustrdPaymentDetails"
                    name="ustrdPaymentDetails"
                    rows={2}
                    className="form-control"
                    placeholder="Enter remittance details"
                    value={formData.ustrdPaymentDetails || ''}
                    disabled={isFieldDisabled('ustrdPaymentDetails')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="section-title">Charge Details</div>
            <div className="form-row-3">
              {!isFieldHidden('chargeBearer') && (
                <div className={getFieldContainerClass('chargeBearer')} onDoubleClick={e => handleFieldDoubleClick('chargeBearer', e)}>
                  <label htmlFor="chargeBearer">
                    {getFieldLabel('chargeBearer', 'Charge Information')}
                    {isFieldRequired('chargeBearer') && <span className="required-star">*</span>}
                  </label>
                  <select
                    id="chargeBearer"
                    name="chargeBearer"
                    className="form-control"
                    value={formData.chargeBearer || 'DEBT'}
                    disabled={isFieldDisabled('chargeBearer')}
                    onChange={handleInputChange}
                  >
                    <option value="DEBT">DEBT</option>
                    <option value="CRED">CRED</option>
                    <option value="SHAR">SHAR</option>
                    <option value="SLEV">SLEV</option>
                  </select>
                </div>
              )}

              {!isFieldHidden('chargesAmount') && (
                <div className={getFieldContainerClass('chargesAmount')} onDoubleClick={e => handleFieldDoubleClick('chargesAmount', e)}>
                  <label htmlFor="chargesAmount">{getFieldLabel('chargesAmount', 'Charges Amount')}</label>
                  <input
                    type="number"
                    id="chargesAmount"
                    name="chargesAmount"
                    className="form-control"
                    placeholder="Enter Charges Amount"
                    value={formData.chargesAmount || ''}
                    disabled={isFieldDisabled('chargesAmount')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('chargesAgentBIC') && (
                <div className={getFieldContainerClass('chargesAgentBIC')} onDoubleClick={e => handleFieldDoubleClick('chargesAgentBIC', e)}>
                  <label htmlFor="chargesAgentBIC">{getFieldLabel('chargesAgentBIC', 'Charges Agent BIC')}</label>
                  <input
                    type="text"
                    id="chargesAgentBIC"
                    name="chargesAgentBIC"
                    className="form-control"
                    placeholder="Enter Charges Agent BIC"
                    value={formData.chargesAgentBIC || ''}
                    disabled={isFieldDisabled('chargesAgentBIC')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. TAX & REGULATORY DETAILS */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('taxDetails')}>
          <span>Tax & Regulatory Details</span>
          <span className="toggle-icon">{sectionOpen.taxDetails ? '▼' : '▲'}</span>
        </div>

        {sectionOpen.taxDetails && (
          <div className="section-body">
            <div className="form-row-3">
              {!isFieldHidden('taxIdNumber') && (
                <div className={getFieldContainerClass('taxIdNumber')} onDoubleClick={e => handleFieldDoubleClick('taxIdNumber', e)}>
                  <label htmlFor="taxIdNumber">{getFieldLabel('taxIdNumber', 'Tax ID Number')}</label>
                  <input
                    type="text"
                    id="taxIdNumber"
                    name="taxIdNumber"
                    className="form-control"
                    placeholder="Enter Tax ID Number"
                    value={formData.taxIdNumber || ''}
                    disabled={isFieldDisabled('taxIdNumber')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('taxIdType') && (
                <div className={getFieldContainerClass('taxIdType')} onDoubleClick={e => handleFieldDoubleClick('taxIdType', e)}>
                  <label htmlFor="taxIdType">{getFieldLabel('taxIdType', 'Tax ID Type')}</label>
                  <input
                    type="text"
                    id="taxIdType"
                    name="taxIdType"
                    className="form-control"
                    placeholder="Enter Tax ID Type"
                    value={formData.taxIdType || ''}
                    disabled={isFieldDisabled('taxIdType')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('purposeOfPayment') && (
                <div className={getFieldContainerClass('purposeOfPayment')} onDoubleClick={e => handleFieldDoubleClick('purposeOfPayment', e)}>
                  <label htmlFor="purposeOfPayment">{getFieldLabel('purposeOfPayment', 'Purpose of Payment')}</label>
                  <input
                    type="text"
                    id="purposeOfPayment"
                    name="purposeOfPayment"
                    className="form-control"
                    placeholder="Enter Purpose of Payment"
                    value={formData.purposeOfPayment || ''}
                    disabled={isFieldDisabled('purposeOfPayment')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row-3">
              {!isFieldHidden('taxPurposeCode') && (
                <div className={getFieldContainerClass('taxPurposeCode')} onDoubleClick={e => handleFieldDoubleClick('taxPurposeCode', e)}>
                  <label htmlFor="taxPurposeCode">{getFieldLabel('taxPurposeCode', 'Tax Purpose Code')}</label>
                  <input
                    type="text"
                    id="taxPurposeCode"
                    name="taxPurposeCode"
                    className="form-control"
                    placeholder="Enter Tax Purpose Code"
                    value={formData.taxPurposeCode || ''}
                    disabled={isFieldDisabled('taxPurposeCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('regulatoryReportingCode') && (
                <div className={getFieldContainerClass('regulatoryReportingCode')} onDoubleClick={e => handleFieldDoubleClick('regulatoryReportingCode', e)}>
                  <label htmlFor="regulatoryReportingCode">{getFieldLabel('regulatoryReportingCode', 'Regulatory Reporting Code')}</label>
                  <input
                    type="text"
                    id="regulatoryReportingCode"
                    name="regulatoryReportingCode"
                    className="form-control"
                    placeholder="Enter Regulatory Reporting Code"
                    value={formData.regulatoryReportingCode || ''}
                    disabled={isFieldDisabled('regulatoryReportingCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('invoiceReferenceNumber') && (
                <div className={getFieldContainerClass('invoiceReferenceNumber')} onDoubleClick={e => handleFieldDoubleClick('invoiceReferenceNumber', e)}>
                  <label htmlFor="invoiceReferenceNumber">{getFieldLabel('invoiceReferenceNumber', 'Invoice / Reference Number')}</label>
                  <input
                    type="text"
                    id="invoiceReferenceNumber"
                    name="invoiceReferenceNumber"
                    className="form-control"
                    placeholder="Enter Invoice / Reference Number"
                    value={formData.invoiceReferenceNumber || ''}
                    disabled={isFieldDisabled('invoiceReferenceNumber')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSPaymentFlow;