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




/// pagination fixes


private buildPageNumbers(): (number | '...')[] {
  const t = this.totalPages;
  const c = this.currentPage;
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);

  const pages: (number | '...')[] = [];

  if (c <= 4) {
    // Near start: 1, 2, 3, 4, 5, ..., lastPage
    for (let i = 1; i <= 5; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(t);
  } else if (c >= t - 3) {
    // Near end: 1, ..., lastPage-4, lastPage-3, lastPage-2, lastPage-1, lastPage
    pages.push(1);
    pages.push('...');
    for (let i = t - 4; i <= t; i++) {
      pages.push(i);
    }
  } else {
    // Middle sliding window: 1, ..., c-1, c, c+1, ..., lastPage
    pages.push(1);
    pages.push('...');
    for (let i = c - 1; i <= c + 1; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(t);
  }

  return pages;
}

