//Change 1: Lines 201–217 (dualBlindCache Initialization & Masking)
// In image_30.png (lines 201–217), update the effect so it searches 
// both root and paymentDetailsRequest (where tax details are stored), 
// and does not convert null into literal 'null'


useEffect(() => {
    if (isDualBlindEnabled && paymentInput?.paymentModel) {
      dualBlindCache.current.clear();
      const model = paymentInput.paymentModel as any;
      const pdr = model.paymentDetailsRequest || {};

      paymentInput.dualBlindKeyFields?.forEach((field) => {
        // Look up maker value from root first, fallback to paymentDetailsRequest
        const raw = model[field] ?? pdr[field] ?? '';
        dualBlindCache.current.set(
          field,
          String(raw === null || raw === 'null' ? '' : raw).trim()
        );
      });

      setFormValues((prev) => {
        const masked = { ...prev };
        paymentInput.dualBlindKeyFields?.forEach((field) => {
          (masked as any)[field] = '';
        });
        return masked;
      });
    }
  }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, paymentInput?.paymentModel]);


  //Change 2: Lines 239–280 (validateSingleDualBlindKeyField)
// In image_31.png (lines 239–280), replace the validation hook with 
// numeric normalization for instructedAmount and safe handling for empty/null values:

const validateSingleDualBlindKeyField = useCallback(
    (fieldName: string) => {
      if (!isDualBlindEnabled || !paymentInput?.dualBlindKeyFields?.includes(fieldName)) return;

      const rawOriginal = dualBlindCache.current.get(fieldName) ?? '';
      const rawCurrent = (formValues as any)[fieldName] ?? '';

      const normalizeStr = (val: any) => {
        if (val === null || val === undefined || val === 'null' || val === '') return '';
        return String(val).trim();
      };

      const original = normalizeStr(rawOriginal);
      const current = normalizeStr(rawCurrent);

      let isMismatch = false;

      if (fieldName === 'instructedAmount') {
        const numOriginal = original !== '' ? parseFloat(original) : NaN;
        const numCurrent = current !== '' ? parseFloat(current) : NaN;

        if (isNaN(numCurrent) || isNaN(numOriginal)) {
          isMismatch = true;
        } else {
          isMismatch = numOriginal !== numCurrent;
        }
      } else {
        // If both maker record and checker input are empty/null, they match
        if (original === '' && current === '') {
          isMismatch = false;
        } else {
          isMismatch = original !== current;
        }
      }

      setDualBlindErrors((prev) => {
        const next = new Map(prev);
        if (isMismatch) {
          next.set(fieldName, 'Data does not match');
        } else {
          next.delete(fieldName);
        }
        return next;
      });
    },
    [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]
  );


  //Change 3: Lines 283–295 (isDualBlindPassed Form Gate)
// In image_32.png (lines 283–295), replace with:


useEffect(() => {
    if (!isDualBlindEnabled) {
      setIsDualBlindPassed(true);
      return;
    }

    const fields = paymentInput?.dualBlindKeyFields || [];
    if (fields.length === 0) {
      setIsDualBlindPassed(true);
      return;
    }

    // Block if any field has an active mismatch error
    if (dualBlindErrors.size > 0) {
      setIsDualBlindPassed(false);
      return;
    }

    const allMatched = fields.every((f) => {
      const orig = dualBlindCache.current.get(f) ?? '';
      const curr = String((formValues as any)[f] ?? '').trim();

      if (f === 'instructedAmount') {
        const numOrig = parseFloat(orig);
        const numCurr = parseFloat(curr);
        return !isNaN(numOrig) && !isNaN(numCurr) && numOrig === numCurr;
      }

      // If both maker record and checker input are empty, it's valid
      if (orig === '' && curr === '') return true;

      return curr !== '' && orig === curr;
    });

    setIsDualBlindPassed(allMatched);
  }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues, dualBlindErrors]);


  //Change 4: Lines 752–754 (showTaxDetails in Checker Mode)
// In image_53.png (lines 752–754), debtorAgentBIC starts masked to "
// " in Checker mode. To prevent the Tax Details section from being 
// hidden before the checker types the BIC, inspect dualBlindCache or fallback to formValue


const debtorBicCountry = (
    (isChecker
      ? dualBlindCache.current.get('debtorAgentBIC') || formValues.debtorAgentBIC
      : formValues.debtorAgentBIC) || ''
  )
    .substring(4, 6)
    .toUpperCase();

  const showTaxDetails = LATAM_COUNTRIES.includes(debtorBicCountry);


  //Change 5: Line 958 (creditorAgentAccountNumber Name Discrepancy)
// In image_62.png (line 958):


// Change line 958 from:
{renderField('creditorAgentPostalAddress', 'Creditor Agent Account Number')}

// To:
{renderField('creditorAgentAccountNumber', 'Creditor Agent Account Number')}
