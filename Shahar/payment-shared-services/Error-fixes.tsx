// Here is how to set paymentId: resolvedAccountId inside PaymentParent.tsx:

// Step 1: In PaymentParent.tsx, Update handlePaymentOutput (around line 1045)
// Make sure resolvedAccountId is retrieved from initialData or 
// instruction.accounts, and assigned to paymentId:


const handlePaymentOutput = useCallback(
  (output: PaymentComponentOutput) => {
    const newValid = Boolean(output?.isValid);
    const newDualBlind = Boolean(output?.isDualBlindKeyPassed);
    setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
    setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

    const pData: any = output?.paymentData;
    if (!pData) return;

    // 1. Clean the account number to find the exact account record
    const cleanFormAccount = String(pData.debtorAccountNumber || '')
      .replace(/\//g, '')
      .trim();

    // 2. Find the matched account object from instruction.accounts or actionDetailsList
    const matchedAccount =
      (instruction?.accounts as any[])?.find(
        (acc: any) =>
          String(acc?.debitAccountNumber || acc?.debtorAccountNumber || '')
            .replace(/\//g, '')
            .trim() === cleanFormAccount
      ) ||
      actionDetailsList?.find(
        (action: any) =>
          String(action?.debitAccountNumber || action?.debtorAccountNumber || '')
            .replace(/\//g, '')
            .trim() === cleanFormAccount
      );

    // 3. Resolve accountId (as a string)
    const resolvedAccountId = String(
      initialData?.accountId ??
      (initialData as any)?.actionDetails?.accountId ??
      matchedAccount?.accountId ??
      pData?.accountId ??
      ''
    ).trim();

    console.log('Resolved accountId for paymentId:', resolvedAccountId);

    // 4. Construct payload ensuring paymentId is set to resolvedAccountId
    const makerSSPaymentPayload = {
      txnId: instructionId_ ? String(instructionId_) : undefined,
      maker: 'SS47983',
      dupValidityCheckDays: 30,
      overrideDuplicate: false,
      paymentId: resolvedAccountId, // Root-level paymentId
      accountId: resolvedAccountId,
      duplicateCheckFieldList: ['debtorAccountNumber', 'instructedAmount'],
      duplicateInputDataModel: {},
      duplicateRefId: '',
      paymentDetailsRequest: {
        ...pData,
        // CRITICAL: paymentId set to accountId
        paymentId: resolvedAccountId,
        accountId: resolvedAccountId,
        requestedExecutionDate:
          pData.requestedExecutionDate || pData.valueDate || new Date().toISOString().split('T')[0],
        debtorName: pData.debtorName || '',
        source: 'UI',
        debtorAccountNumber: cleanFormAccount,
        debtorAgentBIC: pData.debtorAgentBIC || '',
        debtorAgentBank: pData.debtorAgentBank || '',
        chargeBearer: pData.chargeBearer || 'DEBT',
        chargesAmount: pData.chargesAmount || 200,
        chargesAgentBIC: pData.chargesAgentBIC || '',
        instructedAmount: String(pData.instructedAmount ?? ''),
        instructedAmountCurrencyCode: pData.instructedAmountCurrencyCode || 'USD',
        taxIdNumber: instructionId_ ? String(instructionId_) : '',
        taxIdType: instructionId_ ? String(instructionId_) : '',
        txnId: instructionId_ ? String(instructionId_) : '',
      },
    };

    currentFormPayload.current = makerSSPaymentPayload;
  },
  [instruction, actionDetailsList, initialData, instructionId_]
);



// Step 2: In handleMakerSubmit (where fetch('/.../createMakerPayment') is called)
//Verify that the payload sent to the backend includes paymentId inside paymentDetailsRequest


// Ensure the payload ref has the paymentId before dispatching
const finalPayload = {
  ...currentFormPayload.current,
  paymentId: currentFormPayload.current?.paymentId || (initialData as any)?.accountId,
  paymentDetailsRequest: {
    ...currentFormPayload.current?.paymentDetailsRequest,
    paymentId:
      currentFormPayload.current?.paymentDetailsRequest?.paymentId ||
      currentFormPayload.current?.paymentId ||
      String((initialData as any)?.accountId || ''),
  },
};