// 1. Guard handlePaymentOutput (Bottom-up)
// Update lines 260–267 in PaymentParent.tsx:

const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  if (output?.paymentData) {
    setCurrentFormPayload((prev) => {
      if (prev && JSON.stringify(prev) === JSON.stringify(output.paymentData)) {
        return prev;
      }
      return output.paymentData;
    });
  }
}, []);


// 2. Stabilize paymentModel / initialData (Top-down)
// In lines 250–258 (from your image_28.png):


paymentModel: initialData ? { ...createEmptyPain001(), ...initialData } : null


// If initialData is passed as an inline object from 
// InstructionDetailPage.tsx, { ...createEmptyPain001(), ...initialData } 
// produces a new object reference every time PaymentParent renders.

//To ensure this model only generates once when the modal opens:


// Above the switch/useMemo block in PaymentParent.tsx
const stableInitialPaymentModel = useMemo(() => {
  return initialData ? { ...createEmptyPain001(), ...initialData } : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialData?.debtorAccountNumber, initialData?.instructedAmount]);

// Then reference stableInitialPaymentModel on line 256:

paymentModel: stableInitialPaymentModel,

