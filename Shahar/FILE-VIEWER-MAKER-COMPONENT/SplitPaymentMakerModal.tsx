// Step 1: Restore Original handlePreviewDocument in InstructionDetailPage.tsx
//Navigate to lines 1200–1250 of InstructionDetailPage.tsx 
// and ensure handlePreviewDocument uses your application's actual document service:

const handlePreviewDocument = async (doc: GabInstructionDocument) => {
    if (!doc?.documentId) return;
    try {
      setPreviewLoading(true);
      setSelectedDocument(doc);
  
      // Call your existing service method that was working in Maker mode
      const instId = doc.instructionId || instruction?.instructionId;
      const blob = await getDocumentPreviewBlob(instId, doc.documentId);
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error('Error previewing document:', err);
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  };



  // Step 2: Clean handleEditPaymentAccount in InstructionDetailPage.tsx
//Inside handleEditPaymentAccount, simply pass the d
// ocument to the restored handlePreviewDocument:


const handleEditPaymentAccount = useCallback(
    async (row: InstructionAccountResponse) => {
      setSelectedRowData(row);
      setShowSplitMakerModal(true);
  
      try {
        const docsList: GabInstructionDocument[] =
          Array.isArray(documents) && documents.length > 0
            ? documents
            : (instruction as any)?.documents || [];
  
        const targetDoc =
          selectedDocument ||
          docsList.find((d) => d.documentType === 'PAYMENT_INSTRUCTION') ||
          (docsList.length > 0 ? docsList[0] : null);
  
        if (targetDoc && typeof handlePreviewDocument === 'function') {
          await handlePreviewDocument(targetDoc);
        }
      } catch (err) {
        console.warn('Error fetching document preview on Edit click:', err);
      }
    },
    [documents, selectedDocument, handlePreviewDocument, instruction]
  );


  // Step 3: Ensure SplitPaymentMakerModal.tsx Renders Immediately
//In SplitPaymentMakerModal.tsx, ensure the Left Panel condition 
// displays the iframe whenever previewUrl is available:


{/* Left Panel: 50% Document Viewer */}
<div className="split-maker-panel left-panel">
  {previewLoading ? (
    <div className="split-maker-loading">
      <div className="split-spinner"></div>
      <span>Loading document stream...</span>
    </div>
  ) : !previewUrl ? (
    <div className="split-maker-loading">
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        📄 No preview stream available for {fileName || 'this instruction'}.
      </p>
    </div>
  ) : isPdf ? (
    <iframe
      src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
      title={fileName || 'Document Preview'}
      className="split-doc-iframe"
    />
  ) : isImage ? (
    <div className="split-image-container">
      <img src={previewUrl} alt={fileName} className="split-doc-img" />
    </div>
  ) : (
    <iframe src={previewUrl} title={fileName || 'Document'} className="split-doc-iframe" />
  )}
</div>