// The maker values inside paymentDetailsRequest 
// must be flattened onto the root of initialData so both 
// <SSPaymentFlow> and your local comparison see the ground-truth values at the top level.

//In InstructionDetailPage.tsx (Line 5661

initialData={
  selectedRowData
    ? {
        ...((selectedRowData as any).actionDetails || {}),
        ...((selectedRowData as any).paymentDetailsRequest || {}), // <-- ADD THIS LINE
        ...selectedRowData,
        accountId: (selectedRowData as any).accountId || (selectedRowData as any).paymentId,
        statusCode: (selectedRowData as any).statusCode,
        statusDescription: (selectedRowData as any).statusDescription,
        debtorAccountNumber: String(
          (selectedRowData as any).debtorAccountNumber ||
          (selectedRowData as any).paymentDetailsRequest?.debtorAccountNumber ||
          (selectedRowData as any).debitAccountNumber ||
          ""
        )
          .replace(/\/V\//g, "")
          .trim(),
      }
    : null
}


//Also in PaymentParent.tsx (Lines 1050–1060 where 
// stableInitialPaymentModel is computed):
// Ensure stableInitialPaymentModel flattens paymentDetailsRequest 
// to prevent null root properties from overriding it:


const stableInitialPaymentModel = useMemo(() => {
  if (!initialData) return null;
  const pdr = (initialData as any).paymentDetailsRequest || {};
  const act = (initialData as any).actionDetails || {};
  return {
    ...initialData,
    ...act,
    ...pdr, // Flattens debtorName, debtorAgentBIC, creditorAccount, etc. to root
  };
}, [initialData]);