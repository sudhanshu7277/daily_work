// 1. InstructionDetailPage.tsx
//Row Extraction & Trigger Handler
//Inside InstructionDetailPage(), map the row's fields directly into initialData:

const [showSplitMakerModal, setShowSplitMakerModal] = useState<boolean>(false);
const [selectedRowData, setSelectedRowData] = useState<InstructionAccountResponse | null>(null);

const handleEditPaymentAccount = async (row: InstructionAccountResponse) => {
  // 1. Store the selected grid row
  setSelectedRowData(row);

  // 2. Open the modal immediately
  setShowSplitMakerModal(true);

  // 3. Automatically trigger the document fetch API call on the same click
  const docsList = Array.isArray(documents) ? documents : [];
  const targetDoc =
    selectedDocument ||
    docsList.find((d) => d.documentType === 'PAYMENT_INSTRUCTION') ||
    (docsList.length > 0 ? docsList[0] : null);

  if (targetDoc && typeof handlePreviewDocument === 'function') {
    try {
      await handlePreviewDocument(targetDoc);
    } catch (err) {
      console.warn('Document preview fetch error:', err);
    }
  }
};


// Modal Declaration (Bottom of InstructionDetailPage.tsx)
//Pass the extracted properties into initialData:

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
          // Extracted from AG Grid row:
          debtorAccountNumber: String(selectedRowData.debitAccountNumber || ''),
          instructedAmountCurrencyCode: String(selectedRowData.currency || 'USD'),
          instructedAmount: typeof selectedRowData.amount === 'number' ? selectedRowData.amount : 0,

          // Instruction defaults:
          debtorName: (instruction as any)?.clientName || (instruction as any)?.dealName || '',
          painPaymentMethodType: selectedRowData.transactionType || 'CBT',
          requestedExecutionDate: (instruction as any)?.valueDate || new Date().toISOString().split('T')[0]
        }
      : null
  }
/>

// 2. PaymentParent.tsx
//Ensure initialData merges cleanly and that no fields are 
// hardcoded to disabled: true in the field configuration:


// Verify the field config leaves these fields active and editable:
const PARENT_FIELD_CONFIG: FormFieldConfig[] = [
    { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: false, options: ['CBT', 'BKT', 'DFT'], placeholder: '-- Select --' },
    { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true, type: 'date' },
    { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true, disabled: false }, // <-- Editable
    { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true, disabled: false },           // <-- Editable
    { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
    { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true, disabled: false },     // <-- Editable
    // ... rest of fields
  ];
  
  export const PaymentParent: FC<PaymentParentProps> = ({ initialData, hideTabs = false }) => {
    // Construct makerPaymentInput using incoming initialData
    const makerPaymentInput: PaymentComponentInput = useMemo(() => {
      const baseModel = createEmptyPain001();
      const mergedModel: Partial<Pain001Model> = initialData
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
  
    // When initialData is provided, trigger the hardcap check for the initial amount
    useEffect(() => {
      if (initialData?.instructedAmount && initialData?.instructedAmountCurrencyCode) {
        handleMakerAmountChange({
          instructedAmountCurrencyCode: initialData.instructedAmountCurrencyCode,
          instructedAmount: initialData.instructedAmount
        });
      }
    }, [initialData, handleMakerAmountChange]);
  
    // ... rest of PaymentParent component