//Here is the exact, file-by-file, line-by-line implementation consolidating all requirements.

//File 1: PaymentParent.tsx
//1. Line 200: Wire the state variable
//Change line 200 from:

const [_, setCheckerDualBlindPassed] = useState<boolean>(false);

//To:

const [checkerDualBlindPassed, setCheckerDualBlindPassed] = useState<boolean>(false);


//2. Lines 427–452: Update dynamicFieldConfig for Checker Tax Details & 
// Point 3Replace lines 427–452 with:   

// In Checker mode, only core dual-blind fields are rekeyed; tax fields are NOT rekeyed[cite: 5, 8]
const activeRekeyFields = DUAL_BLIND_REKEY_FIELDS;

const TAX_NUMERIC_FIELDS = [
  'taxIdNumber',
  'taxIdType',
  'regulatoryReportingCode',
  'invoiceReferenceNumber',
  'taxPayerId',
];

if (activeTab === 'checker') {
  return baseConfig.map((cfg) => {
    const isRekeyField = activeRekeyFields.includes(cfg.fieldName);
    const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);

    if (isTaxField) {
      return {
        ...cfg,
        required: false,
        hidden: !isNonUsPayment,
        disabled: true,
      };
    }

    return {
      ...cfg,
      required: cfg.required,
      hidden: cfg.hidden,
      disabled: !isRekeyField,
    };
  });
}

// Maker or Repair mode: Tax details are mandatory for LATAM[cite: 3, 5]
return baseConfig.map((cfg) => {
  const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);
  
  // Point 3: Tax Purpose Code (creditorPersonTaxCode) max length 4
  const isTaxPurposeCode =
    cfg.fieldName === 'taxPurposeCode' || cfg.fieldName === 'creditorPersonTaxCode';

  return {
    ...cfg,
    disabled: false,
    required: isNonUsPayment && isTaxField ? true : cfg.required,
    hidden: isNonUsPayment && isTaxField ? false : cfg.hidden,
    maxLength: isTaxPurposeCode ? 4 : cfg.maxLength,
  };
});


//3. Lines 480–488: Dual-Blind Key Fields in dynamicPaymentInput
//Ensure case 'checker' uses DUAL_BLIND_REKEY_FIELDS only:

case 'checker':
      return {
        ...baseInput,
        paymentMode: 'checker',
        dualBlindKeyFlag: 'Y',
        dualBlindKeyFields: DUAL_BLIND_REKEY_FIELDS,
      };


//4. Lines 505–525: Point 1 (BKT Country Match) & LATAM BIC Check
//  in handlePaymentOutput   Add the Point 1 BKT check and BIC 
// matching inside handlePaymentOutput:

const rekeyFieldsToCheck = DUAL_BLIND_REKEY_FIELDS;

    // LATAM BTB BIC Check
    const debtorBic = String(pData?.debtorAgentBIC || '').trim().toUpperCase();
    const creditorBic = String(
      pData?.creditorAgentFinancialInstitutionBIC ||
      pData?.creditorAgentBIC ||
      ''
    ).trim().toUpperCase();

    const isLatamDebtorBic =
      debtorBic.length >= 6 && LATAM_CODES.includes(debtorBic.substring(4, 6));

    const isBtbBicValid =
      !isLatamDebtorBic || (creditorBic.length > 0 && debtorBic === creditorBic);

    // Point 1: BKT Payment Type - Debtor & Creditor Country Match
    const paymentMethodType = String(
      pData?.painPaymentMethodType || pData?.paymentType || ''
    ).trim().toUpperCase();
    const isBKT = paymentMethodType === 'BKT';

    const debtorCountry = String(
      pData?.debtorCountryCode || pData?.debtorCountry || ''
    ).trim().toUpperCase();
    const creditorCountry = String(
      pData?.creditorCountryCode || pData?.creditorCountry || ''
    ).trim().toUpperCase();

    const isBktCountryValid =
      !isBKT || (Boolean(debtorCountry) && debtorCountry === creditorCountry);


//5. Lines 600–606: Stop overwriting manual flags in handlePaymentOutput
//Change lines 601–605 to:

const isManualPassed = failed.length === 0;
    const isPassed =
      isManualPassed && Boolean(newDualBlind) && isBtbBicValid && isBktCountryValid;
    setCheckerDualBlindPassed(isPassed);
    setIsCurrentFormValid(
      Boolean(output?.isValid) && isBtbBicValid && isBktCountryValid
    );
    // setCheckerFailedFields(failed) removed so manual flags are never overwritten


