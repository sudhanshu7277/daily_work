//File 1: PaymentParent.tsx
// 1. Export the 6 Tax Fields List
// Right below DUAL_BLIND_REKEY_FIELDS (lines 114–125

export const TAX_DUAL_BLIND_REKEY_FIELDS: string[] = [
    'taxIdNumber',
    'taxIdType',
    'purposeOfPayment',
    'taxPurposeCode',
    'regulatoryReportingCode',
    'invoiceReferenceNumber',
  ];


  //2. Detect Non-US BIC
// Inside the PaymentParent component (above where dynamicPaymentInput 
// and dynamicFieldConfig are computed):

// Check whether the payment is Non-US (e.g. CITIAR33)
const isNonUsPayment = useMemo(() => {
    const raw = (stableInitialPaymentModel ?? initialData) as any;
    const bic = String(
      raw?.debtorAgentBIC ??
      raw?.paymentDetailsRequest?.debtorAgentBIC ??
      ''
    ).toUpperCase().trim();

    return bic.length > 0 && !bic.includes('US');
  }, [stableInitialPaymentModel, initialData]);


  //3. Update dynamicPaymentInput to supply 16 fields for Non-US (10 + 6)
// Where dynamicPaymentInput is built in PaymentParent.tsx:

const dynamicPaymentInput = useMemo(() => {
    // 10 base fields for US, 16 fields (10 + 6 tax) for Non-US
    const dualBlindKeys = isNonUsPayment
      ? [...DUAL_BLIND_REKEY_FIELDS, ...TAX_DUAL_BLIND_REKEY_FIELDS]
      : DUAL_BLIND_REKEY_FIELDS;

    return {
      ...(paymentInput || {}),
      paymentModel: stableInitialPaymentModel ?? initialData,
      dualBlindKeyFields: dualBlindKeys,
    };
  }, [paymentInput, stableInitialPaymentModel, initialData, isNonUsPayment]);


  // 4. Update dynamicFieldConfig to make Tax fields mandatory for Non-US
// Where dynamicFieldConfig is defined in PaymentParent.tsx:

const dynamicFieldConfig = useMemo(() => {
    return PARENT_FIELD_CONFIG.map((field) => {
      // If Non-US, mark the 6 tax detail fields as mandatory
      if (isNonUsPayment && TAX_DUAL_BLIND_REKEY_FIELDS.includes(field.fieldName)) {
        return {
          ...field,
          required: true,
          hidden: false,
        };
      }
      return field;
    });
  }, [isNonUsPayment]);


  // File 2: SSPaymentFlow.tsx
// 1. Cache All 16 Fields in dualBlindCache
// In SSPaymentFlow.tsx around lines 201–217 (from image_15.png),
//  ensure dualBlindCache iterates through whatever keys are passed in
//  paymentInput?.dualBlindKeyFields


useEffect(() => {
    if (!isDualBlindEnabled) return;

    const sourceData = (paymentInput?.paymentModel || initialData || {}) as any;
    const pdr = sourceData.paymentDetailsRequest || {};
    const fieldsToCache = paymentInput?.dualBlindKeyFields || [];

    fieldsToCache.forEach((fieldName: string) => {
      const val = sourceData[fieldName] ?? pdr[fieldName] ?? '';
      dualBlindCache.current.set(fieldName, val);
    });
  }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, paymentInput?.paymentModel, initialData]);


  //2. Tax Detail Fields in JSX (Section 8)
// In SSPaymentFlow.tsx, in the Tax Details section 
// (lines corresponding to image_31.png):
// Make sure each of the 6 tax inputs calls validateSingleDualBlindKeyField
//  on blur and displays the dual-blind error message in checker mode:


{[
    { key: 'taxIdNumber', label: 'Tax ID Number' },
    { key: 'taxIdType', label: 'Tax ID Type' },
    { key: 'purposeOfPayment', label: 'Purpose of Payment' },
    { key: 'taxPurposeCode', label: 'Tax Purpose Code' },
    { key: 'regulatoryReportingCode', label: 'Regulatory Reporting Code' },
    { key: 'invoiceReferenceNumber', label: 'Invoice / Reference Number' },
  ].map((item) => (
    <div key={item.key} className="form-group">
      <label>
        {item.label}
        {/* Show asterisk if field is marked required in fieldConfig */}
        {fieldConfigMap?.[item.key]?.required && <span className="mandatory">*</span>}
      </label>
      <input
        type="text"
        name={item.key}
        placeholder={`Enter ${item.label}`}
        value={(formValues as any)[item.key] ?? ''}
        onChange={(e) => setField(item.key, e.target.value)}
        onBlur={() => validateSingleDualBlindKeyField(item.key)}
      />
      {isCheckerMode && dualBlindErrors?.has(item.key) && (
        <div className="field-error">{dualBlindErrors.get(item.key)}</div>
      )}
    </div>
  ))}


  //3. Checker Submission Guard
// In SSPaymentFlow.tsx, ensure the form requires all fields present 
// in paymentInput.dualBlindKeyFields (all 16 in Non-US, 10 in US) 
// to be non-empty and error-free:

const isCheckerFormValid = useMemo(() => {
    if (!isCheckerMode || !isDualBlindEnabled) return true;

    // 1. Map must not contain any mismatches
    if (dualBlindErrors.size > 0) return false;

    const requiredFields = paymentInput?.dualBlindKeyFields || [];

    // 2. All active keys must be filled by the checker
    return requiredFields.every((field: string) => {
      const val = (formValues as any)[field];
      return val !== undefined && val !== null && String(val).trim() !== '';
    });
  }, [isCheckerMode, isDualBlindEnabled, paymentInput?.dualBlindKeyFields, dualBlindErrors, formValues]);

  