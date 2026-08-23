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

export interface PaymentChildProps {
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

export const PaymentChild: FC<PaymentChildProps> = ({
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
  // 1. Internal Form State
  const [formData, setFormData] = useState<Pain001Model>(() => {
    const base = createEmptyPain001();
    const incoming = paymentInput?.paymentModel || {};
    const method = (incoming as any).paymentMethod || incoming.painPaymentMethodType || 'CBT';
    return {
      ...base,
      ...incoming,
      painPaymentMethodType: method,
      paymentMethod: method
    } as any;
  });

  // 2. Checker Mode Flagged Fields State
  const [flaggedFields, setFlaggedFields] = useState<string[]>([]);

  // 3. Sync Form Data on `paymentInput` Update
  useEffect(() => {
    if (paymentInput?.paymentModel) {
      const incoming = paymentInput.paymentModel;
      const method = (incoming as any).paymentMethod || incoming.painPaymentMethodType || 'CBT';
      setFormData((prev) => ({
        ...prev,
        ...incoming,
        painPaymentMethodType: method,
        paymentMethod: method
      }));
    }
  }, [paymentInput]);

  // 4. Quick Helper to Check Field Configuration
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

  // 5. Validation Check
  const isFormValid = useMemo(() => {
    // Check mandatory fields defined in fieldConfig
    for (const conf of fieldConfig) {
      if (conf.required && !conf.hidden) {
        const val = (formData as any)[conf.fieldName];
        if (val === undefined || val === null || String(val).trim() === '') {
          return false;
        }
      }
    }
    // Amount must be positive number
    const amt = Number(formData.instructedAmount);
    if (isNaN(amt) || amt <= 0) return false;

    return true;
  }, [formData, fieldConfig]);

  // 6. Emit Form Output to Parent
  useEffect(() => {
    if (onPaymentOutput) {
      onPaymentOutput({
        isValid: isFormValid,
        isDualBlindKeyPassed: true,
        paymentData: formData
      });
    }
  }, [formData, isFormValid, onPaymentOutput]);

  // 7. Input Change Handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated: any = {
        ...prev,
        [name]: value
      };

      // Keep payment method aliases synced
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

    // Notify parent if amount changes to trigger Hardcap verification
    if (name === 'instructedAmount' || name === 'instructedAmountCurrencyCode') {
      const amt = name === 'instructedAmount' ? Number(value) : Number(formData.instructedAmount);
      const curr = name === 'instructedAmountCurrencyCode' ? value : formData.instructedAmountCurrencyCode || 'USD';
      if (onAmountChange && !isNaN(amt)) {
        onAmountChange({ instructedAmountCurrencyCode: curr, instructedAmount: amt });
      }
    }
  };

  // 8. Checker Mode: Toggle Field Rejection on Double-Click
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

  // 9. Field Dynamic Class Resolver (Styling & Review Highlights)
  const getFieldClassName = (fieldName: string) => {
    const classes = ['form-control'];
    const disabled = isFieldDisabled(fieldName);

    if (disabled) {
      classes.push('field-disabled');
    }

    if (isCheckerMode) {
      if (flaggedFields.includes(fieldName)) {
        classes.push('field-flagged-error');
      } else {
        classes.push('checker-interactive-field');
      }
    }

    if (isRepairMode) {
      if (repairReviewFieldList.includes(fieldName)) {
        classes.push('field-review-amber');
      }
      if (repairNewlyModifyFieldList.includes(fieldName)) {
        classes.push('field-modified-green');
      }
    }

    return classes.join(' ');
  };

