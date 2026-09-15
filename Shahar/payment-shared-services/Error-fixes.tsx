const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  console.log('checking if form is valid : ', output?.isValid);
  console.log('checking payload of maker form output : ', output);

  // Trust the library's internal validation directly
  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  const pData: any = output?.paymentData;
  if (!pData) return;

  currentFormPayloadRef.current = {
    txndId: instructionId_ ? String(instructionId_) : undefined,
    maker: 'SS71872',
    paymentDetailsRequest: {
      requestedExecutionDate: pData.requestedExecutionDate || pData.valueDate || '',
      debtorName: pData.debtorName || '',
      source: 'UI',
      debtorAccountNumber: pData.debtorAccountNumber || '',
      debtorAgentBIC: pData.debtorAgentBIC || '',
      chargeBearer: pData.chargeBearer || 'DEBT',
      chargesAmount: pData.chargesAmount || '',
      chargesAgentBIC: pData.chargesAgentBIC || '',
      debtorAddressLines1: pData.debtorAddressLines1 || pData.debtorAddressLine1 || '',
      debtorTownName: pData.debtorTownName || pData.debtorTown || '',
      debtorCountryCode: pData.debtorCountryCode || pData.debtorCountry || '',
      instructedAmount: pData.instructedAmount != null ? String(pData.instructedAmount) : '',
      instructedAmountCurrencyCode: pData.instructedAmountCurrencyCode || pData.currency || 'USD',
      creditorName: pData.creditorName || '',
      creditorAccount: pData.creditorAccount || '',
      creditorAgentFinancialInstitutionBIC: pData.creditorAgentFinancialInstitutionBIC || pData.creditorAgentBIC || '',
      creditorAgentFinancialInstitutionName: pData.creditorAgentFinancialInstitutionName || pData.creditorAgentBankName || '',
      creditorAddressLines1: pData.creditorAddressLines1 || pData.creditorAddressLine1 || '',
      applicationName: 'GAB-LATAM',
      applicationModule: 'GAB-LATAM',
      region: 'LATAM',
      paymentId: pData.paymentId || 'PAY-2024-001',
    },
    dupValidityCheckDays: 30,
    duplicateCheckFieldList: ['debtorAccountNumber', 'instructedAmount'],
    overrideDuplicate: false,
    duplicateRefId: '',
    duplicateInputDataModel: {},
  };
}, [instructionId_]);