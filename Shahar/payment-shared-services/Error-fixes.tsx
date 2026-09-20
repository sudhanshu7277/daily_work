// 1. In PaymentParent.tsx: Keep the Entire Action Payload
Update mergeAccountsWithActionDetails (around line 221 in PaymentParent.tsx):

Instead of picking just a few fields, spread or attach matchedAction completely:


export const mergeAccountsWithActionDetails = (
  accountsList: any[] = [],
  actionDetailsList: any[] = []
) => {
  return accountsList.map((account) => {
    const accInstId = String(account?.instructionId ?? '').trim();
    const accDebitNo = String(account?.debitAccountNumber ?? '').replace(/\//g, '').trim();

    // Find the exact maker submission for this wire
    const matchedAction = actionDetailsList.find((action) => {
      const actionInstId = String(action?.parentReferenceId ?? '').trim();
      const actionDebitNo = String(action?.debtorAccountNumber ?? '').replace(/\//g, '').trim();
      return accInstId === actionInstId && accDebitNo === actionDebitNo;
    });

    const isMakerState = matchedAction?.state === 'MAKER';

    return {
      // 1. Existing account data
      ...account,

      // 2. Grid action controls
      status: isMakerState ? 'Payment Checker' : (account?.status || 'Payment Maker'),
      actionText: isMakerState ? 'Review' : 'Edit',

      // 3. Keep the entire raw maker submission in actionDetails
      actionDetails: matchedAction || null,

      // 4. Also spread matchedAction fields directly onto the object so they are immediately available
      ...(matchedAction || {}),
    };
  });
};


// 2. In InstructionDetailPage.tsx: Pass the Captured Maker Data directly
When the user clicks "Review" on the row, handleEditRow(row) puts that full record into selectedRowData.

Because selectedRowData now contains the full maker submission, simplify initialData passed to <SplitPaymentMakerModal .../>:



<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  instructionId={instructionId}
  instruction={instruction}
  mode={modalMode} // 'checker'
  wireIndex={selectedLatamIndex}
  movementAmount={selectedRowData?.amount ? String(selectedRowData.amount) : undefined}
  documents={
    Array.isArray(documents) && documents.length > 0
      ? documents
      : (instruction as any)?.documents || []
  }
  // Simply take the maker submission captured on the row
  initialData={
    selectedRowData
      ? ({
          // 1. If we preserved the full payload in actionDetails, prioritize it
          ...(selectedRowData.actionDetails || {}),
          // 2. Fall back to any row properties
          ...selectedRowData,
          // 3. Ensure debtorAccountNumber has no slashes
          debtorAccountNumber: String(
            selectedRowData.debtorAccountNumber ||
            selectedRowData.debitAccountNumber ||
            ''
          ).replace(/\//g, '').trim(),
        } as any)
      : null
  }
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  // ... callbacks
/>