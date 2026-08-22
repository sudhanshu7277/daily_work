// 1. Update handlePreviewDocument (Lines 1349–1385 in InstructionDetailPage.tsx)

const handlePreviewDocument = async (doc: GabInstructionDocument, force: boolean = false) => {
    // If clicking the same doc in the tab grid, toggle off (only if not forced by modal)
    if (!force && selectedDocument?.documentId === doc.documentId && previewUrl) {
      setPreviewUrl(null);
      setSelectedDocument(null);
      return;
    }
  
    setSelectedDocument(doc);
    setPreviewUrl(null);
    setPreviewError('');
  
    if (typeof isPreviewable === 'function' && !isPreviewable(doc)) {
      setPreviewError('Preview is not available for this file type. Please download the document instead.');
      return;
    }
  
    setPreviewLoading(true);
  
    try {
      const PREVIEWABLE_TYPES = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/gif',
        'text/plain',
        'text/html'
      ];
  
      if (doc.contentType && !PREVIEWABLE_TYPES.includes(doc.contentType)) {
        // If content-type isn't standard MIME, let it proceed if filename ends in a previewable extension
        const fileNameLower = String(doc.fileName || '').toLowerCase();
        const hasPreviewableExt = /\.(pdf|png|jpe?g|gif|txt|html)$/i.test(fileNameLower);
        
        if (!hasPreviewableExt) {
          setPreviewError('Preview is not available for this file type.');
          setPreviewLoading(false);
          return;
        }
      }
  
      const instId = doc.instructionId || instructionId;
      const url = await getDocumentPreviewBlob(instId, doc.documentId);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };


  // 2. Update handleEditPaymentAccount (Around Line 1402 in InstructionDetailPage.tsx)
// Pass true for the force argument when calling handlePreviewDocument:


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
          // Pass force = true so toggle-off logic is bypassed
          await handlePreviewDocument(targetDoc, true);
        }
      } catch (err) {
        console.warn('Error fetching document preview on Edit click:', err);
      }
    },
    [documents, selectedDocument, handlePreviewDocument, instruction]
  );