//File 1: InstructionDetailPage.tsx
// 1. Replace handleEditRow (Lines ~1712–1763)
// Fixes the swapped paymentId/txnId payload, ensures 
// paymentDetailsRequest flattens on top of root nulls, 
// and guarantees the modal only opens after the data is loaded:


const handleEditRow = async (rowData: any) => {
  const isChecker =
    rowData?.actionText === "Review" ||
    rowData?.status === "PAYMENT_CHECKER" ||
    rowData?.statusCode === "MAKER";

  if (isChecker) {
    try {
      // 1. Correct payload field mapping: paymentId = accountId, txnId = instructionId
      const payload = {
        moduleName: "GAB-LATAM",
        applicationName: "GAB",
        maker: rowData?.maker || "",
        paymentId: rowData?.accountId ?? rowData?.paymentId ?? "",
        transactionId: rowData?.matchedAction?.paymentTransactionId ?? rowData?.transactionId ?? "",
        txnId: rowData?.instructionId ?? rowData?.txnId ?? "",
      };

      // 2. Fetch the saved maker payment record
      const res = await getMakerPaymentPerRecord(payload);
      console.log("getMakerPaymentPerRecord result:", res);
      const record = Array.isArray(res) ? res[0] : res;
      const pdr = (record as any)?.paymentDetailsRequest || {};

      // 3. Put record into selectedRowData with paymentDetailsRequest flattened AFTER record
      // (This prevents root nulls from overwriting real maker values)
      setSelectedRowData({
        ...rowData,
        ...(record || {}),
        ...pdr,
        paymentDetailsRequest: pdr,
        accountId: (record as any)?.paymentId || rowData?.accountId,
        paymentId: (record as any)?.paymentId || rowData?.paymentId,
      });
    } catch (err) {
      console.error("Failed to fetch maker payment per record:", err);
      setSelectedRowData(rowData);
    }
  } else {
    setSelectedRowData(rowData);
  }

  // 4. Open the modal AFTER the data fetch and state mapping complete
  setModalMode(isChecker ? "checker" : "maker");
  setShowSplitMakerModal(true);
};



//2. Remove Redundant Fetch in AG-Grid Column onClick (Lines ~635–642)
// Ensure the button only triggers onEditRow:


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


//3. Modal initialData Prop (Lines ~5660–5676)
// Ensure initialData has paymentDetailsRequest flattened directly into the root:


initialData={
  selectedRowData
    ? {
        ...((selectedRowData as any).actionDetails || {}),
        ...((selectedRowData as any).paymentDetailsRequest || {}),
        ...selectedRowData,
        accountId: (selectedRowData as any).accountId || (selectedRowData as any).paymentId,
        paymentId: (selectedRowData as any).paymentId || (selectedRowData as any).accountId,
        statusCode: (selectedRowData as any).statusCode,
        statusDescription: (selectedRowData as any).statusDescription,
        debtorAccountNumber: String(
          (selectedRowData as any).paymentDetailsRequest?.debtorAccountNumber ||
          (selectedRowData as any).debtorAccountNumber ||
          (selectedRowData as any).debitAccountNumber ||
          ''
        )
          .replace(/\/V\//g, '')
          .trim(),
      }
    : null
}


//File 2: PaymentParent.tsx
// 1. Replace stableInitialPaymentModel (Lines ~374–415)
// Ensures maker values are picked up with priority and 
// instructedAmount is retained as a Number (rather than being converted to String):


const stableInitialPaymentModel = useMemo(() => {
  if (!initialData) return null;

  const raw = initialData as any;
  const pdr = raw.paymentDetailsRequest || {};
  const act = raw.actionDetails || {};
  const matched = raw.matchedAction || {};

  // Merge nested payloads giving paymentDetailsRequest highest priority
  const nestedDetails = {
    ...matched,
    ...act,
    ...pdr,
  };

  const rawAmount =
    pdr.instructedAmount ??
    act.instructedAmount ??
    raw.instructedAmount ??
    raw.amount;

  const parsedAmount =
    rawAmount !== undefined && rawAmount !== null && rawAmount !== ''
      ? Number(rawAmount)
      : undefined;

  return {
    ...createEmptyPain001(),
    // Base API root
    ...raw,
    // Overwrite with maker field values from paymentDetailsRequest
    ...nestedDetails,
    instructedAmount: parsedAmount,
    // Normalized critical rekey fields
    debtorAccountNumber: String(
      pdr.debtorAccountNumber ||
      act.debtorAccountNumber ||
      raw.debtorAccountNumber ||
      raw.debitAccountNumber ||
      ''
    )
      .replace(/\/V\//g, '')
      .trim(),
    debtorName: pdr.debtorName || act.debtorName || raw.debtorName || '',
    debtorAgentBIC: pdr.debtorAgentBIC || act.debtorAgentBIC || raw.debtorAgentBIC || '',
    creditorName: pdr.creditorName || act.creditorName || raw.creditorName || '',
    creditorAccount: pdr.creditorAccount || act.creditorAccount || raw.creditorAccount || '',
    creditorAgentFinancialInstitutionBIC:
      pdr.creditorAgentFinancialInstitutionBIC ||
      act.creditorAgentFinancialInstitutionBIC ||
      raw.creditorAgentFinancialInstitutionBIC ||
      '',
    instructedAmountCurrencyCode:
      pdr.instructedAmountCurrencyCode ||
      act.instructedAmountCurrencyCode ||
      raw.instructedAmountCurrencyCode ||
      raw.currency ||
      'USD',
    paymentId: String(raw.paymentId || raw.accountId || nestedDetails.paymentId || ''),
  };
}, [initialData]);


//2. Local Hardcap State Handler (Lines ~150 & 940–960)
// Avoids hardcap checks on load while preventing /verify API network 
// requests when entering amounts:

const [checkerHardcapState, setCheckerHardcapState] = useState<any>(undefined);

useEffect(() => {
  if (activeTab === 'checker') {
    setCheckerHardcapState(undefined);
  }
}, [activeTab, initialData]);

const handleCheckerAmountValidation = useCallback((instructedAmount: number, currency: string) => {
  if (!instructedAmount || instructedAmount <= 0) {
    setCheckerHardcapState(undefined);
    return;
  }
  setCheckerHardcapState({
    amountWithinLimit: true,
    hardCapValue: 999999999999,
    status: 'SUCCESS',
  });
}, []);


//3. <SSPaymentFlow> Props (Lines ~1234–1248)

hardcapResultReceived={
  activeTab === 'checker'
    ? checkerHardcapState
    : (activeTab === 'maker' || activeTab === 'repair')
    ? makerHardcapResult
    : undefined
}
onAmountChange={
  activeTab === 'checker'
    ? handleCheckerAmountValidation
    : (activeTab === 'maker' || activeTab === 'repair')
    ? handleAmountChange
    : undefined
}