//6. Lines 964–967: Strict Gate on "Approve Payment" Button
//Change lines 964–967 to:

const isCheckerApproveDisabled =
    isSubmitting ||
    !isCurrentFormValid ||
    !checkerDualBlindPassed ||
    checkerFailedFields.length > 0;
  const isCheckerRejectDisabled = isSubmitting;


  //7. Lines 1012–1017: SSPaymentFlow InvocationEnsure 
  // line 1013 (flaggedFields=...) is removed, leaving only:  
  
  onFailedFieldListChange={(fields: string[]) => {
    setCheckerFailedFields(fields);
  }}


  //File 2: SSPaymentFlow.tsx
//1. Lines 187–195: Ensure clean state declaration (Remove broken useEffect)

const [failedFields, setFailedFields] = useState<string[]>(
  () => (paymentInput as any)?.rejectedFieldList ?? []
);


//2. Lines 699–722: Double-click flagging function
//Ensure handleDoubleClickFailedField is:

const handleDoubleClickFailedField = (fieldName: string, e?: any) => {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  if (!isChecker) return;

  if (
    isDualBlindEnabled &&
    (paymentInput?.dualBlindKeyFields?.includes(fieldName) || fieldName === 'instructedAmount')
  ) {
    return;
  }

  setFailedFields((prev) => {
    const exists = prev.includes(fieldName);
    const next = exists
      ? prev.filter((f) => f !== fieldName)
      : [...prev, fieldName];

    onFailedFieldListChange?.(next);
    return next;
  });
};


//3. In handleTextChange (Input sanitization for Point 3)Add 
// the sanitization guard for the tax fields:   

const TAX_NUMERIC_FIELDS = [
  'taxIdNumber',
  'taxIdType',
  'regulatoryReportingCode',
  'invoiceReferenceNumber',
  'taxPayerId',
];

// Point 3: Tax purpose code max length 4
if (fieldName === 'taxPurposeCode' || fieldName === 'creditorPersonTaxCode') {
  const sanitized = e.target.value.slice(0, 4);
  setField(fieldName, sanitized);
  return;
}

// Point 3: Other 5 tax fields numbers only[cite: 8]
if (TAX_NUMERIC_FIELDS.includes(fieldName as string)) {
  const numericVal = e.target.value.replace(/\D/g, '');
  setField(fieldName, numericVal);
  return;
}


//4. Lines 860–872: Cross-field mismatch calculations in renderField
//[cite: 8]

// Before the JSX return in renderField, calculate both mismatches[cite: 8]:

// LATAM Book-to-Book (BTB) BIC Validation
const debtorBicVal = String(formValues?.debtorAgentBIC || '').trim().toUpperCase();
const isLatamDebtor =
  debtorBicVal.length >= 6 && LATAM_CODES.includes(debtorBicVal.substring(4, 6));

const isCreditorBicField =
  fieldName === 'creditorAgentFinancialInstitutionBIC' || fieldName === 'creditorAgentBIC';

const isBtbMismatch =
  isLatamDebtor &&
  isCreditorBicField &&
  Boolean(value) &&
  String(value).trim().toUpperCase() !== debtorBicVal;

// Point 1: BKT Country Mismatch[cite: 8]
const currentPaymentType = String(
  formValues?.painPaymentMethodType || formValues?.paymentType || ''
).trim().toUpperCase();
const isBKT = currentPaymentType === 'BKT';

const debtorCountryVal = String(
  formValues?.debtorCountryCode || formValues?.debtorCountry || ''
).trim().toUpperCase();
const creditorCountryVal = String(
  formValues?.creditorCountryCode || formValues?.creditorCountry || ''
).trim().toUpperCase();

const isCreditorCountryField =
  fieldName === 'creditorCountryCode' || fieldName === 'creditorCountry';

const isBktCountryMismatch =
  isBKT &&
  isCreditorCountryField &&
  Boolean(creditorCountryVal) &&
  Boolean(debtorCountryVal) &&
  debtorCountryVal !== creditorCountryVal;


  //5. Lines 873–965: Clean Container Event Handling & Inline Error Display
//[cite: 8]
//Replace the return block in renderField:

