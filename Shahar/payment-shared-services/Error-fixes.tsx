//Step 1: Update handleEditRow in InstructionDetailPage.tsx
// In InstructionDetailPage.tsx (around lines 1712–1763):


const handleEditRow = async (rowData: any) => {
  const isChecker =
    rowData?.actionText === "Review" ||
    rowData?.status === "PAYMENT_CHECKER" ||
    rowData?.statusCode === "MAKER";

  if (isChecker) {
    try {
      // 1. Correct payload field mapping (paymentId is accountId, txnId is instructionId)
      const payload = {
        moduleName: "GAB-LATAM",
        applicationName: "GAB",
        maker: rowData?.maker || "",
        paymentId: rowData?.accountId ?? rowData?.paymentId ?? "",
        transactionId: rowData?.matchedAction?.paymentTransactionId ?? rowData?.transactionId ?? "",
        txnId: rowData?.instructionId ?? rowData?.txnId ?? "",
      };

      // 2. Fetch the maker record
      const res = await getMakerPaymentPerRecord(payload);
      const record = Array.isArray(res) ? res[0] : res;
      const pdr = record?.paymentDetailsRequest || {};

      // 3. Format data exactly like the old working structure
      setSelectedRowData({
        ...rowData,
        ...record,
        ...pdr, // Flattens debtorName, debtorAgentBIC, creditorAccount, etc.
        paymentDetailsRequest: pdr,
        paymentTransactionWorkflow: null, // Neutralize the new workflow object to match old response
        accountId: record?.paymentId || rowData?.accountId,
        paymentId: record?.paymentId || rowData?.paymentId,
      });
    } catch (err) {
      console.error("Failed to fetch maker payment per record:", err);
      setSelectedRowData(rowData);
    }
  } else {
    setSelectedRowData(rowData);
  }

  // 4. Open modal only after data preparation completes
  setModalMode(isChecker ? "checker" : "maker");
  setShowSplitMakerModal(true);
};


//Step 2: Ensure the Modal's initialData Prop Pass-Through is Flattened
// In InstructionDetailPage.tsx where <PaymentParent> or the modal is 
// rendered (around line 5660)


initialData={
  selectedRowData
    ? {
        ...((selectedRowData as any).actionDetails || {}),
        ...((selectedRowData as any).paymentDetailsRequest || {}),
        ...selectedRowData,
        accountId: (selectedRowData as any).accountId || (selectedRowData as any).paymentId,
        paymentId: (selectedRowData as any).paymentId || (selectedRowData as any).accountId,
        debtorAccountNumber: String(
          (selectedRowData as any).paymentDetailsRequest?.debtorAccountNumber ||
          (selectedRowData as any).debtorAccountNumber ||
          (selectedRowData as any).debitAccountNumber ||
          ""
        )
          .replace(/\/V\//g, "")
          .trim(),
      }
    : null
}


//Step 3: AG-Grid Column Button onClick Cleanup
// In InstructionDetailPage.tsx (around lines 635–642), 
// ensure onEditRow handles the workflow alone without the second 
// un-awaited getMakerPaymentPerRecord call:



<Button
  color="primary"
  size="sm"
  disabled={false}
  onClick={() => {
    if (p.data && p.context?.onEditRow) {
      p.context.onEditRow(p.data);
    }
  }}
>
  {buttonLabel}
</Button>