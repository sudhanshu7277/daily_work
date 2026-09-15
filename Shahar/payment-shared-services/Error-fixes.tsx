const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  console.log('checking if form is valid : ', output?.isValid);
  console.log('checking payload of maker form output : ', output);

  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));