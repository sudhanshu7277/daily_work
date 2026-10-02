//The Surgical Fix for InstructionDetailPage.tsx
// Replace lines 1742 to 1768 with this block:   

const getMakerPayload = {
    moduleName: "GAB-LATAM",
    applicationName: "GAB",
    maker: rowData?.maker || "",
    paymentId: resolvedPaymentId,
    transactionId: resolvedTxnId,
    txnid: String(rowData?.instructionId || rowData?.txnid || ""),
  };

  console.log('Fetching maker payment for checker review with payload:', getMakerPayload);

  const res = await getMakerPaymentPerRecord(getMakerPayload);
  const record = Array.isArray(res) ? res[0] : res;
  // In QA, maker data is at the root of record, but fallback to nested for legacy:
  const pdr = record?.paymentDetailsRequest || {};

  setSelectedRowData({
    ...rowData,
    ...pdr,
    ...(record || {}), // Spread root fields directly so debtorName, instructedAmount, etc. exist!
    paymentDetailsRequest: pdr,
    paymentTransactionWorkflow:
      record?.paymentTransactionWorkflow ??
      rowData?.paymentTransactionWorkflow ??
      null,
    accountId: rowData?.accountId || record?.accountId,
    paymentId: resolvedPaymentId,
    transactionId: resolvedTxnId,
  });

  