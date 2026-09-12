// The Complete Fix for PaymentParent.tsx
// Step 1: Map fields from output.paymentData instead of activeSubmittedTransaction.payload
// In lines 285–365 of PaymentParent.tsx:

const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  const pData: any = output?.paymentData;
  if (!pData) return;

  // Build payload reading directly from live form output (pData)
  const makerSSPaymentPayload = {
    txndId: instructionId && String(instructionId),
    maker: currentUserId || 'SS71872',
    paymentDetailsRequest: {
      requestedExecutionDate: pData.requestedExecutionDate || pData.valueDate || '',
      debtorName: pData.debtorName || '',
      source: 'UI',
      debtorAccountNumber: pData.debtorAccountNumber || '',
      debtorAgentBIC: pData.debtorAgentBIC || '',
      debtorAgentBank: pData.debtorAgentBank || '',
      chargeBearer: pData.chargeBearer || 'DEBT',
      chargesAmount: pData.chargesAmount || '',
      chargesAgentBIC: pData.chargesAgentBIC || '',
      debtorAddressLines: pData.debtorAddressLines || '',
      debtorStreetName: pData.debtorStreetName || '',
      debtorBuildingNumber: pData.debtorBuildingNumber || '',
      debtorPostalCode: pData.debtorPostalCode || '',
      debtorTownName: pData.debtorTownName || '',
      debtorCountrySubDivision: pData.debtorCountrySubDivision || '',
      debtorCountryCode: pData.debtorCountryCode || '',
      debtorSortCodeUK: pData.debtorSortCodeUK || '',
      debtorSortCodeUS: pData.debtorSortCodeUS || '',
      debtorAddressLines1: pData.debtorAddressLines1 || pData.debtorAddressLine1 || '',
      debtorAddressLines2: pData.debtorAddressLines2 || pData.debtorAddressLine2 || '',
      debtorState: pData.debtorState || '',
      instructedAmount: pData.instructedAmount != null ? String(pData.instructedAmount) : '',
      instructedAmountCurrencyCode: pData.instructedAmountCurrencyCode || pData.currency || 'USD',
      creditorName: pData.creditorName || '',
      creditorAccount: pData.creditorAccount || '',
      creditorAgentAccountNumber: pData.creditorAgentAccountNumber || '',
      creditorAgentFinancialInstitutionBIC: pData.creditorAgentFinancialInstitutionBIC || '',
      creditorAgentFinancialInstitutionName: pData.creditorAgentFinancialInstitutionName || '',
      creditorAgentPostalAddress: pData.creditorAgentPostalAddress || '',
      creditorAddressLines: pData.creditorAddressLines || '',
      creditorStreetName: pData.creditorStreetName || '',
      creditorBuildingNumber: pData.creditorBuildingNumber || '',
      creditorPostalCode: pData.creditorPostalCode || '',
      creditorTownName: pData.creditorTownName || '',
      creditorCountrySubDivision: pData.creditorCountrySubDivision || '',
      creditorCountryCode: pData.creditorCountryCode || '',
      creditorSortCodeUK: pData.creditorSortCodeUK || '',
      creditorSortCodeUS: pData.creditorSortCodeUS || '',
      creditorAddressLines1: pData.creditorAddressLines1 || pData.creditorAddressLine1 || '',
      creditorAddressLines2: pData.creditorAddressLines2 || pData.creditorAddressLine2 || '',
      creditorState: pData.creditorState || '',
      ustrdPaymentDetails: pData.ustrdPaymentDetails || '',
      painPaymentMethodType: pData.painPaymentMethodType || 'CBT',
      firstIntermediaryBankBIC: pData.firstIntermediaryBankBIC || '',
      firstIntermediaryBankRoutingCode: pData.firstIntermediaryBankRoutingCode || '',
      firstIntermediaryBankName: pData.firstIntermediaryBankName || '',
      firstIntermediaryBankCountryCode: pData.firstIntermediaryBankCountryCode || '',
      firstIntermediaryBankAccountID: pData.firstIntermediaryBankAccountID || '',
      secondIntermediaryBankBIC: pData.secondIntermediaryBankBIC || '',
      secondIntermediaryBankRoutingCode: pData.secondIntermediaryBankRoutingCode || '',
      secondIntermediaryBankName: pData.secondIntermediaryBankName || '',
      secondIntermediaryBankCountryCode: pData.secondIntermediaryBankCountryCode || '',
      secondIntermediaryBankAccountID: pData.secondIntermediaryBankAccountID || '',
      applicationName: 'GAB-LATAM',
      applicationModule: 'GAB-LATAM',
      region: 'LATAM',
      paymentId: pData.paymentId || 'PAY-2024-001',
      taxIdNumber: instructionId ? String(instructionId) : '',
      purposeOfPayment: pData.purposeOfPayment || '',
      taxIdType: instructionId ? String(instructionId) : '',
      taxPurposeCode: pData.taxPurposeCode || '',
      regulatoryReportingCode: pData.regulatoryReportingCode || '',
      invoiceReferenceNumber: pData.invoiceReferenceNumber || '',
    },
    dupValidityCheckDays: 30,
    duplicateCheckFieldList: ['debtorAccountNumber', 'instructedAmount'],
    overrideDuplicate: false,
    duplicateRefId: '',
    duplicateInputDataModel: {},
  };

  setCurrentFormPayload((prev) => {
    if (prev && JSON.stringify(prev) === JSON.stringify(makerSSPaymentPayload)) {
      return prev;
    }
    console.log('makerSSPaymentPayload line 360 :', makerSSPaymentPayload);
    return makerSSPaymentPayload;
  });
}, [currentUserId, instructionId]);


// Step 2: Stabilize dynamicPaymentInput in PaymentParent.tsx
// Lines 267–273 in image_40.png are recreating dynamicPaymentInput 
// whenever initialData changes reference.

// Change its dependency array from [activeTab, initialData, ...] 
// to depend only on primitive fields:

const dynamicPaymentInput: PaymentComponentInput = useMemo(() => {
  // your existing switch block
  switch (activeTab) {
    // ...
    default:
      return {
        applicationName: 'ADR',
        applicationModule: 'ADR',
        currency: initialData?.instructedAmountCurrencyCode ?? 'USD',
        paymentMode: 'maker',
        dualBlindKeyFlag: 'N',
        paymentModel: initialData ? { ...createEmptyPain001(), ...initialData } : null,
      };
  }
// Stabilize dependencies so this DOES NOT recalculate on every parent render
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  activeTab, 
  initialData?.debtorAccountNumber, 
  initialData?.instructedAmount, 
  initialData?.instructedAmountCurrencyCode,
  activeSubmittedTransaction?.id,
  repairReviewFieldList
]);