// Step 1: Add this helper function inside your component (above return)
//Place this right above your return ( statement in SplitPaymentMakerModal.tsx:


const renderDocumentPreview = () => {
  if (previewLoading || isParsingDoc) {
    return (
      <div className="split-maker-loading">
        <div className="split-spinner" />
        <span>Loading document stream...</span>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="split-maker-loading">
        <div className="split-spinner" />
        <span>Loading document stream...</span>
      </div>
    );
  }

  if (isPdf) {
    return (
      <iframe
        src={`${previewUrl}#toolbar=1&navpanes=0&view=Fit`}
        className="split-doc-iframe"
        title="Document Preview"
      />
    );
  }

  if (isImage) {
    return (
      <div className="split-image-container">
        <img src={previewUrl} alt={fileName} className="split-doc-img" />
      </div>
    );
  }

  if (isText) {
    return (
      <div className="split-text-container">
        <pre><code>{textContent}</code></pre>
      </div>
    );
  }

  return (
    <iframe
      src={previewUrl}
      title={fileName || 'Document'}
      className="split-doc-iframe"
    />
  );
};


// Step 2: Replace lines 153 to 179 in JSX
//Replace the entire nested ternary block with the helper call:


<div className="split-maker-body">
  <div className="split-maker-panel left-panel">
    {renderDocumentPreview()}
  </div>

  {/* Right Panel: 50% PaymentParent */}
  <div className="split-maker-panel right-panel"></div>