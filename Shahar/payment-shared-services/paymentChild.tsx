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

  // 5. Config Map for Fast Lookup
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

  // 6. Validation Rule Engine
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
    return true;
  }, [formData, fieldConfig]);

  // 7. Emit output to parent on change
  useEffect(() => {
    if (onPaymentOutput) {
      onPaymentOutput({
        isValid: isFormValid,
        isDualBlindKeyPassed: true,
        paymentData: formData
      });
    }
  }, [formData, isFormValid, onPaymentOutput]);

  // 8. Change Handler
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

  // 9. Checker Flagging on Double Click
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

  // 10. CSS Class Resolver
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
              <div
                className="sspf-group"
                onDoubleClick={() => handleFieldDoubleClick('painPaymentMethodType')}
              >
                <label className="sspf-label" htmlFor="painPaymentMethodType">
                  Payment Type {isFieldRequired('painPaymentMethodType') && <span className="sspf-req">*</span>}
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
              <div
                className="sspf-group"
                onDoubleClick={() => handleFieldDoubleClick('requestedExecutionDate')}
              >
                <label className="sspf-label" htmlFor="requestedExecutionDate">
                  Value Date {isFieldRequired('requestedExecutionDate') && <span className="sspf-req">*</span>}
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
              <div
                className="sspf-group"
                onDoubleClick={() => handleFieldDoubleClick('instructedAmountCurrencyCode')}
              >
                <label className="sspf-label" htmlFor="instructedAmountCurrencyCode">
                  Currency {isFieldRequired('instructedAmountCurrencyCode') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="instructedAmountCurrencyCode"
                  name="instructedAmountCurrencyCode"
                  type="text"
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
              <div
                className="sspf-group"
                onDoubleClick={() => handleFieldDoubleClick('instructedAmount')}
              >
                <label className="sspf-label" htmlFor="instructedAmount">
                  Transaction Amount {isFieldRequired('instructedAmount') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="instructedAmount"
                  name="instructedAmount"
                  type="number"
                  step="any"
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
                  Debtor Name {isFieldRequired('debtorName') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorName"
                  name="debtorName"
                  type="text"
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
                  Debtor Account Number {isFieldRequired('debtorAccountNumber') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAccountNumber"
                  name="debtorAccountNumber"
                  type="text"
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
                  Debtor Agent BIC {isFieldRequired('debtorAgentBIC') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAgentBIC"
                  name="debtorAgentBIC"
                  type="text"
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
                  Debtor Address Line 1 {isFieldRequired('debtorAddressLines1') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAddressLines1"
                  name="debtorAddressLines1"
                  type="text"
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
                  Debtor Address Line 2 {isFieldRequired('debtorAddressLines2') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="debtorAddressLines2"
                  name="debtorAddressLines2"
                  type="text"
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
                <label className="sspf-label" htmlFor="debtorStreetName">Debtor Street</label>
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
                <label className="sspf-label" htmlFor="debtorBuildingNumber">Building Number</label>
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
                <label className="sspf-label" htmlFor="debtorTownName">Town / City Name</label>
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
                <label className="sspf-label" htmlFor="debtorPostalCode">Postal Code</label>
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
                <label className="sspf-label" htmlFor="debtorCountrySubDivision">Country Sub-division</label>
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
                <label className="sspf-label" htmlFor="debtorCountryCode">Country Code</label>
                <input
                  id="debtorCountryCode"
                  name="debtorCountryCode"
                  type="text"
                  className={getFieldClassName('debtorCountryCode')}
                  value={formData.debtorCountryCode || ''}
                  disabled={isFieldDisabled('debtorCountryCode')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. Creditor Information */}
        <div className="sspf-subcard">
          <div className="sspf-subcard-title">Creditor Information</div>
          <div className="sspf-grid sspf-grid-2">
            {!isFieldHidden('creditorName') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('creditorName')}>
                <label className="sspf-label" htmlFor="creditorName">
                  Creditor Name {isFieldRequired('creditorName') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorName"
                  name="creditorName"
                  type="text"
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
                  Creditor Account {isFieldRequired('creditorAccount') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorAccount"
                  name="creditorAccount"
                  type="text"
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
                  Creditor Agent BIC {isFieldRequired('creditorAgentFinancialInstitutionBIC') && <span className="sspf-req">*</span>}
                </label>
                <input
                  id="creditorAgentFinancialInstitutionBIC"
                  name="creditorAgentFinancialInstitutionBIC"
                  type="text"
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
                  Creditor Agent Bank Name {isFieldRequired('creditorAgentFinancialInstitutionName') && <span className="sspf-req">*</span>}
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
        </div>

        {/* 5. Remittance Details */}
        <div className="sspf-subcard">
          <div className="sspf-subcard-title">Remittance & Charges</div>
          <div className="sspf-grid sspf-grid-2">
            {!isFieldHidden('chargeBearer') && (
              <div className="sspf-group" onDoubleClick={() => handleFieldDoubleClick('chargeBearer')}>
                <label className="sspf-label" htmlFor="chargeBearer">
                  Charge Bearer {isFieldRequired('chargeBearer') && <span className="sspf-req">*</span>}
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
                <label className="sspf-label" htmlFor="ustrdPaymentDetails">Remittance Information</label>
                <input
                  id="ustrdPaymentDetails"
                  name="ustrdPaymentDetails"
                  type="text"
                  className={getFieldClassName('ustrdPaymentDetails')}
                  value={formData.ustrdPaymentDetails || ''}
                  disabled={isFieldDisabled('ustrdPaymentDetails')}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSPaymentFlow;