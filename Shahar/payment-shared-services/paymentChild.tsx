import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ChangeEvent
} from 'react';
import {
  Pain001Model,
  PaymentComponentInput,
  PaymentComponentOutput,
  FormFieldConfig,
  createEmptyPain001
} from '../types/models';
import './PaymentChild.css';

export interface SSPaymentFlowProps {
  paymentInput?: PaymentComponentInput;
  fieldConfig?: FormFieldConfig[];
  isMakerMode?: boolean;
  isCheckerMode?: boolean;
  isRepairMode?: boolean;
  hardcapResultReceived?: { amountWithinLimit?: boolean; hardCapValue?: number } | null;
  repairReviewFieldList?: string[];
  repairNewlyModifyFieldList?: string[];
  onAmountChange?: (data: { instructedAmountCurrencyCode: string; instructedAmount: number }) => void;
  onFailedFieldListChange?: (failedFields: string[]) => void;
  onPaymentOutput?: (output: PaymentComponentOutput) => void;
  onFormChange?: (formData: Pain001Model) => void;
}

export type PaymentChildProps = SSPaymentFlowProps;

export const SSPaymentFlow: FC<SSPaymentFlowProps> = ({
  paymentInput,
  fieldConfig = [],
  isMakerMode = false,
  isCheckerMode = false,
  isRepairMode = false,
  hardcapResultReceived,
  repairReviewFieldList = [],
  repairNewlyModifyFieldList = [],
  onAmountChange,
  onFailedFieldListChange,
  onPaymentOutput,
  onFormChange
}) => {
  // 1. Resolve initial value for payment type
  const resolvePaymentMethod = (model?: any): string => {
    if (!model) return 'CBT';
    return (
      model.painPaymentMethodType ||
      model.paymentMethod ||
      model.paymentMethodType ||
      model.paymentType ||
      'CBT'
    );
  };

  // 2. Initialize Internal Form State
  const [formData, setFormData] = useState<Pain001Model>(() => {
    const base = createEmptyPain001();
    const incoming = paymentInput?.paymentModel || {};
    const method = resolvePaymentMethod(incoming);
    return {
      ...base,
      ...incoming,
      painPaymentMethodType: method,
      paymentMethod: method,
      paymentMethodType: method,
      paymentType: method
    } as any;
  });

  // 3. Checker Mode Flagged Fields State
  const [flaggedFields, setFlaggedFields] = useState<string[]>([]);

  // 4. Synchronize with incoming paymentInput changes
  useEffect(() => {
    if (paymentInput?.paymentModel) {
      const incoming = paymentInput.paymentModel;
      const method = resolvePaymentMethod(incoming);
      setFormData((prev) => ({
        ...prev,
        ...incoming,
        painPaymentMethodType: method,
        paymentMethod: method,
        paymentMethodType: method,
        paymentType: method
      }));
    }
  }, [paymentInput]);

  // 5. Dynamic Config Map for Fast Lookup
  const configMap = useMemo(() => {
    const map = new Map<string, FormFieldConfig>();
    fieldConfig.forEach((fc) => map.set(fc.fieldName, fc));
    return map;
  }, [fieldConfig]);

  const isFieldHidden = useCallback(
    (fieldName: string) => {
      const conf = configMap.get(fieldName);
      return conf ? !!conf.hidden : false;
    },
    [configMap]
  );

  const isFieldDisabled = useCallback(
    (fieldName: string) => {
      const conf = configMap.get(fieldName);
      if (conf && typeof (conf as any).disabled === 'boolean') {
        return (conf as any).disabled;
      }
      return false;
    },
    [configMap]
  );

  const isFieldRequired = useCallback(
    (fieldName: string) => {
      const conf = configMap.get(fieldName);
      return conf ? !!conf.required : false;
    },
    [configMap]
  );

  const getFieldLabel = useCallback(
    (fieldName: string, defaultLabel: string) => {
      const conf = configMap.get(fieldName);
      return conf?.label || defaultLabel;
    },
    [configMap]
  );

  const getFieldPlaceholder = useCallback(
    (fieldName: string, defaultPlaceholder: string = '') => {
      const conf = configMap.get(fieldName);
      return conf?.placeholder || defaultPlaceholder;
    },
    [configMap]
  );

  // 6. Dual-Blind Key Validation Engine
  const isDualBlindKeyPassed = useMemo(() => {
    if (paymentInput?.dualBlindKeyFlag !== 'Y' || !isCheckerMode) return true;
    const blindFields = paymentInput.dualBlindKeyFields || [];
    const sourceModel = (paymentInput as any).sourcePaymentModel || {};

    for (const field of blindFields) {
      const enteredVal = String((formData as any)[field] || '').trim();
      const expectedVal = String(sourceModel[field] || '').trim();
      if (!enteredVal || enteredVal !== expectedVal) {
        return false;
      }
    }
    return true;
  }, [paymentInput, isCheckerMode, formData]);

  // 7. Overall Form Validation Rule Engine
  const isFormValid = useMemo(() => {
    for (const conf of fieldConfig) {
      if (conf.required && !conf.hidden) {
        const val = (formData as any)[conf.fieldName];
        if (val === undefined || val === null || String(val).trim() === '') {
          return false;
        }
      }
    }

    const amt = Number(formData.instructedAmount);
    if (isNaN(amt) || amt <= 0) return false;

    if (hardcapResultReceived && hardcapResultReceived.amountWithinLimit === false) {
      return false;
    }

    if (!isDualBlindKeyPassed) {
      return false;
    }

    return true;
  }, [formData, fieldConfig, hardcapResultReceived, isDualBlindKeyPassed]);

  // 8. Emit Output to Parent (Full Interface Contract)
  useEffect(() => {
    if (onPaymentOutput) {
      onPaymentOutput({
        isValid: isFormValid,
        isDualBlindKeyPassed,
        paymentData: formData,
        outputMessage: isFormValid
          ? 'Payment data validated successfully'
          : 'Please review all mandatory fields and format criteria',
        dualBlindKeyResult: isDualBlindKeyPassed
          ? { status: 'PASSED', errorCount: 0 }
          : { status: 'FAILED', errorCount: 1 }
      });
    }
  }, [formData, isFormValid, isDualBlindKeyPassed, onPaymentOutput]);

  // 9. Input Change Handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated: any = {
        ...prev,
        [name]: value
      };

      if (name === 'painPaymentMethodType' || name === 'paymentMethod') {
        updated.painPaymentMethodType = value;
        updated.paymentMethod = value;
        updated.paymentMethodType = value;
        updated.paymentType = value;
      }

      if (onFormChange) {
        onFormChange(updated);
      }
      return updated;
    });

    if (name === 'instructedAmount' || name === 'instructedAmountCurrencyCode') {
      const amt = name === 'instructedAmount' ? Number(value) : Number(formData.instructedAmount);
      const curr = name === 'instructedAmountCurrencyCode' ? value : formData.instructedAmountCurrencyCode || 'USD';
      if (onAmountChange && !isNaN(amt)) {
        onAmountChange({ instructedAmountCurrencyCode: curr, instructedAmount: amt });
      }
    }
  };

  // 10. Checker Mode Double-Click Flagging
  const handleFieldDoubleClick = (fieldName: string) => {
    if (!isCheckerMode) return;
    setFlaggedFields((prev) => {
      const next = prev.includes(fieldName)
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName];

      if (onFailedFieldListChange) {
        onFailedFieldListChange(next);
      }
      return next;
    });
  };

  // 11. CSS Class Resolver
  const getFieldClassName = (fieldName: string) => {
    const classes = ['sspf-control'];
    const disabled = isFieldDisabled(fieldName);

    if (disabled) {
      classes.push('sspf-disabled');
    }

    if (isCheckerMode) {
      if (flaggedFields.includes(fieldName)) {
        classes.push('sspf-flagged-error');
      } else {
        classes.push('sspf-interactive');
      }
    }

    if (isRepairMode) {
      if (repairReviewFieldList.includes(fieldName)) {
        classes.push('sspf-review-amber');
      }
      if (repairNewlyModifyFieldList.includes(fieldName)) {
        classes.push('sspf-modified-green');
      }
    }

    return classes.join(' ');
  };

  const selectedPaymentType = resolvePaymentMethod(formData);

  return (
    <div className="sspf-wrapper">
      <div className="sspf-card">
        <div className="sspf-main-title">Payment Details</div>

        {/* 1. Payment Information */}
        <div className="sspf-subcard">
          <div className="sspf-subcard-title">Payment Information</div>
          <div className="sspf-grid sspf-grid-3">
            {!isFieldHidden('painPaymentMethodType') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('painPaymentMethodType')}>
                <label className="sspf-label" htmlFor="painPaymentMethodType">
                  {getFieldLabel('painPaymentMethodType', 'Payment Type')} {isFieldRequired('painPaymentMethodType') && <span className="sspf-req">*</span>}
                </label>
                <select
                  id="painPaymentMethodType"
                  name="painPaymentMethodType"
                  className={getFieldClassName('painPaymentMethodType')}
                  value={selectedPaymentType}
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
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('requestedExecutionDate')}>
                <label className="sspf-label" htmlFor="requestedExecutionDate">
                  {getFieldLabel('requestedExecutionDate', 'Value Date')} {isFieldRequired('requestedExecutionDate') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="requestedExecutionDate"
                  name="requestedExecutionDate"
                  type="date"
                  className={getFieldClassName('requestedExecutionDate')}
                  value={formData.requestedExecutionDate || ''}
                  disabled={isFieldDisabled('requestedExecutionDate')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('instructedAmountCurrencyCode') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('instructedAmountCurrencyCode')}>
                <label className="sspf-label" htmlFor="instructedAmountCurrencyCode">
                  {getFieldLabel('instructedAmountCurrencyCode', 'Currency')} {isFieldRequired('instructedAmountCurrencyCode') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="instructedAmountCurrencyCode"
                  name="instructedAmountCurrencyCode"
                  type="text"
                  placeholder={getFieldPlaceholder('instructedAmountCurrencyCode', 'e.g. USD')}
                  className={getFieldClassName('instructedAmountCurrencyCode')}
                  value={formData.instructedAmountCurrencyCode || ''}
                  disabled={isFieldDisabled('instructedAmountCurrencyCode')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <div className="sspf-grid sspf-grid-1" style={{ marginTop: '12px' }}>
            {!isFieldHidden('instructedAmount') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('instructedAmount')}>
                <label className="sspf-label" htmlFor="instructedAmount">
                  {getFieldLabel('instructedAmount', 'Transaction Amount')} {isFieldRequired('instructedAmount') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="instructedAmount"
                  name="instructedAmount"
                  type="number"
                  step="any"
                  placeholder={getFieldPlaceholder('instructedAmount', '0.00')}
                  className={getFieldClassName('instructedAmount')}
                  value={formData.instructedAmount || ''}
                  disabled={isFieldDisabled('instructedAmount')}
                  onChange={handleInputChange}
                />
                {hardcapResultReceived && (
                  <span
                    className="sspf-helper-msg"
                    style={{ color: hardcapResultReceived.amountWithinLimit ? '#2e7d32' : '#d32f2f' }}
                  >
                    {hardcapResultReceived.amountWithinLimit
                      ? '✓ Hardcap limit check passed'
                      : `⚠️ Exceeds hardcap threshold (${hardcapResultReceived.hardCapValue})`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Debtor Information */}
        <div className="sspf-subcard">
          <div className="sspf-subcard-title">Debtor Information</div>
          <div className="sspf-grid sspf-grid-3">
            {!isFieldHidden('debtorName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorName')}>
                <label className="sspf-label" htmlFor="debtorName">
                  {getFieldLabel('debtorName', 'Debtor Name')} {isFieldRequired('debtorName') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorName"
                  name="debtorName"
                  type="text"
                  placeholder={getFieldPlaceholder('debtorName', 'Debtor Entity Name')}
                  className={getFieldClassName('debtorName')}
                  value={formData.debtorName || ''}
                  disabled={isFieldDisabled('debtorName')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('debtorAccountNumber') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorAccountNumber')}>
                <label className="sspf-label" htmlFor="debtorAccountNumber">
                  {getFieldLabel('debtorAccountNumber', 'Debtor Account Number')} {isFieldRequired('debtorAccountNumber') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAccountNumber"
                  name="debtorAccountNumber"
                  type="text"
                  placeholder={getFieldPlaceholder('debtorAccountNumber', 'Account / IBAN')}
                  className={getFieldClassName('debtorAccountNumber')}
                  value={formData.debtorAccountNumber || ''}
                  disabled={isFieldDisabled('debtorAccountNumber')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('debtorAgentBIC') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorAgentBIC')}>
                <label className="sspf-label" htmlFor="debtorAgentBIC">
                  {getFieldLabel('debtorAgentBIC', 'Debtor Agent BIC')} {isFieldRequired('debtorAgentBIC') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAgentBIC"
                  name="debtorAgentBIC"
                  type="text"
                  placeholder={getFieldPlaceholder('debtorAgentBIC', 'SWIFT BIC')}
                  className={getFieldClassName('debtorAgentBIC')}
                  value={formData.debtorAgentBIC || ''}
                  disabled={isFieldDisabled('debtorAgentBIC')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Debtor Address Details */}
        <div className="sspf-subcard">
          <div className="sspf-subcard-title">Debtor Address Details</div>
          <div className="sspf-grid sspf-grid-2">
            {!isFieldHidden('debtorAddressLines1') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorAddressLines1')}>
                <label className="sspf-label" htmlFor="debtorAddressLines1">
                  {getFieldLabel('debtorAddressLines1', 'Debtor Address Line 1')} {isFieldRequired('debtorAddressLines1') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAddressLines1"
                  name="debtorAddressLines1"
                  type="text"
                  placeholder={getFieldPlaceholder('debtorAddressLines1', 'Address line 1')}
                  className={getFieldClassName('debtorAddressLines1')}
                  value={(formData as any).debtorAddressLines1 || ''}
                  disabled={isFieldDisabled('debtorAddressLines1')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('debtorAddressLines2') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorAddressLines2')}>
                <label className="sspf-label" htmlFor="debtorAddressLines2">
                  {getFieldLabel('debtorAddressLines2', 'Debtor Address Line 2')} {isFieldRequired('debtorAddressLines2') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAddressLines2"
                  name="debtorAddressLines2"
                  type="text"
                  placeholder={getFieldPlaceholder('debtorAddressLines2', 'Address line 2')}
                  className={getFieldClassName('debtorAddressLines2')}
                  value={(formData as any).debtorAddressLines2 || ''}
                  disabled={isFieldDisabled('debtorAddressLines2')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <div className="sspf-grid sspf-grid-3" style={{ marginTop: '12px' }}>
            {!isFieldHidden('debtorStreetName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorStreetName')}>
                <label className="sspf-label" htmlFor="debtorStreetName">{getFieldLabel('debtorStreetName', 'Debtor Street')}</label>
                <input
                  id="debtorStreetName"
                  name="debtorStreetName"
                  type="text"
                  className={getFieldClassName('debtorStreetName')}
                  value={formData.debtorStreetName || ''}
                  disabled={isFieldDisabled('debtorStreetName')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('debtorBuildingNumber') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorBuildingNumber')}>
                <label className="sspf-label" htmlFor="debtorBuildingNumber">{getFieldLabel('debtorBuildingNumber', 'Building Number')}</label>
                <input
                  id="debtorBuildingNumber"
                  name="debtorBuildingNumber"
                  type="text"
                  className={getFieldClassName('debtorBuildingNumber')}
                  value={formData.debtorBuildingNumber || ''}
                  disabled={isFieldDisabled('debtorBuildingNumber')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('debtorTownName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorTownName')}>
                <label className="sspf-label" htmlFor="debtorTownName">{getFieldLabel('debtorTownName', 'Town / City Name')}</label>
                <input
                  id="debtorTownName"
                  name="debtorTownName"
                  type="text"
                  className={getFieldClassName('debtorTownName')}
                  value={formData.debtorTownName || ''}
                  disabled={isFieldDisabled('debtorTownName')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <div className="sspf-grid sspf-grid-3" style={{ marginTop: '12px' }}>
            {!isFieldHidden('debtorPostalCode') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorPostalCode')}>
                <label className="sspf-label" htmlFor="debtorPostalCode">{getFieldLabel('debtorPostalCode', 'Postal Code')}</label>
                <input
                  id="debtorPostalCode"
                  name="debtorPostalCode"
                  type="text"
                  className={getFieldClassName('debtorPostalCode')}
                  value={formData.debtorPostalCode || ''}
                  disabled={isFieldDisabled('debtorPostalCode')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('debtorCountrySubDivision') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorCountrySubDivision')}>
                <label className="sspf-label" htmlFor="debtorCountrySubDivision">{getFieldLabel('debtorCountrySubDivision', 'Country Sub-division')}</label>
                <input
                  id="debtorCountrySubDivision"
                  name="debtorCountrySubDivision"
                  type="text"
                  className={getFieldClassName('debtorCountrySubDivision')}
                  value={formData.debtorCountrySubDivision || ''}
                  disabled={isFieldDisabled('debtorCountrySubDivision')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('debtorCountryCode') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorCountryCode')}>
                <label className="sspf-label" htmlFor="debtorCountryCode">{getFieldLabel('debtorCountryCode', 'Country Code')}</label>
                <input
                  id="debtorCountryCode"
                  name="debtorCountryCode"
                  type="text"
                  placeholder="e.g. US"
                  className={getFieldClassName('debtorCountryCode')}
                  value={formData.debtorCountryCode || ''}
                  disabled={isFieldDisabled('debtorCountryCode')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {(!isFieldHidden('debtorSortCodeUK') || !isFieldHidden('debtorSortCodeUS')) && (
            <div className="sspf-grid sspf-grid-2" style={{ marginTop: '12px' }}>
              {!isFieldHidden('debtorSortCodeUK') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorSortCodeUK')}>
                  <label className="sspf-label" htmlFor="debtorSortCodeUK">{getFieldLabel('debtorSortCodeUK', 'Debtor Sort Code (UK)')}</label>
                  <input
                    id="debtorSortCodeUK"
                    name="debtorSortCodeUK"
                    type="text"
                    className={getFieldClassName('debtorSortCodeUK')}
                    value={formData.debtorSortCodeUK || ''}
                    disabled={isFieldDisabled('debtorSortCodeUK')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('debtorSortCodeUS') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('debtorSortCodeUS')}>
                  <label className="sspf-label" htmlFor="debtorSortCodeUS">{getFieldLabel('debtorSortCodeUS', 'Debtor Sort Code (US)')}</label>
                  <input
                    id="debtorSortCodeUS"
                    name="debtorSortCodeUS"
                    type="text"
                    className={getFieldClassName('debtorSortCodeUS')}
                    value={formData.debtorSortCodeUS || ''}
                    disabled={isFieldDisabled('debtorSortCodeUS')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Intermediary Bank Details */}
        {(!isFieldHidden('firstIntermediaryBankBIC') || !isFieldHidden('secondIntermediaryBankBIC')) && (
          <div className="sspf-subcard">
            <div className="sspf-subcard-title">Intermediary Bank Details</div>
            
            {!isFieldHidden('firstIntermediaryBankBIC') && (
              <>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>1st Intermediary Bank</div>
                <div className="sspf-grid sspf-grid-3">
                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('firstIntermediaryBankBIC')}>
                    <label className="sspf-label" htmlFor="firstIntermediaryBankBIC">{getFieldLabel('firstIntermediaryBankBIC', '1st Intermediary BIC')}</label>
                    <input
                      id="firstIntermediaryBankBIC"
                      name="firstIntermediaryBankBIC"
                      type="text"
                      className={getFieldClassName('firstIntermediaryBankBIC')}
                      value={formData.firstIntermediaryBankBIC || ''}
                      disabled={isFieldDisabled('firstIntermediaryBankBIC')}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('firstIntermediaryBankRoutingCode')}>
                    <label className="sspf-label" htmlFor="firstIntermediaryBankRoutingCode">{getFieldLabel('firstIntermediaryBankRoutingCode', 'Routing Code')}</label>
                    <input
                      id="firstIntermediaryBankRoutingCode"
                      name="firstIntermediaryBankRoutingCode"
                      type="text"
                      className={getFieldClassName('firstIntermediaryBankRoutingCode')}
                      value={formData.firstIntermediaryBankRoutingCode || ''}
                      disabled={isFieldDisabled('firstIntermediaryBankRoutingCode')}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('firstIntermediaryBankName')}>
                    <label className="sspf-label" htmlFor="firstIntermediaryBankName">{getFieldLabel('firstIntermediaryBankName', 'Bank Name')}</label>
                    <input
                      id="firstIntermediaryBankName"
                      name="firstIntermediaryBankName"
                      type="text"
                      className={getFieldClassName('firstIntermediaryBankName')}
                      value={formData.firstIntermediaryBankName || ''}
                      disabled={isFieldDisabled('firstIntermediaryBankName')}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="sspf-grid sspf-grid-2" style={{ marginTop: '10px', marginBottom: '16px' }}>
                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('firstIntermediaryBankCountryCode')}>
                    <label className="sspf-label" htmlFor="firstIntermediaryBankCountryCode">{getFieldLabel('firstIntermediaryBankCountryCode', 'Country Code')}</label>
                    <input
                      id="firstIntermediaryBankCountryCode"
                      name="firstIntermediaryBankCountryCode"
                      type="text"
                      className={getFieldClassName('firstIntermediaryBankCountryCode')}
                      value={formData.firstIntermediaryBankCountryCode || ''}
                      disabled={isFieldDisabled('firstIntermediaryBankCountryCode')}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('firstIntermediaryBankAccountNumber')}>
                    <label className="sspf-label" htmlFor="firstIntermediaryBankAccountNumber">{getFieldLabel('firstIntermediaryBankAccountNumber', 'Account Number')}</label>
                    <input
                      id="firstIntermediaryBankAccountNumber"
                      name="firstIntermediaryBankAccountNumber"
                      type="text"
                      className={getFieldClassName('firstIntermediaryBankAccountNumber')}
                      value={formData.firstIntermediaryBankAccountNumber || ''}
                      disabled={isFieldDisabled('firstIntermediaryBankAccountNumber')}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            {!isFieldHidden('secondIntermediaryBankBIC') && (
              <>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '8px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>2nd Intermediary Bank</div>
                <div className="sspf-grid sspf-grid-3">
                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('secondIntermediaryBankBIC')}>
                    <label className="sspf-label" htmlFor="secondIntermediaryBankBIC">{getFieldLabel('secondIntermediaryBankBIC', '2nd Intermediary BIC')}</label>
                    <input
                      id="secondIntermediaryBankBIC"
                      name="secondIntermediaryBankBIC"
                      type="text"
                      className={getFieldClassName('secondIntermediaryBankBIC')}
                      value={formData.secondIntermediaryBankBIC || ''}
                      disabled={isFieldDisabled('secondIntermediaryBankBIC')}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('secondIntermediaryBankRoutingCode')}>
                    <label className="sspf-label" htmlFor="secondIntermediaryBankRoutingCode">{getFieldLabel('secondIntermediaryBankRoutingCode', 'Routing Code')}</label>
                    <input
                      id="secondIntermediaryBankRoutingCode"
                      name="secondIntermediaryBankRoutingCode"
                      type="text"
                      className={getFieldClassName('secondIntermediaryBankRoutingCode')}
                      value={formData.secondIntermediaryBankRoutingCode || ''}
                      disabled={isFieldDisabled('secondIntermediaryBankRoutingCode')}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('secondIntermediaryBankName')}>
                    <label className="sspf-label" htmlFor="secondIntermediaryBankName">{getFieldLabel('secondIntermediaryBankName', 'Bank Name')}</label>
                    <input
                      id="secondIntermediaryBankName"
                      name="secondIntermediaryBankName"
                      type="text"
                      className={getFieldClassName('secondIntermediaryBankName')}
                      value={formData.secondIntermediaryBankName || ''}
                      disabled={isFieldDisabled('secondIntermediaryBankName')}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="sspf-grid sspf-grid-2" style={{ marginTop: '10px' }}>
                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('secondIntermediaryBankCountryCode')}>
                    <label className="sspf-label" htmlFor="secondIntermediaryBankCountryCode">{getFieldLabel('secondIntermediaryBankCountryCode', 'Country Code')}</label>
                    <input
                      id="secondIntermediaryBankCountryCode"
                      name="secondIntermediaryBankCountryCode"
                      type="text"
                      className={getFieldClassName('secondIntermediaryBankCountryCode')}
                      value={formData.secondIntermediaryBankCountryCode || ''}
                      disabled={isFieldDisabled('secondIntermediaryBankCountryCode')}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('secondIntermediaryBankAccountNumber')}>
                    <label className="sspf-label" htmlFor="secondIntermediaryBankAccountNumber">{getFieldLabel('secondIntermediaryBankAccountNumber', 'Account Number')}</label>
                    <input
                      id="secondIntermediaryBankAccountNumber"
                      name="secondIntermediaryBankAccountNumber"
                      type="text"
                      className={getFieldClassName('secondIntermediaryBankAccountNumber')}
                      value={formData.secondIntermediaryBankAccountNumber || ''}
                      disabled={isFieldDisabled('secondIntermediaryBankAccountNumber')}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 5. Creditor Information */}
        <div className="sspf-subcard">
          <div className="sspf-subcard-title">Creditor Information</div>
          <div className="sspf-grid sspf-grid-2">
            {!isFieldHidden('creditorName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorName')}>
                <label className="sspf-label" htmlFor="creditorName">
                  {getFieldLabel('creditorName', 'Creditor Name')} {isFieldRequired('creditorName') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorName"
                  name="creditorName"
                  type="text"
                  placeholder={getFieldPlaceholder('creditorName', 'Beneficiary / Creditor Name')}
                  className={getFieldClassName('creditorName')}
                  value={formData.creditorName || ''}
                  disabled={isFieldDisabled('creditorName')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('creditorAccount') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorAccount')}>
                <label className="sspf-label" htmlFor="creditorAccount">
                  {getFieldLabel('creditorAccount', 'Creditor Account')} {isFieldRequired('creditorAccount') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorAccount"
                  name="creditorAccount"
                  type="text"
                  placeholder={getFieldPlaceholder('creditorAccount', 'Account / IBAN')}
                  className={getFieldClassName('creditorAccount')}
                  value={formData.creditorAccount || ''}
                  disabled={isFieldDisabled('creditorAccount')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <div className="sspf-grid sspf-grid-2" style={{ marginTop: '12px' }}>
            {!isFieldHidden('creditorAgentFinancialInstitutionBIC') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorAgentFinancialInstitutionBIC')}>
                <label className="sspf-label" htmlFor="creditorAgentFinancialInstitutionBIC">
                  {getFieldLabel('creditorAgentFinancialInstitutionBIC', 'Creditor Agent BIC')} {isFieldRequired('creditorAgentFinancialInstitutionBIC') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorAgentFinancialInstitutionBIC"
                  name="creditorAgentFinancialInstitutionBIC"
                  type="text"
                  placeholder={getFieldPlaceholder('creditorAgentFinancialInstitutionBIC', 'SWIFT BIC')}
                  className={getFieldClassName('creditorAgentFinancialInstitutionBIC')}
                  value={formData.creditorAgentFinancialInstitutionBIC || ''}
                  disabled={isFieldDisabled('creditorAgentFinancialInstitutionBIC')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('creditorAgentFinancialInstitutionName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorAgentFinancialInstitutionName')}>
                <label className="sspf-label" htmlFor="creditorAgentFinancialInstitutionName">
                  {getFieldLabel('creditorAgentFinancialInstitutionName', 'Creditor Agent Bank Name')} {isFieldRequired('creditorAgentFinancialInstitutionName') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorAgentFinancialInstitutionName"
                  name="creditorAgentFinancialInstitutionName"
                  type="text"
                  className={getFieldClassName('creditorAgentFinancialInstitutionName')}
                  value={formData.creditorAgentFinancialInstitutionName || ''}
                  disabled={isFieldDisabled('creditorAgentFinancialInstitutionName')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {!isFieldHidden('creditorAddressLines1') && (
            <div className="sspf-grid sspf-grid-1" style={{ marginTop: '12px' }}>
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorAddressLines1')}>
                <label className="sspf-label" htmlFor="creditorAddressLines1">
                  {getFieldLabel('creditorAddressLines1', 'Creditor Address Line 1')} {isFieldRequired('creditorAddressLines1') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorAddressLines1"
                  name="creditorAddressLines1"
                  type="text"
                  className={getFieldClassName('creditorAddressLines1')}
                  value={formData.creditorAddressLines1 || ''}
                  disabled={isFieldDisabled('creditorAddressLines1')}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div className="sspf-grid sspf-grid-3" style={{ marginTop: '12px' }}>
            {!isFieldHidden('creditorStreetName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorStreetName')}>
                <label className="sspf-label" htmlFor="creditorStreetName">{getFieldLabel('creditorStreetName', 'Creditor Street')}</label>
                <input
                  id="creditorStreetName"
                  name="creditorStreetName"
                  type="text"
                  className={getFieldClassName('creditorStreetName')}
                  value={formData.creditorStreetName || ''}
                  disabled={isFieldDisabled('creditorStreetName')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('creditorBuildingNumber') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorBuildingNumber')}>
                <label className="sspf-label" htmlFor="creditorBuildingNumber">{getFieldLabel('creditorBuildingNumber', 'Building Number')}</label>
                <input
                  id="creditorBuildingNumber"
                  name="creditorBuildingNumber"
                  type="text"
                  className={getFieldClassName('creditorBuildingNumber')}
                  value={formData.creditorBuildingNumber || ''}
                  disabled={isFieldDisabled('creditorBuildingNumber')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('creditorTownName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorTownName')}>
                <label className="sspf-label" htmlFor="creditorTownName">{getFieldLabel('creditorTownName', 'Town / City Name')}</label>
                <input
                  id="creditorTownName"
                  name="creditorTownName"
                  type="text"
                  className={getFieldClassName('creditorTownName')}
                  value={formData.creditorTownName || ''}
                  disabled={isFieldDisabled('creditorTownName')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <div className="sspf-grid sspf-grid-3" style={{ marginTop: '12px' }}>
            {!isFieldHidden('creditorPostalCode') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorPostalCode')}>
                <label className="sspf-label" htmlFor="creditorPostalCode">{getFieldLabel('creditorPostalCode', 'Postal Code')}</label>
                <input
                  id="creditorPostalCode"
                  name="creditorPostalCode"
                  type="text"
                  className={getFieldClassName('creditorPostalCode')}
                  value={formData.creditorPostalCode || ''}
                  disabled={isFieldDisabled('creditorPostalCode')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('creditorCountrySubDivision') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorCountrySubDivision')}>
                <label className="sspf-label" htmlFor="creditorCountrySubDivision">{getFieldLabel('creditorCountrySubDivision', 'Country Sub-division')}</label>
                <input
                  id="creditorCountrySubDivision"
                  name="creditorCountrySubDivision"
                  type="text"
                  className={getFieldClassName('creditorCountrySubDivision')}
                  value={formData.creditorCountrySubDivision || ''}
                  disabled={isFieldDisabled('creditorCountrySubDivision')}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {!isFieldHidden('creditorCountryCode') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorCountryCode')}>
                <label className="sspf-label" htmlFor="creditorCountryCode">{getFieldLabel('creditorCountryCode', 'Country Code')}</label>
                <input
                  id="creditorCountryCode"
                  name="creditorCountryCode"
                  type="text"
                  className={getFieldClassName('creditorCountryCode')}
                  value={formData.creditorCountryCode || ''}
                  disabled={isFieldDisabled('creditorCountryCode')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {(!isFieldHidden('creditorSortCodeUK') || !isFieldHidden('creditorSortCodeUS')) && (
            <div className="sspf-grid sspf-grid-2" style={{ marginTop: '12px' }}>
              {!isFieldHidden('creditorSortCodeUK') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorSortCodeUK')}>
                  <label className="sspf-label" htmlFor="creditorSortCodeUK">{getFieldLabel('creditorSortCodeUK', 'Creditor Sort Code (UK)')}</label>
                  <input
                    id="creditorSortCodeUK"
                    name="creditorSortCodeUK"
                    type="text"
                    className={getFieldClassName('creditorSortCodeUK')}
                    value={formData.creditorSortCodeUK || ''}
                    disabled={isFieldDisabled('creditorSortCodeUK')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('creditorSortCodeUS') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorSortCodeUS')}>
                  <label className="sspf-label" htmlFor="creditorSortCodeUS">{getFieldLabel('creditorSortCodeUS', 'Creditor Sort Code (US)')}</label>
                  <input
                    id="creditorSortCodeUS"
                    name="creditorSortCodeUS"
                    type="text"
                    className={getFieldClassName('creditorSortCodeUS')}
                    value={formData.creditorSortCodeUS || ''}
                    disabled={isFieldDisabled('creditorSortCodeUS')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Remittance & Charges */}
        <div className="sspf-subcard">
          <div className="sspf-subcard-title">Remittance & Charges</div>
          <div className="sspf-grid sspf-grid-2">
            {!isFieldHidden('chargeBearer') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('chargeBearer')}>
                <label className="sspf-label" htmlFor="chargeBearer">
                  {getFieldLabel('chargeBearer', 'Charge Information')} {isFieldRequired('chargeBearer') && <span className="sspf-req">*</span>}
                </label>
                <select
                  id="chargeBearer"
                  name="chargeBearer"
                  className={getFieldClassName('chargeBearer')}
                  value={formData.chargeBearer || 'SHAR'}
                  disabled={isFieldDisabled('chargeBearer')}
                  onChange={handleInputChange}
                >
                  <option value="SHAR">Shared (SHAR)</option>
                  <option value="DEBT">Debtor (DEBT)</option>
                  <option value="CRED">Creditor (CRED)</option>
                  <option value="SLEV">Service Level (SLEV)</option>
                </select>
              </div>
            )}

            {!isFieldHidden('ustrdPaymentDetails') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('ustrdPaymentDetails')}>
                <label className="sspf-label" htmlFor="ustrdPaymentDetails">{getFieldLabel('ustrdPaymentDetails', 'Remittance Information')}</label>
                <input
                  id="ustrdPaymentDetails"
                  name="ustrdPaymentDetails"
                  type="text"
                  placeholder={getFieldPlaceholder('ustrdPaymentDetails', 'Unstructured Payment Reference')}
                  className={getFieldClassName('ustrdPaymentDetails')}
                  value={formData.ustrdPaymentDetails || ''}
                  disabled={isFieldDisabled('ustrdPaymentDetails')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {(!isFieldHidden('chargesAmount') || !isFieldHidden('chargesAgentBIC')) && (
            <div className="sspf-grid sspf-grid-2" style={{ marginTop: '12px' }}>
              {!isFieldHidden('chargesAmount') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('chargesAmount')}>
                  <label className="sspf-label" htmlFor="chargesAmount">{getFieldLabel('chargesAmount', 'Charges Amount')}</label>
                  <input
                    id="chargesAmount"
                    name="chargesAmount"
                    type="number"
                    step="any"
                    className={getFieldClassName('chargesAmount')}
                    value={formData.chargesAmount || ''}
                    disabled={isFieldDisabled('chargesAmount')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('chargesAgentBIC') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('chargesAgentBIC')}>
                  <label className="sspf-label" htmlFor="chargesAgentBIC">{getFieldLabel('chargesAgentBIC', 'Charges Agent BIC')}</label>
                  <input
                    id="chargesAgentBIC"
                    name="chargesAgentBIC"
                    type="text"
                    className={getFieldClassName('chargesAgentBIC')}
                    value={formData.chargesAgentBIC || ''}
                    disabled={isFieldDisabled('chargesAgentBIC')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7. Tax & Regulatory Reporting */}
        {(!isFieldHidden('taxIdNumber') || !isFieldHidden('purposeOfPayment') || !isFieldHidden('invoiceReferenceNumber')) && (
          <div className="sspf-subcard">
            <div className="sspf-subcard-title">Tax & Regulatory Reporting</div>
            <div className="sspf-grid sspf-grid-3">
              {!isFieldHidden('taxIdNumber') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('taxIdNumber')}>
                  <label className="sspf-label" htmlFor="taxIdNumber">{getFieldLabel('taxIdNumber', 'Tax ID Number')}</label>
                  <input
                    id="taxIdNumber"
                    name="taxIdNumber"
                    type="text"
                    className={getFieldClassName('taxIdNumber')}
                    value={formData.taxIdNumber || ''}
                    disabled={isFieldDisabled('taxIdNumber')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('taxIdType') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('taxIdType')}>
                  <label className="sspf-label" htmlFor="taxIdType">{getFieldLabel('taxIdType', 'Tax ID Type')}</label>
                  <input
                    id="taxIdType"
                    name="taxIdType"
                    type="text"
                    className={getFieldClassName('taxIdType')}
                    value={formData.taxIdType || ''}
                    disabled={isFieldDisabled('taxIdType')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('purposeOfPayment') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('purposeOfPayment')}>
                  <label className="sspf-label" htmlFor="purposeOfPayment">{getFieldLabel('purposeOfPayment', 'Purpose of Payment')}</label>
                  <input
                    id="purposeOfPayment"
                    name="purposeOfPayment"
                    type="text"
                    className={getFieldClassName('purposeOfPayment')}
                    value={formData.purposeOfPayment || ''}
                    disabled={isFieldDisabled('purposeOfPayment')}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="sspf-grid sspf-grid-3" style={{ marginTop: '12px' }}>
              {!isFieldHidden('taxPurposeCode') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('taxPurposeCode')}>
                  <label className="sspf-label" htmlFor="taxPurposeCode">{getFieldLabel('taxPurposeCode', 'Tax Purpose Code')}</label>
                  <input
                    id="taxPurposeCode"
                    name="taxPurposeCode"
                    type="text"
                    className={getFieldClassName('taxPurposeCode')}
                    value={formData.taxPurposeCode || ''}
                    disabled={isFieldDisabled('taxPurposeCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('regulatoryReportingCode') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('regulatoryReportingCode')}>
                  <label className="sspf-label" htmlFor="regulatoryReportingCode">{getFieldLabel('regulatoryReportingCode', 'Regulatory Reporting Code')}</label>
                  <input
                    id="regulatoryReportingCode"
                    name="regulatoryReportingCode"
                    type="text"
                    className={getFieldClassName('regulatoryReportingCode')}
                    value={formData.regulatoryReportingCode || ''}
                    disabled={isFieldDisabled('regulatoryReportingCode')}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!isFieldHidden('invoiceReferenceNumber') && (
                <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('invoiceReferenceNumber')}>
                  <label className="sspf-label" htmlFor="invoiceReferenceNumber">{getFieldLabel('invoiceReferenceNumber', 'Invoice / Reference Number')}</label>
                  <input
                    id="invoiceReferenceNumber"
                    name="invoiceReferenceNumber"
                    type="text"
                    className={getFieldClassName('invoiceReferenceNumber')}
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