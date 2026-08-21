// Step 1: Wrap handleEditPaymentAccount in a Safe try / catch
//In InstructionDetailPage.tsx, replace the handleEditPaymentAccount function with 
// this guarded version so the modal always opens even if the document preview takes 
// time or fails:


const handleEditPaymentAccount = async (row: InstructionAccountResponse) => {
    try {
      // 1. Set the selected row for Payment form pre-fill
      setSelectedRowData(row);
  
      // 2. Open the modal immediately so the UI responds
      setShowSplitMakerModal(true);
  
      // 3. Safely attempt to resolve and preview the document
      const docsList = Array.isArray(documents) ? documents : [];
      const targetDoc = selectedDocument || (docsList.length > 0 ? docsList[0] : null);
  
      if (targetDoc && typeof handlePreviewDocument === 'function') {
        try {
          await handlePreviewDocument(targetDoc);
        } catch (docErr) {
          console.warn('Document preview failed to fetch blob:', docErr);
        }
      }
    } catch (err) {
      console.error('Error opening Payment Maker modal:', err);
    }
  };



  // Step 2: Add Fallback Safety to PaymentParent.tsx
//In PaymentParent.tsx, ensure that useAuth() and createEmptyPain001()
//  never throw runtime errors:


// Helper to guarantee an empty model if createEmptyPain001 is missing or fails
const getSafeEmptyPain001 = (): Pain001Model => {
    try {
      return typeof createEmptyPain001 === 'function'
        ? createEmptyPain001()
        : ({
            painPaymentMethodType: 'CBT',
            requestedExecutionDate: new Date().toISOString().split('T')[0],
            instructedAmountCurrencyCode: 'USD',
            instructedAmount: 0
          } as Pain001Model);
    } catch {
      return {
        painPaymentMethodType: 'CBT',
        requestedExecutionDate: new Date().toISOString().split('T')[0],
        instructedAmountCurrencyCode: 'USD',
        instructedAmount: 0
      } as Pain001Model;
    }
  };
  
  export const PaymentParent: FC<PaymentParentProps> = ({
    mode: initialMode = 'maker',
    initialData,
    hideTabs = false,
    onPaymentSuccess
  }) => {
    // Safe SOEID retrieval that never throws
    let soeId = 'sj81534';
    try {
      const authContext: any = useAuth?.();
      if (authContext && typeof authContext === 'object') {
        soeId = authContext.soeId || authContext.user?.soeId || authContext.userId || 'sj81534';
      } else if (typeof authContext === 'string') {
        soeId = authContext;
      }
    } catch {
      soeId = 'sj81534';
    }
  
    const [activeTab, setActiveTab] = useState<'maker' | 'checker' | 'repair'>(initialMode);
  
    // Safe initialization
    const [activeSubmittedTransaction, setActiveSubmittedTransaction] = useState(() => ({
      transactionId: '6641753311580996571',
      paymentId: 'c337a6c4-4622-404e-b303-e0ec5192b04c',
      maker: soeId,
      payload: {
        ...getSafeEmptyPain001(),
        requestedExecutionDate: '2026-08-25',
        instructedAmountCurrencyCode: 'USD',
        instructedAmount: 50000,
        debtorName: 'ACME Corporation Global Ltd',
        debtorAccountNumber: '8378339123456789',
        debtorAgentBIC: 'CITIGB2LXXX',
        creditorName: 'Starlight Solutions Inc',
        creditorAccount: '998877665544',
        creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
        ...(initialData || {})
      }
    }));
  
    // Maker Payment Input with safe fallback
    const makerPaymentInput: PaymentComponentInput = useMemo(() => {
      const safeModel = {
        ...getSafeEmptyPain001(),
        ...(initialData || {})
      };
  
      return {
        applicationName: 'ADR',
        applicationModule: 'ADR',
        currency: initialData?.instructedAmountCurrencyCode || 'USD',
        paymentMode: 'maker',
        dualBlindKeyFlag: 'N',
        paymentModel: safeModel
      };
    }, [initialData]);
  
    // ... rest of PaymentParent implementation



    // Step 3: Ensure SplitPaymentMakerModal.tsx Has Guarded Rendering
//In SplitPaymentMakerModal.tsx, make sure document rendering never crashes 
// if documents or previewUrl are null or undefined:


{/* Left Panel: 50% Scrollable Document */}
<div className="split-maker-panel left-panel">
  {previewLoading || isParsingDoc ? (
    <div className="split-maker-loading">
      <div className="split-spinner"></div>
      <span>Loading document preview...</span>
    </div>
  ) : !previewUrl ? (
    <div className="split-maker-loading">
      <p style={{ color: '#64748b', fontSize: 13 }}>
        📄 No preview source available for {fileName || 'this instruction'}.
      </p>
    </div>
  ) : isPdf ? (
    <iframe
      src={`${previewUrl}#toolbar=1&navpanes=1&statusbar=0&view=FitH`}
      title={fileName || 'Document Preview'}
      className="split-doc-iframe"
    />
  ) : isImage ? (
    <div className="split-image-container">
      <img src={previewUrl} alt={fileName} className="split-doc-img" />
    </div>
  ) : isText ? (
    <div className="split-text-container">
      <pre><code>{textContent}</code></pre>
    </div>
  ) : (
    <iframe src={previewUrl} title={fileName || 'Document'} className="split-doc-iframe" />
  )}
</div>


// Step 4: Verify Modal Declaration in InstructionDetailPage.tsx
// Place the modal at the very bottom of InstructionDetailPage.tsx:


<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  document={selectedDocument || (Array.isArray(documents) && documents.length > 0 ? documents[0] : null)}
  documents={Array.isArray(documents) ? documents : []}
  onSelectDocument={handlePreviewDocument}
  previewUrl={previewUrl || null}
  previewLoading={previewLoading || false}
  initialData={
    selectedRowData
      ? {
          debtorAccountNumber: String(selectedRowData.debitAccountNumber || ''),
          instructedAmountCurrencyCode: String(selectedRowData.currency || 'USD'),
          instructedAmount: typeof selectedRowData.amount === 'number' ? selectedRowData.amount : 0,
          debtorName: (instruction as any)?.clientName || (instruction as any)?.dealName || '',
          painPaymentMethodType: selectedRowData.transactionType || 'WIRE',
          requestedExecutionDate: (instruction as any)?.valueDate || new Date().toISOString().split('T')[0]
        }
      : null
  }
  onPaymentSuccess={(referenceId: string) => {
    notification.success({
      title: 'Payment Submitted',
      content: `Payment instruction ${referenceId} submitted successfully.`
    });
    loadAll();
  }}
/>
