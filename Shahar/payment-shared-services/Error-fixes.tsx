//File 1: SSPaymentFlow.tsx1. In handleTextChange (Lines 893–904 
// in image_42.png / image_43.png)Enforce max 4 characters and l
// etters-only (/[^a-zA-Z]/g) on taxPurposeCode:   

const handleTextChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  let val = e.target.value;

  // Fix 2: Tax Purpose Code -> Max 4 chars, alphabets only, no numbers or special characters
  if (fieldName === 'taxPurposeCode' || fieldName === 'creditorPersonTaxCode') {
    val = val.replace(/[^a-zA-Z]/g, '').slice(0, 4);
  }

  if (opts.numericOnly) {
    val = val.replace(/\D/g, "");
  }
  if (opts.autoUppercase) {
    val = val.toUpperCase();
  }
  setField(fieldName, val);
};


//2. In renderField (Around Line 870 in image_41.png / 
// image_42.png)Add the bidirectional BKT country code 
// comparison derived from characters 5 and 6 of each BIC:   


// Fix 1: BKT Payment Type - Debtor & Creditor Country Code from BIC Match
const currentPaymentType = String(
  formValues?.painPaymentMethodType || formValues?.paymentType || ''
).trim().toUpperCase();
const isBKT = currentPaymentType === 'BKT';

const debtorBicVal = String(formValues?.debtorAgentBIC || '').trim().toUpperCase();
const creditorBicVal = String(
  formValues?.creditorAgentFinancialInstitutionBIC || ''
).trim().toUpperCase();

const debtorBicCountry = debtorBicVal.length >= 6 ? debtorBicVal.substring(4, 6) : '';
const creditorBicCountry = creditorBicVal.length >= 6 ? creditorBicVal.substring(4, 6) : '';

// Mismatch occurs if both BICs have reached at least 6 characters and country codes differ
const isBktBicCountryMismatch =
  isBKT &&
  Boolean(debtorBicCountry) &&
  Boolean(creditorBicCountry) &&
  debtorBicCountry !== creditorBicCountry;

// Show inline error on the Creditor BIC field (or if debtor is entered second)
const isBicField =
  fieldName === 'creditorAgentFinancialInstitutionBIC' ||
  fieldName === 'debtorAgentBIC';

const hasInputError =
  isPatternInvalid ||
  isRequiredMissing ||
  hasDualBlindErr ||
  isFailed ||
  (isBktBicCountryMismatch && isBicField);


  //3. In renderField Error Message Display (Lines 1020–1031 in image_48.png)
// Render the error message when isBktBicCountryMismatch is active on the Creditor BIC field:


{isBktBicCountryMismatch && fieldName === 'creditorAgentFinancialInstitutionBIC' && (
  <div className="field-error">
    For BKT payments, Creditor Agent BIC country code ({creditorBicCountry}) must match Debtor Agent BIC country code ({debtorBicCountry}).
  </div>
)}
{hasDualBlindErr && (
  <div className="field-error dual-blind-error">
    {dualBlindErrors.get(fieldName as string)}
  </div>
)}
{isRequiredMissing && !(isBktBicCountryMismatch && isBicField) && (
  <div className="field-error">
    {opts.errorFallback || `${resolvedLabel} is required`}
  </div>
)}
{isPatternInvalid && !(isBktBicCountryMismatch && isBicField) && (
  <div className="field-error">
    {rule?.patternMessage || "Invalid format"}
  </div>
)}


//4. In isFormValid (Lines 773–780 in image_36.png / image_37.png)
//Prevent form validation and submission if the payment type is 
// BKT and the BIC country codes do not match:


if (hasMissingMandatory) return false;

    // Fix 1: Form validity gate for BKT BIC country match[cite: 25]
    const currentPaymentType = String(
      formValues?.painPaymentMethodType || formValues?.paymentType || ''
    ).trim().toUpperCase();
    const isBKT = currentPaymentType === 'BKT';

    const dBic = String(formValues?.debtorAgentBIC || '').trim().toUpperCase();
    const cBic = String(formValues?.creditorAgentFinancialInstitutionBIC || '').trim().toUpperCase();

    if (isBKT) {
      const dCountry = dBic.length >= 6 ? dBic.substring(4, 6) : '';
      const cCountry = cBic.length >= 6 ? cBic.substring(4, 6) : '';
      if (!dCountry || !cCountry || dCountry !== cCountry) {
        return false;
      }
    }

    if (isChecker && isDualBlindEnabled && !isDualBlindPassed) return false;
    if (isChecker && failedFields.length > 0) return false;
    if (hardcapError) return false;

    return true;
  }, [


//(Make sure formValues.painPaymentMethodType, 
// formValues.paymentType, formValues.debtorAgentBIC, 
// and formValues.creditorAgentFinancialInstitutionBIC 
// are included in the dependency array on lines 780–789)


//File 2: PaymentParent.tsx1. In dynamicFieldConfig 
// (Lines 451–460 in image_95.png / image_96.png)Ensure taxPurposeCode
//  / creditorPersonTaxCode has maxLength: 4 and uppercase rule:   


// Maker or Repair mode: Tax details are mandatory for LATAM[cite: 95]
return baseConfig.map((cfg) => {
  const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);
  const isTaxPurpose =
    cfg.fieldName === 'taxPurposeCode' || cfg.fieldName === 'creditorPersonTaxCode';

  return {
    ...cfg,
    disabled: false,
    required: isNonUsPayment && isTaxField ? true : cfg.required,
    hidden: isNonUsPayment && isTaxField ? false : cfg.hidden,
    maxLength: isTaxPurpose ? 4 : cfg.maxLength,
  };
});


//2. In handlePaymentOutput (Lines 644–650 in image_102.png)
//Add the BKT BIC country match check so parent state blocks approval/submit on mismatch:

// Fix 1: Validate BKT BIC Country Match in Parent[cite: 25]
const paymentMethodType = String(
  pData?.painPaymentMethodType || pData?.paymentType || ''
).trim().toUpperCase();
const isBKT = paymentMethodType === 'BKT';

const debtorBic = String(pData?.debtorAgentBIC || '').trim().toUpperCase();
const creditorBic = String(
  pData?.creditorAgentFinancialInstitutionBIC || pData?.creditorAgentBIC || ''
).trim().toUpperCase();

const dCountry = debtorBic.length >= 6 ? debtorBic.substring(4, 6) : '';
const cCountry = creditorBic.length >= 6 ? creditorBic.substring(4, 6) : '';

const isBktBicCountryValid = !isBKT || (Boolean(dCountry) && Boolean(cCountry) && dCountry === cCountry);

const isManualPassed = failed.length === 0;
const isPassed = isManualPassed && Boolean(newDualBlind) && isBktBicCountryValid;
setCheckerDualBlindPassed(isPassed);
setIsCurrentFormValid(Boolean(output?.isValid) && isBktBicCountryValid);
// setCheckerFailedFields(failed); remains commented out so flags persist[cite: 102]



