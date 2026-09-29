// Here are the final, complete code changes for SSPaymentFlow.tsx.

// 1. Update instructedAmountChange and onAmountBlur
//  (Lines 384–414 in image_39.png)
// Add the if (isChecker) return; guard at the top of both functions 
// so no hardcap states are set and onAmountChange is never dispatched in checker mode:


const instructedAmountChange = (rawInputVal?: string) => {
  if (isChecker) return;

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
      instructedAmount: parsedAmount,
    });
  }, 400);
};

const onAmountBlur = () => {
  if (isChecker) return;

  const parsedAmount = parseFloat(String(formValues.instructedAmount ?? ''));
  if (!isNaN(parsedAmount) && parsedAmount > 0) {
    onAmountChange?.({
      instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
      instructedAmount: parsedAmount,
    });
  }
};


// 2. Update validateSingleDualBlindKeyField (Lines 219–236 in image_37.png)
// Normalize instructedAmount using parseFloat to ensure numeric 
// match comparisons work regardless of number vs. string formats:


const validateSingleDualBlindKeyField = useCallback(
  (fieldName: string) => {
    if (!isDualBlindEnabled || !paymentInput?.dualBlindKeyFields?.includes(fieldName)) return;

    const rawOriginal = dualBlindCache.current.get(fieldName) ?? '';
    const rawCurrent = (formValues as any)[fieldName] ?? '';

    let isMismatch = false;

    if (fieldName === 'instructedAmount') {
      const numOriginal =
        rawOriginal !== '' && rawOriginal !== null && rawOriginal !== undefined
          ? parseFloat(String(rawOriginal))
          : NaN;
      const numCurrent =
        rawCurrent !== '' && rawCurrent !== null && rawCurrent !== undefined
          ? parseFloat(String(rawCurrent))
          : NaN;

      if (isNaN(numCurrent) || isNaN(numOriginal)) {
        isMismatch = true;
      } else {
        isMismatch = numOriginal !== numCurrent;
      }
    } else {
      const original = String(rawOriginal).trim();
      const current = String(rawCurrent).trim();
      isMismatch = original !== current;
    }

    setDualBlindErrors(prev => {
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


//3. Update the JSX under instructedAmount (Lines 767–774 in image_33.png)
// Hide hardcap messages in checker mode and render the dual-blind error from dualBlindErrors


{/* 1. In Maker / Repair mode, show the hardcap status messages */}
{!isChecker && (
  <>
    {hardcapChecking && (
      <div className="hint">
        {pacsFormVerbiages?.ValidatingHardcapLimit || 'Validating hardcap limit...'}
      </div>
    )}
    {hardcapError && <div className="field-error">{hardcapError}</div>}
    {hardcapSuccessMessage && (
      <div className="success-message">{hardcapSuccessMessage}</div>
    )}
  </>
)}

{/* 2. In Checker mode, show the Dual-Blind comparison error */}
{isChecker && dualBlindErrors?.has('instructedAmount') && (
  <div className="field-error">
    {dualBlindErrors.get('instructedAmount')}
  </div>
)}