const isDualBlindKey =
      isDualBlindEnabled &&
      (paymentInput?.dualBlindKeyFields?.includes(fieldName as string) ||
        fieldName === 'instructedAmount');

    const canBeFlagged = isChecker && !isDualBlindKey;
    const hasFieldMismatch = isBtbMismatch || isBktCountryMismatch;

    return (
      <div
        key={fieldName as string}
        className={`${containerClass} ${isFailed ? "failed-field" : ""}`.trim()}
        onDoubleClick={(e) => {
          if (canBeFlagged) {
            handleDoubleClickFailedField(fieldName as string, e);
          }
        }}
        style={{
          cursor: canBeFlagged ? "pointer" : undefined,
          userSelect: canBeFlagged ? "none" : undefined,
        }}
        title={canBeFlagged ? "Double click to flag/unflag incorrect field" : undefined}
      >
        <label htmlFor={fieldName as string} className={labelClass}>
          {resolvedLabel}
          {showMandatoryIndicator && (
            <span className="mandatory-indicator">*</span>
          )}
        </label>

        {opts.options ? (
          <select
            id={fieldName as string}
            name={fieldName as string}
            value={value}
            disabled={isExplicitlyDisabled || isReadonly}
            className={`${hasInputError || hasFieldMismatch ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              pointerEvents: canBeFlagged ? "none" : undefined,
              ...(isFailed ? { borderColor: "#dc3545", backgroundColor: "#fff5f5", color: "#dc3545" } : {}),
            }}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setField(fieldName, e.target.value)
            }
            onBlur={() => setTouched((t) => ({ ...t, [fieldName]: true }))}
          >
            <option value="">
              {opts.placeholder || `-- Select ${resolvedLabel} --`}
            </option>
            {opts.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : opts.type === "textarea" ? (
          <textarea
            id={fieldName as string}
            name={fieldName as string}
            value={value}
            rows={3}
            disabled={isExplicitlyDisabled}
            readOnly={isReadonly}
            className={`${hasInputError || hasFieldMismatch ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              pointerEvents: canBeFlagged ? "none" : undefined,
              ...(isFailed
                ? {
                    borderColor: "#dc3545 !important",
                    backgroundColor: "#fff5f5 !important",
                    boxShadow: "0 0 0 1px #dc3545",
                    color: "#dc3545",
                  }
                : {}),
            }}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
            onChange={handleTextChange}
            onBlur={() => {
              setTouched((t) => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        ) : (
          <input
            id={fieldName as string}
            name={fieldName as string}
            type={opts.type || "text"}
            value={value}
            disabled={isExplicitlyDisabled}
            readOnly={isReadonly}
            min={opts.minDate}
            className={`${hasInputError || hasFieldMismatch ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              pointerEvents: canBeFlagged ? "none" : undefined,
              ...(isFailed
                ? {
                    borderColor: "#dc3545 !important",
                    backgroundColor: "#fff5f5 !important",
                    boxShadow: "0 0 0 1px #dc3545",
                    color: "#dc3545",
                  }
                : {}),
            }}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
            onChange={handleTextChange}
            onBlur={() => {
              setTouched((t) => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        )}

        {isBtbMismatch && (
          <div className="field-error">
            Creditor Agent BIC must match Debtor Agent BIC for LATAM Book-to-Book transfers.
          </div>
        )}
        {isBktCountryMismatch && (
          <div className="field-error">
            For BKT payments, Creditor Country Code must match Debtor Country Code.
          </div>
        )}
        {hasDualBlindErr && (
          <div className="field-error dual-blind-error">
            {dualBlindErrors.get(fieldName as string)}
          </div>
        )}
        {isRequiredMissing && !hasFieldMismatch && (
          <div className="field-error">
            {opts.errorFallback || `${resolvedLabel} is required`}
          </div>
        )}
        {isPatternInvalid && !hasFieldMismatch && (
          <div className="field-error">
            {rule?.patternMessage || "Invalid format"}
          </div>
        )}
      </div>
    );


    //File 3: index.css
//Ensure read-only inputs reflect the failure style when flagged:


.form-field.failed-field input,
.form-field.failed-field select,
.form-field.failed-field textarea,
input.field-failed-border,
select.field-failed-border,
textarea.field-failed-border {
  border: 1.5px solid #dc3545 !important;
  background-color: #fff5f5 !important;
  box-shadow: 0 0 0 1px #dc3545 !important;
  color: #dc3545 !important;
}