  return (
    <div className="sspayment-flow-container">
      {/* 1. PAYMENT DETAILS SECTION */}
      <div className="form-section-card">
        <div className="section-header-title">Payment Details</div>

        {/* Subsection: Payment Information */}
        <div className="subsection-block">
          <div className="subsection-title">Payment Information</div>
          <div className="form-grid grid-3-col">
            {/* Payment Type */}
            {!isFieldHidden('painPaymentMethodType') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('painPaymentMethodType')}
              >
                <label htmlFor="painPaymentMethodType">
                  Payment Type {isFieldRequired('painPaymentMethodType') && <span className="req-star">*</span>}
                </label>
                <select
                  id="painPaymentMethodType"
                  name="painPaymentMethodType"
                  className={getFieldClassName('painPaymentMethodType')}
                  value={(formData as any).painPaymentMethodType || (formData as any).paymentMethod || 'CBT'}
                  disabled={isFieldDisabled('painPaymentMethodType')}
                  onChange={handleInputChange}
                >
                  <option value="CBT">CBT</option>
                  <option value="BKT">BKT</option>
                  <option value="DFT">DFT</option>
                </select>
              </div>
            )}

            {/* Value Date */}
            {!isFieldHidden('requestedExecutionDate') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('requestedExecutionDate')}
              >
                <label htmlFor="requestedExecutionDate">
                  Value Date {isFieldRequired('requestedExecutionDate') && <span className="req-star">*</span>}
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

            {/* Currency */}
            {!isFieldHidden('instructedAmountCurrencyCode') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('instructedAmountCurrencyCode')}
              >
                <label htmlFor="instructedAmountCurrencyCode">
                  Currency {isFieldRequired('instructedAmountCurrencyCode') && <span className="req-star">*</span>}
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

          {/* Transaction Amount */}
          <div className="form-grid grid-1-col" style={{ marginTop: '12px' }}>
            {!isFieldHidden('instructedAmount') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('instructedAmount')}
              >
                <label htmlFor="instructedAmount">
                  Transaction Amount {isFieldRequired('instructedAmount') && <span className="req-star">*</span>}
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
                  <span className="hardcap-status-msg" style={{ color: hardcapResultReceived.amountWithinLimit ? '#2e7d32' : '#d32f2f' }}>
                    {hardcapResultReceived.amountWithinLimit
                      ? '✓ Hardcap limit check passed'
                      : `⚠️ Exceeds hardcap threshold (${hardcapResultReceived.hardCapValue})`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subsection: Debtor Information */}
        <div className="subsection-block">
          <div className="subsection-title">Debtor Information</div>
          <div className="form-grid grid-3-col">
            {/* Debtor Name */}
            {!isFieldHidden('debtorName') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorName')}
              >
                <label htmlFor="debtorName">
                  Debtor Name {isFieldRequired('debtorName') && <span className="req-star">*</span>}
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

            {/* Debtor Account Number */}
            {!isFieldHidden('debtorAccountNumber') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorAccountNumber')}
              >
                <label htmlFor="debtorAccountNumber">
                  Debtor Account Number {isFieldRequired('debtorAccountNumber') && <span className="req-star">*</span>}
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

            {/* Debtor Agent BIC */}
            {!isFieldHidden('debtorAgentBIC') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorAgentBIC')}
              >
                <label htmlFor="debtorAgentBIC">
                  Debtor Agent BIC {isFieldRequired('debtorAgentBIC') && <span className="req-star">*</span>}
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

        {/* Subsection: Debtor Address Details */}
        <div className="subsection-block">
          <div className="subsection-title">Debtor Address Details</div>
          <div className="form-grid grid-2-col">
            {/* Address Line 1 */}
            {!isFieldHidden('debtorAddressLines1') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorAddressLines1')}
              >
                <label htmlFor="debtorAddressLines1">
                  Debtor Address Line 1 {isFieldRequired('debtorAddressLines1') && <span className="req-star">*</span>}
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

            {/* Address Line 2 */}
            {!isFieldHidden('debtorAddressLines2') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorAddressLines2')}
              >
                <label htmlFor="debtorAddressLines2">
                  Debtor Address Line 2 {isFieldRequired('debtorAddressLines2') && <span className="req-star">*</span>}
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

          <div className="form-grid grid-3-col" style={{ marginTop: '12px' }}>
            {/* Street */}
            {!isFieldHidden('debtorStreetName') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorStreetName')}
              >
                <label htmlFor="debtorStreetName">Debtor Street</label>
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

            {/* Building Number */}
            {!isFieldHidden('debtorBuildingNumber') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorBuildingNumber')}
              >
                <label htmlFor="debtorBuildingNumber">Building Number</label>
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

            {/* Town / City Name */}
            {!isFieldHidden('debtorTownName') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorTownName')}
              >
                <label htmlFor="debtorTownName">Town / City Name</label>
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

          <div className="form-grid grid-3-col" style={{ marginTop: '12px' }}>
            {/* Postal Code */}
            {!isFieldHidden('debtorPostalCode') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorPostalCode')}
              >
                <label htmlFor="debtorPostalCode">Postal Code</label>
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

            {/* Country Sub-Division */}
            {!isFieldHidden('debtorCountrySubDivision') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorCountrySubDivision')}
              >
                <label htmlFor="debtorCountrySubDivision">Country Sub-division</label>
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

            {/* Country Code */}
            {!isFieldHidden('debtorCountryCode') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('debtorCountryCode')}
              >
                <label htmlFor="debtorCountryCode">Country Code</label>
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

        {/* Subsection: Creditor Information */}
        <div className="subsection-block">
          <div className="subsection-title">Creditor Information</div>
          <div className="form-grid grid-2-col">
            {/* Creditor Name */}
            {!isFieldHidden('creditorName') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('creditorName')}
              >
                <label htmlFor="creditorName">
                  Creditor Name {isFieldRequired('creditorName') && <span className="req-star">*</span>}
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

            {/* Creditor Account */}
            {!isFieldHidden('creditorAccount') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('creditorAccount')}
              >
                <label htmlFor="creditorAccount">
                  Creditor Account {isFieldRequired('creditorAccount') && <span className="req-star">*</span>}
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

          <div className="form-grid grid-2-col" style={{ marginTop: '12px' }}>
            {/* Creditor Agent BIC */}
            {!isFieldHidden('creditorAgentFinancialInstitutionBIC') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('creditorAgentFinancialInstitutionBIC')}
              >
                <label htmlFor="creditorAgentFinancialInstitutionBIC">
                  Creditor Agent BIC {isFieldRequired('creditorAgentFinancialInstitutionBIC') && <span className="req-star">*</span>}
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

            {/* Creditor Agent Bank Name */}
            {!isFieldHidden('creditorAgentFinancialInstitutionName') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('creditorAgentFinancialInstitutionName')}
              >
                <label htmlFor="creditorAgentFinancialInstitutionName">
                  Creditor Agent Bank Name {isFieldRequired('creditorAgentFinancialInstitutionName') && <span className="req-star">*</span>}
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

        {/* Subsection: Remittance & Settlement */}
        <div className="subsection-block">
          <div className="subsection-title">Remittance & Settlement Details</div>
          <div className="form-grid grid-2-col">
            {/* Charge Bearer */}
            {!isFieldHidden('chargeBearer') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('chargeBearer')}
              >
                <label htmlFor="chargeBearer">
                  Charge Bearer {isFieldRequired('chargeBearer') && <span className="req-star">*</span>}
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

            {/* Remittance Information */}
            {!isFieldHidden('ustrdPaymentDetails') && (
              <div
                className="form-group"
                onDoubleClick={() => handleFieldDoubleClick('ustrdPaymentDetails')}
              >
                <label htmlFor="ustrdPaymentDetails">Remittance Information</label>
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

export default PaymentChild;














// import React, {
//   FC,
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
//   ChangeEvent,
//   MouseEvent
// } from 'react';
// import {
//   Pain001Model,
//   PaymentMode,
//   PaymentComponentInput,
//   PaymentComponentOutput,
//   FormFieldConfig,
//   FormValidityPayload,
//   PAIN001_MANDATORY_FIELDS,
//   PAYMENT_TYPE_OPTIONS,
//   CHARGE_BEARER_OPTIONS,
//   createEmptyPain001
// } from '../types/models';
// import {
//   genericValidator,
//   ValidationEffect
// } from '../services/genericValidator';
// import { addressService } from '../services/addressService';
// import { buildPain001FromForm } from '../utils/paymentUtils';
// import { LATAM_COUNTRIES } from '../services/validationRulesService';
// import './payment-flow.css';

// export interface SSPaymentFlowProps {
//   paymentInput: PaymentComponentInput;
//   fieldConfig?: FormFieldConfig[];
//   initialData?: Partial<Pain001Model>;
//   pacsFormVerbiages?: Record<string, string>;
//   loggedInUser?: string;
//   isMakerMode?: boolean;
//   isCheckerMode?: boolean;
//   isRepairMode?: boolean;
//   repairReviewFieldList?: string[];
//   repairNewlyModifyFieldList?: string[];
//   hardcapResultReceived?: { amountWithinLimit: boolean; hardCapValue: number } | string | null;
//   onPaymentOutput?: (output: PaymentComponentOutput) => void;
//   onFormChange?: (val: Record<string, unknown>) => void;
//   onFormValidityChange?: (val: FormValidityPayload) => void;
//   onFailedFieldListChange?: (fields: string[]) => void;
//   onAmountChange?: (val: { instructedAmountCurrencyCode: string; instructedAmount: number }) => void;
// }

// export const PaymentChild: FC<SSPaymentFlowProps> = ({
//   paymentInput,
//   fieldConfig = [],
//   initialData,
//   pacsFormVerbiages = {},
//   isMakerMode: _isMakerMode,
//   isCheckerMode,
//   isRepairMode,
//   repairReviewFieldList = [],
//   repairNewlyModifyFieldList = [],
//   hardcapResultReceived,
//   onPaymentOutput,
//   onFormChange,
//   onFormValidityChange,
//   onFailedFieldListChange,
//   onAmountChange
// }) => {
//   const selectedMode: PaymentMode = isCheckerMode ? 'checker' : isRepairMode ? 'repair' : 'maker';
//   const isChecker = selectedMode === 'checker';
//   const isRepair = selectedMode === 'repair';
//   const isDualBlindEnabled = paymentInput?.dualBlindKeyFlag === 'Y' && isChecker;

//   const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

//   const configMap = useMemo(() => {
//     const map = new Map<string, FormFieldConfig>();
//     fieldConfig.forEach(cfg => map.set(cfg.fieldName, cfg));
//     return map;
//   }, [fieldConfig]);

//   const [formValues, setFormValues] = useState<Pain001Model>(() => {
//     const empty = createEmptyPain001() as Record<string, any>;
//     const init = { ...(initialData || {}), ...(paymentInput?.paymentModel || {}) } as Record<string, any>;
//     const values: Record<string, any> = {};

//     fieldConfig.forEach(cfg => {
//       values[cfg.fieldName] = cfg.value ?? init[cfg.fieldName] ?? empty[cfg.fieldName] ?? '';
//     });

//     [
//       'debtorAddressLines1',
//       'debtorAddressLines2',
//       'creditorAddressLines1',
//       'creditorAddressLines2',
//       'debtorState',
//       'creditorState'
//     ].forEach(f => {
//       if (!(f in values)) {
//         values[f] = String(init[f] ?? '');
//       }
//     });

//     return { ...empty, ...values } as Pain001Model;
//   });

//   const [touched, setTouched] = useState<Record<string, boolean>>({});
//   const [failedFields, setFailedFields] = useState<string[]>(paymentInput?.rejectedFieldList || []);
//   const [newlyModifiedFields, setNewlyModifiedFields] = useState<string[]>(repairNewlyModifyFieldList);
//   const [dualBlindErrors, setDualBlindErrors] = useState<Map<string, string>>(new Map());
//   const [isDualBlindPassed, setIsDualBlindPassed] = useState<boolean>(false);
//   const [validationResults, setValidationResults] = useState<Map<string, ValidationEffect>>(new Map());

//   const [isDebtorCountryReadonly, setIsDebtorCountryReadonly] = useState<boolean>(false);
//   const [isCreditorCountryReadonly, setIsCreditorCountryReadonly] = useState<boolean>(false);
//   const [showSecondIntermediary, setShowSecondIntermediary] = useState<boolean>(false);

//   const [hardcapChecking, setHardcapChecking] = useState<boolean>(false);
//   const [hardcapError, setHardcapError] = useState<string>('');
//   const [hardcapSuccessMessage, setHardcapSuccessMessage] = useState<string>('');

//   const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
//     paymentDetails: false,
//     paymentInformation: false,
//     debtorInformation: false,
//     debtorAddress: false,
//     beneficiaryDetails: false,
//     creditorInformation: false,
//     creditorAddress: false,
//     intermediaryBank: false,
//     additionalInformation: false,
//     additionalDetails: false,
//     chargeDetails: false,
//     taxDetails: false
//   });

//   const dualBlindCache = useRef<Map<string, string>>(new Map());
//   const debtorBicDebouncer = useRef<NodeJS.Timeout>();
//   const creditorBicDebouncer = useRef<NodeJS.Timeout>();
//   const debtorAddrDebouncer = useRef<NodeJS.Timeout>();
//   const creditorAddrDebouncer = useRef<NodeJS.Timeout>();
//   const amountDebouncer = useRef<NodeJS.Timeout>();

//   const toggleSection = (sectionKey: string) => {
//     setSectionCollapsed(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
//   };

//   const setField = useCallback((fieldName: keyof Pain001Model, value: unknown, emitEvent = true) => {
//     setFormValues(prev => {
//       if ((prev as any)[fieldName] === value) return prev;
//       return { ...prev, [fieldName]: value };
//     });

//     if (isRepair) {
//       setNewlyModifiedFields(prev => (prev.includes(fieldName as string) ? prev : [...prev, fieldName as string]));
//     }

//     if (emitEvent) {
//       queueMicrotask(() => {
//         setFormValues(latest => {
//           onFormChange?.(latest as unknown as Record<string, unknown>);
//           return latest;
//         });
//       });
//     }
//   }, [isRepair, onFormChange]);

//   useEffect(() => {
//     if (isDualBlindEnabled && paymentInput?.paymentModel) {
//       dualBlindCache.current.clear();
//       paymentInput.dualBlindKeyFields?.forEach(field => {
//         const raw = (paymentInput.paymentModel as any)?.[field];
//         dualBlindCache.current.set(field, String(raw ?? '').trim());
//       });

//       setFormValues(prev => {
//         const masked = { ...prev };
//         paymentInput.dualBlindKeyFields?.forEach(field => {
//           (masked as any)[field] = '';
//         });
//         return masked;
//       });
//     }
//   }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, paymentInput?.paymentModel]);

//   const validateSingleDualBlindKeyField = useCallback((fieldName: string) => {
//     if (!isDualBlindEnabled || !paymentInput.dualBlindKeyFields?.includes(fieldName)) return;
//     const original = dualBlindCache.current.get(fieldName) ?? '';
//     const current = String((formValues as any)[fieldName] ?? '').trim();

//     setDualBlindErrors(prev => {
//       const next = new Map(prev);
//       if (original !== current) {
//         next.set(fieldName, 'Data does not match');
//       } else {
//         next.delete(fieldName);
//       }
//       return next;
//     });
//   }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]);

//   useEffect(() => {
//     if (!isDualBlindEnabled) {
//       setIsDualBlindPassed(true);
//       return;
//     }
//     const allMatched = (paymentInput.dualBlindKeyFields || []).every(f => {
//       const orig = dualBlindCache.current.get(f) ?? '';
//       const curr = String((formValues as any)[f] ?? '').trim();
//       return orig !== '' && orig === curr;
//     });
//     setIsDualBlindPassed(allMatched);
//   }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]);

//   useEffect(() => {
//     const rawForm = formValues as unknown as Record<string, unknown>;
//     const fieldMap = genericValidator.evaluateAllFields(rawForm);
//     const formEffects = genericValidator.evaluateFormRules(rawForm);
//     const finalMap = genericValidator.applyToForm(fieldMap, formEffects);
//     setValidationResults(finalMap);
//   }, [formValues]);

//   useEffect(() => {
//     if (debtorBicDebouncer.current) clearTimeout(debtorBicDebouncer.current);
//     debtorBicDebouncer.current = setTimeout(() => {
//       const val = formValues.debtorAgentBIC;
//       if (val && val.length >= 6) {
//         setIsDebtorCountryReadonly(true);
//         setField('debtorCountryCode', val.substring(4, 6).toUpperCase());
//       } else {
//         setIsDebtorCountryReadonly(false);
//       }
//     }, 400);
//     return () => clearTimeout(debtorBicDebouncer.current);
//   }, [formValues.debtorAgentBIC, setField]);

//   useEffect(() => {
//     if (creditorBicDebouncer.current) clearTimeout(creditorBicDebouncer.current);
//     creditorBicDebouncer.current = setTimeout(() => {
//       const val = formValues.creditorAgentFinancialInstitutionBIC;
//       if (val && val.length >= 6) {
//         setIsCreditorCountryReadonly(true);
//         setField('creditorCountryCode', val.substring(4, 6).toUpperCase());
//       } else {
//         setIsCreditorCountryReadonly(false);
//       }
//     }, 400);
//     return () => clearTimeout(creditorBicDebouncer.current);
//   }, [formValues.creditorAgentFinancialInstitutionBIC, setField]);

//   useEffect(() => {
//     if (isChecker) return;
//     if (debtorAddrDebouncer.current) clearTimeout(debtorAddrDebouncer.current);
//     debtorAddrDebouncer.current = setTimeout(async () => {
//       const { debtorAccountNumber, debtorAgentBIC, debtorCountryCode } = formValues;
//       if (!debtorAccountNumber || !/^[A-Z]{2}$/.test(debtorCountryCode || '')) return;

//       try {
//         const lookupFn = (addressService as any).lookupDebtorAddress || (addressService as any).lookupDebtorAddresss;
//         if (typeof lookupFn === 'function') {
//           const res = await lookupFn.call(addressService, '/shared-services/api/payment/api/payments', {
//             account: debtorAccountNumber,
//             bic: debtorAgentBIC,
//             countryCode: debtorCountryCode
//           });

//           if (res) {
//             setFormValues(prev => ({
//               ...prev,
//               debtorAddressLines1: res.addressLine?.[0] || prev.debtorAddressLines1,
//               debtorAddressLines2: res.addressLine?.[1] || prev.debtorAddressLines2,
//               debtorStreetName: res.streetName || prev.debtorStreetName,
//               debtorBuildingNumber: res.buildingNumber || prev.debtorBuildingNumber,
//               debtorPostalCode: res.postalCode || prev.debtorPostalCode,
//               debtorTownName: res.townName || prev.debtorTownName,
//               debtorCountrySubDivision: res.countrySubDivision || prev.debtorCountrySubDivision,
//               debtorState: res.state || prev.debtorState,
//               debtorCountryCode: res.countryCode || prev.debtorCountryCode
//             }));
//           }
//         }
//       } catch (err) {
//         console.warn('Debtor address lookup failed:', err);
//       }
//     }, 300);
//     return () => clearTimeout(debtorAddrDebouncer.current);
//   }, [formValues.debtorAccountNumber, formValues.debtorAgentBIC, formValues.debtorCountryCode, isChecker]);

//   useEffect(() => {
//     if (isChecker) return;
//     if (creditorAddrDebouncer.current) clearTimeout(creditorAddrDebouncer.current);
//     creditorAddrDebouncer.current = setTimeout(async () => {
//       const {
//         creditorAccount,
//         creditorCountryCode,
//         creditorAgentFinancialInstitutionBIC,
//         creditorSortCodeUS,
//         creditorSortCodeUK
//       } = formValues;

//       if (!creditorAccount || !/^[A-Z]{2}$/.test(creditorCountryCode || '')) return;

//       let shortCode = '';
//       if (creditorCountryCode === 'US') shortCode = creditorSortCodeUS || '';
//       else if (creditorCountryCode === 'GB') shortCode = creditorSortCodeUK || '';

//       try {
//         const lookupFn = (addressService as any).lookupCreditorAddress || (addressService as any).lookupCreditorAddesss;
//         if (typeof lookupFn === 'function') {
//           const res = await lookupFn.call(addressService, '/shared-services/api/payment/api/payments', {
//             account: creditorAccount,
//             bic: creditorAgentFinancialInstitutionBIC || '',
//             countryCode: creditorCountryCode || '',
//             shortCode
//           });

//           if (res) {
//             setFormValues(prev => ({
//               ...prev,
//               creditorAddressLines1: res.addressLine?.[0] || prev.creditorAddressLines1,
//               creditorAddressLines2: res.addressLine?.[1] || prev.creditorAddressLines2,
//               creditorStreetName: res.streetName || prev.creditorStreetName,
//               creditorBuildingNumber: res.buildingNumber || prev.creditorBuildingNumber,
//               creditorPostalCode: res.postalCode || prev.creditorPostalCode,
//               creditorTownName: res.townName || prev.creditorTownName,
//               creditorCountrySubDivision: res.countrySubDivision || prev.creditorCountrySubDivision,
//               creditorState: res.state || prev.creditorState,
//               creditorCountryCode: res.countryCode || prev.creditorCountryCode
//             }));
//           }
//         }
//       } catch (err) {
//         console.warn('Creditor address lookup failed:', err);
//       }
//     }, 300);

//     return () => clearTimeout(creditorAddrDebouncer.current);
//   }, [
//     formValues.creditorAccount,
//     formValues.creditorCountryCode,
//     formValues.creditorAgentFinancialInstitutionBIC,
//     formValues.creditorSortCodeUS,
//     formValues.creditorSortCodeUK,
//     isChecker
//   ]);

//   const instructedAmountChange = (rawInputVal?: string) => {
//     if (amountDebouncer.current) clearTimeout(amountDebouncer.current);
//     amountDebouncer.current = setTimeout(() => {
//       const valToParse = rawInputVal !== undefined ? rawInputVal : String(formValues.instructedAmount ?? '');
//       const parsedAmount = parseFloat(valToParse);

//       if (isNaN(parsedAmount) || parsedAmount <= 0) {
//         setHardcapChecking(false);
//         setHardcapError('');
//         setHardcapSuccessMessage('');
//         return;
//       }

//       setHardcapChecking(true);
//       onAmountChange?.({
//         instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
//         instructedAmount: parsedAmount
//       });
//     }, 400);
//   };

//   const onAmountBlur = () => {
//     const parsedAmount = parseFloat(String(formValues.instructedAmount ?? ''));
//     if (!isNaN(parsedAmount) && parsedAmount > 0) {
//       onAmountChange?.({
//         instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
//         instructedAmount: parsedAmount
//       });
//     }
//   };

//   useEffect(() => {
//     if (hardcapResultReceived !== undefined && hardcapResultReceived !== null) {
//       setHardcapChecking(false);
//       if (typeof hardcapResultReceived === 'string') {
//         if (hardcapResultReceived.includes('passed')) {
//           setHardcapSuccessMessage(hardcapResultReceived);
//           setHardcapError('');
//         } else {
//           setHardcapError(hardcapResultReceived);
//           setHardcapSuccessMessage('');
//         }
//       } else if (typeof hardcapResultReceived === 'object') {
//         if (hardcapResultReceived.amountWithinLimit) {
//           setHardcapSuccessMessage('Hardcap limit check passed');
//           setHardcapError('');
//         } else {
//           setHardcapError(`Value cannot be more than ${hardcapResultReceived.hardCapValue}`);
//           setHardcapSuccessMessage('');
//         }
//       }
//     }
//   }, [hardcapResultReceived]);

//   const isFieldReadonly = useCallback((fieldName: keyof Pain001Model) => {
//     if (isChecker) {
//       if (fieldName === 'debtorCountryCode') return true;
//       if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName as string)) {
//         return false;
//       }
//       return true;
//     }

//     if (fieldName === 'debtorCountryCode' && isDebtorCountryReadonly) return true;
//     if (fieldName === 'debtorCountryCode') return false;
//     if (fieldName === 'creditorCountryCode' && isCreditorCountryReadonly) return true;
//     if (fieldName === 'creditorCountryCode') return false;

//     return false;
//   }, [isChecker, isDualBlindEnabled, paymentInput?.dualBlindKeyFields, isDebtorCountryReadonly, isCreditorCountryReadonly]);

//   const handleDoubleClickFailedField = (fieldName: string, e: MouseEvent) => {
//     e.stopPropagation();
//     if (!isChecker) return;
//     if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName)) return;

//     setFailedFields(prev => {
//       const next = prev.includes(fieldName)
//         ? prev.filter(f => f !== fieldName)
//         : [...prev, fieldName];
//       onFailedFieldListChange?.(next);
//       return next;
//     });
//   };

//   const isFormValid = useMemo(() => {
//     for (const [fName, rule] of validationResults.entries()) {
//       if (rule.visible !== false && rule.required) {
//         const val = (formValues as any)[fName];
//         if (val === '' || val === null || val === undefined || val === 0) return false;
//       }
//       if (rule.visible !== false && rule.pattern) {
//         const val = String((formValues as any)[fName] || '');
//         if (val && !new RegExp(rule.pattern).test(val)) return false;
//       }
//     }

//     const hasMissingMandatory = PAIN001_MANDATORY_FIELDS.some(f => {
//       const val = (formValues as any)[f];
//       return val === '' || val === null || val === undefined || val === 0;
//     });
//     if (hasMissingMandatory) return false;

//     if (isChecker && isDualBlindEnabled && !isDualBlindPassed) return false;
//     if (isChecker && failedFields.length > 0) return false;
//     if (hardcapError) return false;

//     return true;
//   }, [validationResults, formValues, isChecker, isDualBlindEnabled, isDualBlindPassed, failedFields, hardcapError]);

//   useEffect(() => {
//     const payload: PaymentComponentOutput = {
//       paymentData: buildPain001FromForm(formValues),
//       isValid: isFormValid,
//       outputMessage: isFormValid ? 'Valid' : 'Invalid form requirements',
//       dualBlindKeyResult: isDualBlindEnabled ? (isDualBlindPassed ? 'passed' : 'failed') : null,
//       isDualBlindKeyPassed: isDualBlindPassed
//     };

//     queueMicrotask(() => {
//       onPaymentOutput?.(payload);
//       onFormValidityChange?.({
//         validForm: isFormValid,
//         makerPayload: formValues as unknown as Record<string, unknown>
//       });
//     });
//   }, [isFormValid, formValues, isDualBlindEnabled, isDualBlindPassed, onPaymentOutput, onFormValidityChange]);

//   const renderField = (
//     fieldName: keyof Pain001Model,
//     defaultLabel: string,
//     opts: {
//       type?: 'text' | 'number' | 'date' | 'textarea' | string;
//       options?: readonly string[] | string[];
//       placeholder?: string;
//       maxLength?: number;
//       minDate?: string;
//       errorFallback?: string;
//       autoUppercase?: boolean;
//       numericOnly?: boolean;
//     } = {}
//   ) => {
//     const rule = validationResults.get(fieldName as string);
//     if (rule?.visible === false) return null;
//     if (paymentInput?.hideFieldsList?.includes(fieldName as string)) return null;

//     const fieldId = `field-${fieldName as string}`;
//     const value = (formValues as any)[fieldName] ?? '';
//     const isRequired = Boolean(
//       rule?.required ??
//       configMap.get(fieldName as string)?.required ??
//       PAIN001_MANDATORY_FIELDS.includes(fieldName as string)
//     );
//     const isReadonly = isFieldReadonly(fieldName);
//     const showMandatoryIndicator = isChecker ? (!isReadonly && isRequired) : isRequired;

//     const hasDualBlindErr = dualBlindErrors.has(fieldName as string);
//     const isFailed = failedFields.includes(fieldName as string);
//     const isRepairHighlight = isRepair && repairReviewFieldList.includes(fieldName as string);
//     const isNewlyMod = isRepair && newlyModifiedFields.includes(fieldName as string);

//     const isPatternInvalid = Boolean(
//       touched[fieldName as string] &&
//       rule?.pattern &&
//       value &&
//       !new RegExp(rule.pattern).test(String(value))
//     );
//     const isRequiredMissing = Boolean(touched[fieldName as string] && isRequired && !value);
//     const hasInputError = isPatternInvalid || isRequiredMissing || hasDualBlindErr || isFailed;

//     const containerClass = [
//       'form-field',
//       hasInputError && 'field-invalid',
//       isFailed && 'failed-field',
//       isRepairHighlight && 'repair-review-field',
//       isNewlyMod && 'repair-newly-modify-field'
//     ].filter(Boolean).join(' ');

//     const labelClass = ['field-label', isFailed && 'rejected'].filter(Boolean).join(' ');

//     const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//       let val = e.target.value;
//       if (opts.numericOnly) {
//         val = val.replace(/\D/g, '');
//       }
//       if (opts.autoUppercase) {
//         val = val.toUpperCase();
//       }
//       setField(fieldName, val);
//     };

//     return (
//       <div
//         key={fieldName as string}
//         className={containerClass}
//         onDoubleClick={e => handleDoubleClickFailedField(fieldName as string, e)}
//       >
//         <label htmlFor={fieldId} className={labelClass}>
//           {pacsFormVerbiages[fieldName as string] || defaultLabel}
//           {showMandatoryIndicator && <span className="mandatory-indicator"> *</span>}
//         </label>

//         {opts.options ? (
//           <select
//             id={fieldId}
//             value={value}
//             disabled={isReadonly}
//             className={hasInputError ? 'input-error' : ''}
//             onChange={(e: ChangeEvent<HTMLSelectElement>) => setField(fieldName, e.target.value)}
//             onBlur={() => setTouched(t => ({ ...t, [fieldName]: true }))}
//           >
//             <option value="">{opts.placeholder || `-- Select ${defaultLabel} --`}</option>
//             {opts.options.map(opt => (
//               <option key={opt} value={opt}>{opt}</option>
//             ))}
//           </select>
//         ) : opts.type === 'textarea' ? (
//           <textarea
//             id={fieldId}
//             value={value}
//             rows={3}
//             readOnly={isReadonly}
//             className={hasInputError ? 'input-error' : ''}
//             maxLength={opts.maxLength || rule?.maxLength}
//             placeholder={opts.placeholder || `Enter ${defaultLabel}`}
//             onChange={handleTextChange}
//             onBlur={() => {
//               setTouched(t => ({ ...t, [fieldName]: true }));
//               validateSingleDualBlindKeyField(fieldName as string);
//             }}
//           />
//         ) : (
//           <input
//             id={fieldId}
//             type={opts.type || 'text'}
//             value={value}
//             readOnly={isReadonly}
//             min={opts.minDate}
//             className={hasInputError ? 'input-error' : ''}
//             maxLength={opts.maxLength || rule?.maxLength}
//             placeholder={opts.placeholder || `Enter ${defaultLabel}`}
//             onChange={handleTextChange}
//             onBlur={() => {
//               setTouched(t => ({ ...t, [fieldName]: true }));
//               validateSingleDualBlindKeyField(fieldName as string);
//             }}
//           />
//         )}

//         {hasDualBlindErr && (
//           <div className="field-error dual-blind-error">{dualBlindErrors.get(fieldName as string)}</div>
//         )}
//         {isRequiredMissing && (
//           <div className="field-error">{opts.errorFallback || `${defaultLabel} is required`}</div>
//         )}
//         {isPatternInvalid && (
//           <div className="field-error">{rule?.patternMessage || 'Invalid format'}</div>
//         )}
//       </div>
//     );
//   };

//   const isIntermediaryVisible = formValues.painPaymentMethodType !== 'BKT';
//   const debtorBicCountry = (formValues.debtorAgentBIC || '').substring(4, 6).toUpperCase();
//   const showTaxDetails = LATAM_COUNTRIES.includes(debtorBicCountry);

//   return (
//     <div className="ss-payment-flow">
//       {/* MEGA-SECTION 1: Payment Details (Debtor Side) */}
//       <div className="section-main noBorders">
//         <div className="section-main-header" onClick={() => toggleSection('paymentDetails')}>
//           <span>{pacsFormVerbiages.PaymentDetails || 'Payment Details'}</span>
//           <span className="chev">{sectionCollapsed.paymentDetails ? '\u25B4' : '\u25BE'}</span>
//         </div>

//         <div className={`section-main-body ${sectionCollapsed.paymentDetails ? 'collapsed' : ''}`}>
//           {/* Section 1: Payment Information */}
//           <div className="section">
//             <div className="section-header" onClick={() => toggleSection('paymentInformation')}>
//               <span>{pacsFormVerbiages.PaymentInformation || 'Payment Information'}</span>
//               <span className="chev">{sectionCollapsed.paymentInformation ? '\u25B4' : '\u25BE'}</span>
//             </div>

//             <div className={`section-body ${sectionCollapsed.paymentInformation ? 'collapsed' : ''}`}>
//               <div className="form-row-3">
//                 {renderField('painPaymentMethodType', pacsFormVerbiages.PaymentType || 'Payment Type', {
//                   options: PAYMENT_TYPE_OPTIONS,
//                   errorFallback: 'Payment Type is required'
//                 })}
//                 {renderField('requestedExecutionDate', pacsFormVerbiages.ValueDate || 'Value Date', {
//                   type: 'date',
//                   minDate: todayDateString,
//                   errorFallback: 'Value Date is required'
//                 })}
//                 {renderField('instructedAmountCurrencyCode', pacsFormVerbiages.Currency || 'Currency', {
//                   maxLength: 3,
//                   autoUppercase: true,
//                   errorFallback: 'Currency is required'
//                 })}
//               </div>

//               <div className="form-field">
//                 <label htmlFor="field-instructedAmount" className="field-label">
//                   {pacsFormVerbiages.TransactionAmount || 'Transaction Amount'}
//                   {(!isChecker || (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes('instructedAmount'))) && (
//                     <span className="mandatory-indicator"> *</span>
//                   )}
//                 </label>
//                 <input
//                   id="field-instructedAmount"
//                   type="number"
//                   placeholder="Enter Transaction Amount"
//                   value={formValues.instructedAmount === 0 ? '' : (formValues.instructedAmount ?? '')}
//                   readOnly={isFieldReadonly('instructedAmount')}
//                   onChange={(e: ChangeEvent<HTMLInputElement>) => {
//                     const rawVal = e.target.value;
//                     setField('instructedAmount', rawVal);
//                     instructedAmountChange(rawVal);
//                   }}
//                   onBlur={() => {
//                     validateSingleDualBlindKeyField('instructedAmount');
//                     onAmountBlur();
//                   }}
//                 />
//                 {hardcapChecking && <div className="hint">{pacsFormVerbiages.ValidatingHardcapLimit || 'Validating hardcap limit...'}</div>}
//                 {hardcapError && <div className="field-error">{hardcapError}</div>}
//                 {hardcapSuccessMessage && <div className="success-message">{hardcapSuccessMessage}</div>}
//               </div>
//             </div>
//           </div>

//           {/* Section 2: Debtor Information */}
//           <div className="section">
//             <div className="section-header" onClick={() => toggleSection('debtorInformation')}>
//               <span>{pacsFormVerbiages.DebtorInfo || 'Debtor Information'}</span>
//               <span className="chev">{sectionCollapsed.debtorInformation ? '\u25B4' : '\u25BE'}</span>
//             </div>

//             <div className={`section-body ${sectionCollapsed.debtorInformation ? 'collapsed' : ''}`}>
//               <div className="form-row-3">
//                 {renderField('debtorName', pacsFormVerbiages.DebtorName || 'Debtor Name', {
//                   errorFallback: 'Debtor Name is required'
//                 })}
//                 {renderField('debtorAccountNumber', pacsFormVerbiages.DebtorAccountNumber || 'Debtor Account Number', {
//                   numericOnly: true,
//                   errorFallback: 'Debtor Account Number is required'
//                 })}
//                 {renderField('debtorAgentBIC', pacsFormVerbiages.DebtorAgentBIC || 'Debtor Agent BIC', {
//                   autoUppercase: true,
//                   errorFallback: 'Debtor Agent BIC is required'
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Section 3: Debtor Address Details */}
//           <div className="section">
//             <div className="section-header" onClick={() => toggleSection('debtorAddress')}>
//               <span>{pacsFormVerbiages.DebtorAddressDetails || 'Debtor Address Details'}</span>
//               <span className="chev">{sectionCollapsed.debtorAddress ? '\u25B4' : '\u25BE'}</span>
//             </div>

//             <div className={`section-body ${sectionCollapsed.debtorAddress ? 'collapsed' : ''}`}>
//               <div className="form-row-2">
//                 {renderField('debtorAddressLines1', pacsFormVerbiages.DebtorAddressLine1 || 'Debtor Address Line 1', { placeholder: 'Address 1' })}
//                 {renderField('debtorAddressLines2', pacsFormVerbiages.DebtorAddressLine2 || 'Debtor Address Line 2', { placeholder: 'Address 2' })}
//               </div>

//               <div className="form-row-3">
//                 {renderField('debtorStreetName', pacsFormVerbiages.DebtorStreet || 'Debtor Street')}
//                 {renderField('debtorBuildingNumber', pacsFormVerbiages.DebtorBuildingNumber || 'Debtor Building Number')}
//                 {renderField('debtorTownName', pacsFormVerbiages.DebtorTownOrCityName || 'Debtor Town / City Name')}
//               </div>

//               <div className="form-row-3">
//                 {renderField('debtorCountrySubDivision', pacsFormVerbiages.DebtorCountrySubDivisionLabel || 'Debtor Country Sub-division')}
//                 {renderField('debtorState', pacsFormVerbiages.DebtorState || 'Debtor State')}
//                 {renderField('debtorCountryCode', pacsFormVerbiages.DebtorCountry || 'Debtor Country', { maxLength: 2, autoUppercase: true })}
//               </div>

//               <div className="form-row-3">
//                 {renderField('debtorPostalCode', pacsFormVerbiages.DebtorPostalCode || 'Debtor Postal Code')}
//                 {renderField('debtorSortCodeUK', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (UK)')}
//                 {renderField('debtorSortCodeUS', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (US)', { numericOnly: true, maxLength: 9 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MEGA-SECTION 2: Beneficiary Details (Creditor Side) */}
//       <div className="section-main">
//         <div className="section-main-header" onClick={() => toggleSection('beneficiaryDetails')}>
//           <span>{pacsFormVerbiages.BeneficiaryDetails || 'Beneficiary Details'}</span>
//           <span className="chev">{sectionCollapsed.beneficiaryDetails ? '\u25B4' : '\u25BE'}</span>
//         </div>

//         <div className={`section-main-body ${sectionCollapsed.beneficiaryDetails ? 'collapsed' : ''}`}>
//           {/* Section 5: Creditor Information */}
//           <div className="section">
//             <div className="section-header" onClick={() => toggleSection('creditorInformation')}>
//               <span>{pacsFormVerbiages.CreditorInformation || 'Creditor Information'}</span>
//               <span className="chev">{sectionCollapsed.creditorInformation ? '\u25B4' : '\u25BE'}</span>
//             </div>

//             <div className={`section-body ${sectionCollapsed.creditorInformation ? 'collapsed' : ''}`}>
//               <div className="form-row-3">
//                 {renderField('creditorName', pacsFormVerbiages.CreditorName || 'Creditor Name', {
//                   errorFallback: 'Creditor Name is required'
//                 })}
//                 {renderField('creditorAccount', pacsFormVerbiages.CreditorAccountNumber || 'Creditor Account Number', {
//                   errorFallback: 'Creditor Account Number is required'
//                 })}
//                 {renderField('creditorAgentFinancialInstitutionBIC', pacsFormVerbiages.CreditorAgentBIC || 'Creditor Agent BIC', {
//                   autoUppercase: true,
//                   errorFallback: 'Required'
//                 })}
//               </div>

//               <div className="form-row-3">
//                 {renderField('creditorAgentFinancialInstitutionName', pacsFormVerbiages.CreditorAgentBankName || 'Creditor Agent Bank Name', {
//                   errorFallback: 'Required'
//                 })}
//                 {renderField('creditorAgentPostalAddress', 'Creditor Agent Account Number')}
//               </div>
//             </div>
//           </div>

//           {/* Section 6: Creditor Address Details */}
//           <div className="section">
//             <div className="section-header" onClick={() => toggleSection('creditorAddress')}>
//               <span>{pacsFormVerbiages.CreditorAddressDetails || 'Creditor Address Details'}</span>
//               <span className="chev">{sectionCollapsed.creditorAddress ? '\u25B4' : '\u25BE'}</span>
//             </div>

//             <div className={`section-body ${sectionCollapsed.creditorAddress ? 'collapsed' : ''}`}>
//               <div className="form-row-2">
//                 {renderField('creditorAddressLines1', pacsFormVerbiages.CreditorAddressLine1 || 'Creditor Address Line 1', {
//                   errorFallback: 'Creditor Address Line 1 is required'
//                 })}
//                 {renderField('creditorAddressLines2', pacsFormVerbiages.CreditorAddressLine2 || 'Creditor Address Line 2')}
//               </div>

//               <div className="form-row-3">
//                 {renderField('creditorStreetName', pacsFormVerbiages.CreditorStreet || 'Creditor Street')}
//                 {renderField('creditorBuildingNumber', pacsFormVerbiages.CreditorBuildingNumber || 'Creditor Building Number')}
//                 {renderField('creditorTownName', pacsFormVerbiages.CreditorTownOrCityName || 'Creditor Town / City Name')}
//               </div>

//               <div className="form-row-3">
//                 {renderField('creditorCountrySubDivision', pacsFormVerbiages.CreditorCountrySubDivisionLabel || 'Creditor Country Sub-division')}
//                 {renderField('creditorState', pacsFormVerbiages.CreditorState || 'Creditor State')}
//                 {renderField('creditorCountryCode', pacsFormVerbiages.CreditorCountry || 'Creditor Country', { maxLength: 2, autoUppercase: true })}
//               </div>

//               <div className="form-row-3">
//                 {renderField('creditorPostalCode', pacsFormVerbiages.CreditorPostalCode || 'Creditor Postal Code')}
//                 {renderField('creditorSortCodeUK', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (UK)')}
//                 {renderField('creditorSortCodeUS', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (US)', { numericOnly: true, maxLength: 9 })}
//               </div>
//             </div>
//           </div>

//           {/* Section 4: Intermediary Bank Routing */}
//           {isIntermediaryVisible && (
//             <div className="section">
//               <div className="section-header" onClick={() => toggleSection('intermediaryBank')}>
//                 <span>{pacsFormVerbiages.IntermediaryBankDetails || 'Intermediary Bank Details'}</span>
//                 <span className="chev">{sectionCollapsed.intermediaryBank ? '\u25B4' : '\u25BE'}</span>
//               </div>

//               <div className={`section-body ${sectionCollapsed.intermediaryBank ? 'collapsed' : ''}`}>
//                 <div className="form-row-3">
//                   {renderField('firstIntermediaryBankBIC', pacsFormVerbiages.FirstIntermediaryBankSWIFTCode || '1st Intermediary Bank SWIFT Code', {
//                     autoUppercase: true,
//                     placeholder: 'Enter SWIFT/BIC'
//                   })}
//                   {renderField('firstIntermediaryBankRoutingCode', pacsFormVerbiages.FirstIntermediaryBankRoutingCode || '1st Intermediary Routing Code')}
//                   {renderField('firstIntermediaryBankName', pacsFormVerbiages.FirstIntermediaryBankName || '1st Intermediary Bank Name')}
//                 </div>

//                 <div className="form-row-2">
//                   {renderField('firstIntermediaryBankCountryCode', pacsFormVerbiages.FirstIntermediaryBankCountryCode || '1st Intermediary Country Code', {
//                     maxLength: 2,
//                     autoUppercase: true
//                   })}
//                   {renderField('firstIntermediaryBankAccountNumber', pacsFormVerbiages.FirstIntermediaryAccountNumber || '1st Intermediary Account Number')}
//                 </div>

//                 {!showSecondIntermediary && !formValues.secondIntermediaryBankBIC && !isChecker && (
//                   <div style={{ marginTop: '8px', marginBottom: '8px' }}>
//                     <button
//                       type="button"
//                       className="lmn-btn"
//                       style={{ fontSize: '12px', height: '30px' }}
//                       onClick={() => setShowSecondIntermediary(true)}
//                     >
//                       + Add 2nd Intermediary Bank
//                     </button>
//                   </div>
//                 )}

//                 {(showSecondIntermediary || Boolean(formValues.secondIntermediaryBankBIC) || isChecker) && (
//                   <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #d9e2ec' }}>
//                     <div className="form-row-3">
//                       {renderField('secondIntermediaryBankBIC', pacsFormVerbiages.SecondIntermediaryBankSWIFTCode || '2nd Intermediary SWIFT Code', {
//                         autoUppercase: true,
//                         placeholder: 'Enter SWIFT/BIC'
//                       })}
//                       {renderField('secondIntermediaryBankRoutingCode', pacsFormVerbiages.SecondIntermediaryBankRoutingCode || '2nd Intermediary Routing Code')}
//                       {renderField('secondIntermediaryBankName', pacsFormVerbiages.SecondIntermediaryBankName || '2nd Intermediary Bank Name')}
//                     </div>

//                     <div className="form-row-2">
//                       {renderField('secondIntermediaryBankCountryCode', pacsFormVerbiages.SecondIntermediaryBankCountryCode || '2nd Intermediary Country Code', {
//                         maxLength: 2,
//                         autoUppercase: true
//                       })}
//                       {renderField('secondIntermediaryBankAccountNumber', pacsFormVerbiages.SecondIntermediaryAccountNumber || '2nd Intermediary Account Number')}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* MEGA-SECTION 3: Additional Information */}
//       <div className="section-main">
//         <div className="section-main-header" onClick={() => toggleSection('additionalInformation')}>
//           <span>{pacsFormVerbiages.AdditionalInformation || 'Additional Information'}</span>
//           <span className="chev">{sectionCollapsed.additionalInformation ? '\u25B4' : '\u25BE'}</span>
//         </div>

//         <div className={`section-main-body ${sectionCollapsed.additionalInformation ? 'collapsed' : ''}`}>
//           {/* Sub-section 1: Additional Details */}
//           <div className="section">
//             <div className="section-header" onClick={() => toggleSection('additionalDetails')}>
//               <span>{pacsFormVerbiages.AdditionalDetails || 'Additional Details'}</span>
//               <span className="chev">{sectionCollapsed.additionalDetails ? '\u25B4' : '\u25BE'}</span>
//             </div>

//             <div className={`section-body ${sectionCollapsed.additionalDetails ? 'collapsed' : ''}`}>
//               {renderField('ustrdPaymentDetails', pacsFormVerbiages.RemittanceInformation || 'Remittance Information', {
//                 placeholder: 'Enter remittance details',
//                 type: 'textarea'
//               })}
//             </div>
//           </div>

//           {/* Sub-section 2: Charge Details */}
//           <div className="section">
//             <div className="section-header" onClick={() => toggleSection('chargeDetails')}>
//               <span>{pacsFormVerbiages.ChargeDetails || 'Charge Details'}</span>
//               <span className="chev">{sectionCollapsed.chargeDetails ? '\u25B4' : '\u25BE'}</span>
//             </div>

//             <div className={`section-body ${sectionCollapsed.chargeDetails ? 'collapsed' : ''}`}>
//               <div className="form-row-3">
//                 {renderField('chargeBearer', pacsFormVerbiages.ChargeInformation || 'Charge Information', {
//                   options: CHARGE_BEARER_OPTIONS,
//                   errorFallback: 'Required'
//                 })}
//                 {renderField('chargesAmount', pacsFormVerbiages.ChargesAmount || 'Charges Amount', {
//                   type: 'number',
//                   placeholder: 'Enter Charges Amount'
//                 })}
//                 {renderField('chargesAgentBIC', pacsFormVerbiages.ChargesAgentBic || 'Charges Agent BIC', {
//                   autoUppercase: true,
//                   placeholder: 'Enter Charges Agent BIC'
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Sub-section 3: Tax Details (Exact 6 Fields from Image 18) */}
//           {showTaxDetails && (
//             <div className="section">
//               <div className="section-header" onClick={() => toggleSection('taxDetails')}>
//                 <span>{pacsFormVerbiages.TaxDetails || 'Tax Details'}</span>
//                 <span className="chev">{sectionCollapsed.taxDetails ? '\u25B4' : '\u25BE'}</span>
//               </div>

//               <div className={`section-body ${sectionCollapsed.taxDetails ? 'collapsed' : ''}`}>
//                 <div className="form-row-3">
//                   {renderField('taxIdNumber', pacsFormVerbiages.TaxIdNumber || 'Tax ID Number', {
//                     placeholder: 'Enter Tax ID Number',
//                     errorFallback: 'Tax ID Number is required'
//                   })}
//                   {renderField('taxIdType', pacsFormVerbiages.TaxIdType || 'Tax ID Type', {
//                     placeholder: 'Enter Tax ID Type',
//                     errorFallback: 'Tax ID Type is required'
//                   })}
//                   {renderField('purposeOfPayment', pacsFormVerbiages.PurposeOfPayment || 'Purpose of Payment', {
//                     placeholder: 'Enter Purpose of Payment',
//                     errorFallback: 'Purpose of Payment is required'
//                   })}
//                 </div>

//                 <div className="form-row-3">
//                   {renderField('taxPurposeCode', pacsFormVerbiages.TaxPurposeCode || 'Tax Purpose Code', {
//                     placeholder: 'Enter Tax Purpose Code',
//                     errorFallback: 'Tax Purpose Code is required'
//                   })}
//                   {renderField('regulatoryReportingCode', pacsFormVerbiages.RegulatoryReportingCode || 'Regulatory Reporting Code', {
//                     placeholder: 'Enter Regulatory Reporting Code',
//                     errorFallback: 'Regulatory Reporting Code is required'
//                   })}
//                   {renderField('invoiceReferenceNumber', pacsFormVerbiages.InvoiceReferenceNumber || 'Invoice / Reference Number', {
//                     placeholder: 'Enter Invoice / Reference Number',
//                     errorFallback: 'Invoice / Reference Number is required'
//                   })}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentChild;