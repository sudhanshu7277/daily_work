// Step 1: Ensure accountId is Preserved in mergeAccountsWithActionDetails
// In PaymentParent.tsx lines 297–302 (image_60.png), 
// confirm accountId from account is kept on the merged object:


return {
  ...account,
  accountId: account?.accountId ?? matchedAction?.accountId ?? null,
  status: isMakerState ? 'Payment Checker' : (account?.status || 'Payment Maker'),
  actionText: isMakerState ? 'Review' : 'Edit',
  actionDetails: matchedAction || null,
  ...(matchedAction || {}),
};


/// Step 2: Extract accountId in handlePaymentOutput
//In PaymentParent.tsx around lines 1045–1055 (image_64.png), extract accountId by looking up the active record from:

//initialData?.accountId (passed down when clicking Edit/Review)

// Matching against actionDetailsList or instruction?.accounts using debtorAccountNumber


const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);
  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  const pData: any = output?.paymentData;
  if (!pData) return;

  // 1. Extract accountId from initialData or find matching account record
  const cleanFormAccount = String(pData.debtorAccountNumber || '').replace(/\//g, '').trim();

  const matchedAccount =
    (instruction?.accounts as any[])?.find(
      (acc: any) =>
        String(acc?.debitAccountNumber || acc?.debtorAccountNumber || '').replace(/\//g, '').trim() === cleanFormAccount
    ) ||
    actionDetailsList?.find(
      (action: any) =>
        String(action?.debtorAccountNumber || '').replace(/\//g, '').trim() === cleanFormAccount
    );

  const resolvedAccountId =
    initialData?.accountId ??
    (initialData as any)?.actionDetails?.accountId ??
    matchedAccount?.accountId ??
    pData?.accountId ??
    '';

  console.log('checking payload values per record when clicking submit : ', pData, 'accountId:', resolvedAccountId);

  const makerSSPaymentPayload = {
    txnId: instructionId_ ? String(instructionId_) : undefined,
    maker: 'SS47983',
    // If accountId is required at the root level of the payload:
    accountId: resolvedAccountId,
    paymentDetailsRequest: {
      // Included in paymentDetailsRequest per record
      accountId: resolvedAccountId,
      paymentId: pData.paymentId || (initialData as any)?.paymentId || '',
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
      // ... rest of the fields
    },
  };

  currentFormPayload.current = makerSSPaymentPayload;
}, [instruction, actionDetailsList, initialData, instructionId_]);


// Step 1: Update mergeAccountsWithActionDetails in PaymentParent.tsx
// In PaymentParent.tsx (around line 280), ensure matching checks 
// debitAccountNumber with stripped slashes, and explicitly forward a
// ccountId, statusCode, and statusDescription


export const mergeAccountsWithActionDetails = (
  accountsList: any[] = [],
  actionDetailsList: any[] = []
) => {
  return accountsList.map((account) => {
    const accInstId = String(account?.instructionId ?? '').trim();
    const accDebitNo = String(account?.debitAccountNumber ?? account?.debtorAccountNumber ?? '')
      .replace(/\//g, '')
      .trim();

    // Match either by accountId directly, or by instructionId + debitAccountNumber
    const matchedAction = actionDetailsList.find((action) => {
      if (account?.accountId && action?.accountId && String(account.accountId) === String(action.accountId)) {
        return true;
      }
      const actionInstId = String(action?.instructionId ?? action?.parentReferenceId ?? '').trim();
      const actionDebitNo = String(action?.debitAccountNumber ?? action?.debtorAccountNumber ?? '')
        .replace(/\//g, '')
        .trim();
      return accInstId === actionInstId && accDebitNo === actionDebitNo;
    });

    const isMakerState = matchedAction?.state === 'MAKER' || matchedAction?.statusCode === 'MAKER';

    return {
      // 1. Existing row data
      ...account,

      // 2. Extracted new properties from details-for-action
      accountId: matchedAction?.accountId ?? account?.accountId ?? null,
      statusCode: matchedAction?.statusCode ?? account?.statusCode ?? null,
      statusDescription: matchedAction?.statusDescription ?? account?.statusDescription ?? null,

      // 3. Grid status & action text
      status: isMakerState ? 'Payment Checker' : (matchedAction?.statusDescription || account?.status || 'Payment Maker'),
      actionText: isMakerState ? 'Review' : 'Edit',

      // 4. Retain full raw payload for reference
      actionDetails: matchedAction || null,
      matchedAction: matchedAction || null,

      // 5. Spread all remaining action fields
      ...(matchedAction || {}),
    };
  });
};


//Step 2: Propagate in SplitPaymentMakerModal.tsx
// Ensure SplitPaymentMakerModal.tsx passes the updated accounts
//  list through to onAccountsUpdate:


<PaymentParent
  instruction={instruction}
  instructionId={instructionId}
  // ... other props
  onAccountsUpdate={(updatedAccounts) => {
    onAccountsUpdate?.(updatedAccounts);
  }}
/>


//Step 3: Handle in InstructionDetailPage.tsx
// In InstructionDetailPage.tsx, make sure the callback
//  handler captures the updated accounts list and saves it into the page state:

const handleAccountsUpdate = (updatedAccounts: any[]) => {
  setInstructionAccounts(updatedAccounts);
  
  // If instruction object holds an accounts array, update it as well
  setInstruction((prev: any) => {
    if (!prev) return prev;
    return {
      ...prev,
      accounts: updatedAccounts,
    };
  });

  // If a row is currently selected, keep its reference in sync with latest details
  setSelectedRowData((prevRow: any) => {
    if (!prevRow) return null;
    const freshRow = updatedAccounts.find(
      (acc: any) =>
        (acc.accountId && prevRow.accountId && String(acc.accountId) === String(prevRow.accountId)) ||
        String(acc.debitAccountNumber || '').replace(/\//g, '') ===
          String(prevRow.debitAccountNumber || '').replace(/\//g, '')
    );
    return freshRow || prevRow;
  });
};


// In the JSX for <SplitPaymentMakerModal>:


<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  instructionId={instructionId}
  instruction={instruction}
  // ...
  onAccountsUpdate={handleAccountsUpdate}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
/>


//Step 4: Include in Modal initialData
// When selectedRowData is passed to the modal for Review or Edit,
//  accountId, statusCode, and statusDescription will be accessible directly:


initialData={
  selectedRowData
    ? {
        ...((selectedRowData as any).actionDetails || {}),
        ...selectedRowData,
        accountId: (selectedRowData as any).accountId,
        statusCode: (selectedRowData as any).statusCode,
        statusDescription: (selectedRowData as any).statusDescription,
        debtorAccountNumber: String(
          (selectedRowData as any).debtorAccountNumber ||
            selectedRowData.debitAccountNumber ||
            ""
        )
          .replace(/\//g, "")
          .trim(),
      }
    : null
}