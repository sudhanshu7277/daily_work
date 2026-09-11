// 1. Disable Address Lookup in the Component Config (Recommended)
//The shared payment library (@citi-icg-179025/payment-flow-reactjs-ui-lib / 
// SSPaymentFlow) exposes feature flags to disable asynchronous postal/address lookups.

//In PaymentParent.tsx, find where the config object or <SSPaymentFlow> 
// props are passed (around lines 230–258):


const paymentFlowConfig = useMemo(() => ({
  applicationName: 'ADR',
  applicationModule: 'ADR',
  paymentMode: mode,
  enableAddressLookup: false,       // <-- Add this flag
  disableAddressLookup: true,       // <-- Add this flag
  isAddressLookupEnabled: false,    // <-- Add this flag
  // ... rest of config
}), [mode]);


// 2. Memoize the config and initialData to Kill the Re-render Loop
//In Image 28, lines 250–259 show the config object being returned inside a switch / useMemo block with dependencies [activeTab, initialData, activeSubmittedTransaction, repairReviewFieldList].

//If initialData or any parent prop creates a new object reference on each render, that config recalculates every render, causing the address component to mount/unmount and fire address-lookup in an infinite cascade.

//In PaymentParent.tsx:

//Stabilize initialData reference:


const stableInitialData = useMemo(() => {
  return initialData;
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [JSON.stringify(initialData)]);


// Add equality guards in handlePaymentOutput (Lines 261–267):


const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  if (output?.paymentData) {
    setCurrentFormPayload((prev) => {
      // Prevent infinite state cycle if payload is identical
      if (prev && JSON.stringify(prev) === JSON.stringify(output.paymentData)) {
        return prev;
      }
      return output.paymentData;
    });
  }
}, []);


//3. Check Vite Proxy / Mock Route (If Address Lookup is Not Needed)
//If your environment does not use the address lookup service, 
// you can stub the route directly in vite.config.ts so calls 
// immediately resolve with an empty object:

//In vite.config.ts under server.proxy:


'/nextgengab/api/api/v1/gab/address-lookup': {
  bypass: (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ addressLines: [] }));
    return true;
  },
},


