// 1. In SplitPaymentMakerModal.tsx
//Update the loading condition in the JSX (around line 125):


{/* Left Panel: 50% Document Viewer */}
<div className="split-maker-panel left-panel">
  {previewLoading && !previewUrl ? (
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
  ) : isText ? (
    <div className="split-text-container">
      <pre><code>{textContent}</code></pre>
    </div>
  ) : (
    <iframe src={previewUrl} title={fileName || 'Document'} className="split-doc-iframe" />
  )}
</div>


// 2. Verify handlePreviewDocument in InstructionDetailPage.tsx
//Ensure the finally block is present to guarantee previewLoading resets to false:


const handlePreviewDocument = useCallback(async (doc: GabInstructionDocument) => {
    if (!doc?.documentId) return;
    try {
      setPreviewLoading(true);
      setSelectedDocument(doc);
  
      const instId = doc.instructionId || instruction?.instructionId;
      const endpoint = `/api/instructions/${instId}/documents/${doc.documentId}/preview`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error('Failed to preview document:', err);
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false); // <-- Guarantees loading spinner clears
    }
  }, [instruction]);