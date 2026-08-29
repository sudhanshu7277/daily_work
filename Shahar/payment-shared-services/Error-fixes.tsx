.split-maker-loading {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 280px !important;
  color: #64748b !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  gap: 8px !important;
  background-color: #ffffff !important;
  box-sizing: border-box !important;
}

.split-spinner {
  width: 32px !important;
  height: 32px !important;
  border: 3px solid #e2e8f0 !important;
  border-top-color: #002d72 !important;
  border-radius: 50% !important;
  animation: split-spin 0.8s linear infinite !important;
  box-sizing: border-box !important;
}

@keyframes split-spin {
  to {
    transform: rotate(360deg);
  }
}





{previewLoading || isParsingDoc ? (
  <div className="split-maker-loading">
    <div className="split-spinner" />
    <span>Loading document stream...</span>
  </div>
) : (
  /* document viewer iframe / excel / image */
)}