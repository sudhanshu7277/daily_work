//In SSPaymentFlow.tsx, add a dedicated useEffect (or update your hydration effect) that watches for when formValues.instructedAmount gets populated:

//Add the Ref and Effects (place near your other hooks, e.g., around lines 570–585):

// 1. Ref to ensure the pre-population check runs once per loaded payment/record
const hasVerifiedPrepopulatedAmountRef = useRef<boolean>(false);

// 2. Reset the ref whenever the active record changes (e.g. Next / Prev navigation)
useEffect(() => {
  hasVerifiedPrepopulatedAmountRef.current = false;
}, [paymentInput?.paymentId, paymentInput?.accountId]); 

// 3. Trigger verification when instructedAmount gets pre-populated
useEffect(() => {
  const amount = formValues?.instructedAmount;
  const isPopulated =
    amount !== undefined &&
    amount !== null &&
    amount !== '' &&
    amount !== 0 &&
    amount !== '0';

  if (isPopulated && !hasVerifiedPrepopulatedAmountRef.current) {
    hasVerifiedPrepopulatedAmountRef.current = true;

    // Trigger dual-blind validation for instructedAmount
    validateSingleDualBlindKeyField?.("instructedAmount");

    // Trigger the verify API / hardcap check
    onAmountBlur?.();
  }
}, [formValues?.instructedAmount, onAmountBlur, validateSingleDualBlindKeyField]);