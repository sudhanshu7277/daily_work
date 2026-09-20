// Step 1: Define modalInitialData right above the modal return
// In InstructionDetailPage.tsx, right before the modal is returned 
// in JSX (or before line 5554):


const row = selectedRowData as any;
  const action = row?.actionDetails || row?.matchedAction || {};

  const modalInitialData = selectedRowData
    ? {
        ...row,
        ...action,
        debtorAccountNumber: String(
          row.debtorAccountNumber ||
          row.debitAccountNumber ||
          ""
        ).replace(/\//g, "").trim(),
        instructedAmountCurrencyCode:
          row.instructedAmountCurrencyCode ||
          action.instructedAmountCurrencyCode ||
          row.currency ||
          "USD",
        instructedAmount:
          row.instructedAmount ??
          action.instructedAmount ??
          (typeof row.amount === "number" ? row.amount : undefined),
        debtorName:
          row.debtorName ||
          action.debtorName ||
          (instruction as any)?.clientName ||
          (instruction as any)?.dealName ||
          "",
        painPaymentMethodType:
          row.painPaymentMethodType ||
          action.painPaymentMethodType ||
          row.transactionType ||
          "BKT",
        requestedExecutionDate:
          row.requestedExecutionDate ||
          action.requestedExecutionDate ||
          (instruction as any)?.valueDate ||
          new Date().toISOString().split("T")[0],
        creditorName:
          row.creditorName ||
          action.creditorName,
        creditorAccount:
          row.creditorAccount ||
          action.creditorAccount,
        creditorAgentBIC:
          row.creditorAgentBIC ||
          action.creditorAgentBIC,
        debtorAgentBIC:
          row.debtorAgentBic ||
          action.debtorAgentBic,
      }
    : null;


    // Step 2: Pass modalInitialData to the Modal
// Replace lines 5583 to 5637 with:


initialData={modalInitialData}