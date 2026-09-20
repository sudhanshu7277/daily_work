// In InstructionDetailPage.tsx, replace the
//  lines constructing initialData (lines 5583 to 5607) with this exact block:   


initialData={
  selectedRowData
    ? {
        ...selectedRowData,
        ...(selectedRowData.actionDetails || selectedRowData.matchedAction || {}),
        debtorAccountNumber: String(
          selectedRowData.debtorAccountNumber ||
            selectedRowData.debitAccountNumber ||
            ""
        ).replace(/\//g, "").trim(),
        instructedAmountCurrencyCode:
          selectedRowData.instructedAmountCurrencyCode ||
          selectedRowData.actionDetails?.instructedAmountCurrencyCode ||
          selectedRowData.currency ||
          "USD",
        instructedAmount:
          selectedRowData.instructedAmount ??
          selectedRowData.actionDetails?.instructedAmount ??
          (typeof selectedRowData.amount === "number" ? selectedRowData.amount : undefined),
        debtorName:
          selectedRowData.debtorName ||
          selectedRowData.actionDetails?.debtorName ||
          (instruction as any)?.clientName ||
          (instruction as any)?.dealName ||
          "",
        painPaymentMethodType:
          selectedRowData.painPaymentMethodType ||
          selectedRowData.actionDetails?.painPaymentMethodType ||
          selectedRowData.transactionType ||
          "BKT",
        requestedExecutionDate:
          selectedRowData.requestedExecutionDate ||
          selectedRowData.actionDetails?.requestedExecutionDate ||
          (instruction as any)?.valueDate ||
          new Date().toISOString().split("T")[0],
        creditorName:
          selectedRowData.creditorName ||
          selectedRowData.actionDetails?.creditorName,
        creditorAccount:
          selectedRowData.creditorAccount ||
          selectedRowData.actionDetails?.creditorAccount,
        creditorAgentBIC:
          selectedRowData.creditorAgentBIC ||
          selectedRowData.actionDetails?.creditorAgentBIC,
        debtorAgentBIC:
          selectedRowData.debtorAgentBic ||
          selectedRowData.actionDetails?.debtorAgentBic,
      }
    : null
}