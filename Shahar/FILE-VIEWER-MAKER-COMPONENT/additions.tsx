// 1. Row Extraction & Modal Launch in InstructionDetailPage.tsx
//When the user clicks Edit on an AG Grid row in InstructionDetailPage.tsx:

//The row properties (debitAccountNumber, currency, amount) are picked from row.

//The document preview fetch API (handlePreviewDocument) is triggered concurrently.

//The modal is opened with initialData mapped to the ISO 20022 Pain.001 model keys.


// Inside InstructionDetailPage.tsx
const [showSplitMakerModal, setShowSplitMakerModal] = useState<boolean>(false);
const [selectedRowData, setSelectedRowData] = useState<InstructionAccountResponse | null>(null);

const handleEditPaymentAccount = async (row: InstructionAccountResponse) => {
  // 1. Capture the selected row
  setSelectedRowData(row);

  // 2. Open the split modal immediately
  setShowSplitMakerModal(true);

  // 3. Concurrently fetch the document binary for the left pane
  try {
    const docsList = Array.isArray(documents) ? documents : [];
    const targetDoc =
      selectedDocument ||
      docsList.find((d) => d.documentType === 'PAYMENT_INSTRUCTION') ||
      (docsList.length > 0 ? docsList[0] : null);

    if (targetDoc && typeof handlePreviewDocument === 'function') {
      await handlePreviewDocument(targetDoc);
    }
  } catch (err) {
    console.warn('Document preview fetch failed:', err);
  }
};


// 2. Passing Extracted Row Values into the Modal JSX
//At the bottom of InstructionDetailPage.tsx, pass the mapped initialData object:


<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  document={selectedDocument || (Array.isArray(documents) && documents.length > 0 ? documents[0] : null)}
  previewUrl={previewUrl || null}
  previewLoading={previewLoading || false}
  initialData={
    selectedRowData
      ? {
          // Values extracted directly from the clicked AG Grid row:
          debtorAccountNumber: String(selectedRowData.debitAccountNumber || ''),
          instructedAmountCurrencyCode: String(selectedRowData.currency || 'USD'),
          instructedAmount: typeof selectedRowData.amount === 'number' ? selectedRowData.amount : 0
        }
      : null
  }
/>


// 3. State Hydration & Field Modifiability in PaymentParent.tsx
//Inside PaymentParent.tsx, ensure initialData is merged into 
// makerPaymentInput and that activeSubmittedTransaction is refreshed whenever a new row is opened.

//Because PARENT_FIELD_CONFIG contains only standard descriptors 
// (fieldName, label, hidden, required), PaymentChild initializes 
// standard <input> elements without any disabled attributes:


// Inside PaymentParent.tsx

// 1. Keep field definitions standard (no disabled flags)
const PARENT_FIELD_CONFIG: FormFieldConfig[] = [
    { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: false, options: ['CBT', 'BKT', 'DFT'], placeholder: '-- Select --' },
    { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true, type: 'date' },
    { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true },
    { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true },
    { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
    { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true },
    { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false, required: true },
    // ... remaining standard fields
  ];
  
  export const PaymentParent: FC<PaymentParentProps> = ({ initialData, hideTabs = false }) => {
    // ... auth context resolution ...
  
    // 2. Build the Maker Payment Component Input from initialData
    const makerPaymentInput: PaymentComponentInput = useMemo(() => {
      const baseModel = createEmptyPain001();
      const mergedModel: Pain001Model = initialData
        ? { ...baseModel, ...initialData }
        : baseModel;
  
      return {
        applicationName: 'ADR',
        applicationModule: 'ADR',
        currency: initialData?.instructedAmountCurrencyCode || 'USD',
        paymentMode: 'maker',
        dualBlindKeyFlag: 'N',
        paymentModel: mergedModel
      };
    }, [initialData]);
  
    // 3. Pre-run hardcap verification for the passed amount
    useEffect(() => {
      if (initialData?.instructedAmount && initialData?.instructedAmountCurrencyCode) {
        handleMakerAmountChange({
          instructedAmountCurrencyCode: initialData.instructedAmountCurrencyCode,
          instructedAmount: initialData.instructedAmount
        });
      }
    }, [initialData, handleMakerAmountChange]);
  
    // ... rest of PaymentParent (renders PaymentChild with isMakerMode={true})



    // In PaymentParent.tsx, re-order the declarations 
    // so handleMakerAmountChange comes first,
    //  coerce instructedAmount to Number(...), and place the useEffect after:


    // 1. Declare the callback FIRST
  const handleMakerAmountChange = useCallback(
    async ({
      instructedAmountCurrencyCode,
      instructedAmount
    }: {
      instructedAmountCurrencyCode: string;
      instructedAmount: number;
    }) => {
      if (!instructedAmount || instructedAmount <= 0) {
        setMakerHardcapResult(null);
        return;
      }
      try {
        const res = await hardcapService.verifyHardCap('/shared-services/api/payment', {
          currency: instructedAmountCurrencyCode || 'USD',
          paymentAmount: instructedAmount,
          applicationName: 'ADR',
          applicationModule: 'ADR'
        });
        setMakerHardcapResult(res);
      } catch {
        setMakerHardcapResult({ amountWithinLimit: true, hardCapValue: 999999999 });
      }
    },
    []
  );

  // 2. Declare useEffect AFTER handleMakerAmountChange with Number() conversion
  useEffect(() => {
    if (initialData?.instructedAmount && initialData?.instructedAmountCurrencyCode) {
      const numAmount = Number(initialData.instructedAmount);
      if (!isNaN(numAmount) && numAmount > 0) {
        handleMakerAmountChange({
          instructedAmountCurrencyCode: initialData.instructedAmountCurrencyCode,
          instructedAmount: numAmount
        });
      }
    }
  }, [initialData, handleMakerAmountChange]);