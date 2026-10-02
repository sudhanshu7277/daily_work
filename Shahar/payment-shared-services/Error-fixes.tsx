//1. The Payload Identifier Resolution
//Update the extraction of paymentId and transactionId 
// before constructing the request body so it extracts 
// the database key 1192 instead of falling back to the 19-digit snowflake/transaction ID:


// Resolve the true internal payment primary key (e.g. "1192")
const resolvedTxnId = String(
    rowData?.transactionId ||
    rowData?.paymentTransactionWorkflow?.transactionId ||
    rowData?.actionDetails?.transactionId ||
    ''
  );
  
  const rawPaymentId = String(
    rowData?.paymentTransactionWorkflow?.paymentId ||
    rowData?.actionDetails?.paymentId ||
    rowData?.paymentId ||
    ''
  );
  
  // Prevent transactionId from poisoning paymentId when they are identical
  const resolvedPaymentId = String(
    (rawPaymentId && rawPaymentId !== resolvedTxnId)
      ? rawPaymentId
      : rowData?.paymentTransactionWorkflow?.paymentId ||
        rowData?.actionDetails?.paymentId ||
        rowData?.paymentId ||
        rowData?.accountId ||
        ''
  );
  
  const getMakerPayload = {
    applicationName: 'GAB',
    moduleName: 'GAB-LATAM',
    maker: rowData?.maker || soeId,
    paymentId: resolvedPaymentId,
    transactionId: resolvedTxnId,
    txnid: String(instructionId || rowData?.txnid || rowData?.paymentTransactionWorkflow?.parentReferenceId || ''),
  };


  //2. Guarding initialData When Passing to SplitPaymentMakerModal
//In InstructionDetailPage.tsx// (around lines 5791–5808), ensure the state or 
// response payload mapped into initialData prioritizes


initialData={
    selectedRowData
      ? {
          ...((selectedRowData as any).actionDetails || {}),
          ...((selectedRowData as any).paymentDetailsRequest || {}),
          ...selectedRowData,
          // Ensure paymentId preserves the short internal ID
          paymentId: String(
            (selectedRowData as any).paymentTransactionWorkflow?.paymentId ||
            ((selectedRowData as any).paymentId !== (selectedRowData as any).transactionId ? (selectedRowData as any).paymentId : '') ||
            (selectedRowData as any).actionDetails?.paymentId ||
            (selectedRowData as any).accountId ||
            ''
          ),
          transactionId: String(
            (selectedRowData as any).transactionId ||
            (selectedRowData as any).paymentTransactionWorkflow?.transactionId ||
            ''
          ),
          debtorAccountNumber: String(
            (selectedRowData as any).paymentDetailsRequest?.debtorAccountNumber ||
            (selectedRowData as any).debtorAccountNumber ||
            (selectedRowData as any).debitAccountNumber ||
            ''
          )
          .replace(/\//g, '')
          .trim(),
        }
      : null
  }