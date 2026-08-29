/* 1. Modal Overlay pinned directly under top nav */
.split-maker-modal-overlay {
  position: fixed !important;
  top: 56px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 56px) !important;
  background: transparent !important;
  backdrop-filter: none !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: center !important;
  z-index: 9000 !important;
  padding: 8px 16px 16px 16px !important;
  box-sizing: border-box !important;
}

/* 2. Modal Window */
.split-maker-modal-window {
  display: flex !important;
  flex-direction: column !important;
  background: #ffffff !important;
  border-radius: 4px !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.22) !important;
  width: 98vw !important;
  max-width: 1820px !important;
  height: calc(100vh - 72px) !important;
  max-height: calc(100vh - 72px) !important;
  min-height: 480px !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

/* 3. Header */
.split-maker-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 8px 18px !important;
  background-color: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  flex-shrink: 0 !important;
  min-height: 44px !important;
  box-sizing: border-box !important;
}

.split-maker-title {
  margin: 0 !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
}

.split-maker-btn-close {
  background: transparent !important;
  border: none !important;
  color: #64748b !important;
  font-size: 22px !important;
  cursor: pointer !important;
  padding: 2px 6px !important;
  line-height: 1 !important;
  border-radius: 4px !important;
}

.split-maker-btn-close:hover {
  color: #0f172a !important;
  background-color: #f1f5f9 !important;
}

/* 4. Asymmetric Grid: 54% Left (Document) : 46% Right (Form) */
.split-maker-body {
  display: grid !important;
  grid-template-columns: minmax(560px, 1.15fr) minmax(0, 1fr) !important;
  gap: 12px !important;
  padding: 8px 12px !important;
  flex: 1 1 0 !important;
  min-height: 0 !important;
  height: calc(100% - 44px) !important;
  overflow: hidden !important;
  background: #f8fafc !important;
  box-sizing: border-box !important;
}

/* Left Panel: Zero-padding for edge-to-edge PDF frame */
.split-maker-panel.left-panel {
  display: flex !important;
  flex-direction: column !important;
  background: #525659 !important; /* Matches native PDF viewer background */
  border: 1px solid #cbd5e1 !important;
  border-radius: 4px !important;
  height: 100% !important;
  min-height: 0 !important;
  min-width: 0 !important;
  overflow: hidden !important;
  padding: 0 !important; /* Zero padding prevents squishing toolbar */
  box-sizing: border-box !important;
}

.split-doc-iframe {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  display: block !important;
  box-sizing: border-box !important;
}

/* Right Panel: Form Pane with Independent Scroll */
.split-maker-panel.right-panel {
  display: flex !important;
  flex-direction: column !important;
  background: #ffffff !important;
  border: 1px solid #d9e2ec !important;
  border-radius: 4px !important;
  height: 100% !important;
  min-height: 0 !important;
  min-width: 0 !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

.split-form-scroll-pane {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  height: 100% !important;
  flex: 1 1 auto !important;
  padding: 8px 14px 20px 14px !important;
  box-sizing: border-box !important;
}





// Minor Update in SplitPaymentMakerModal.tsx
//In SplitPaymentMakerModal.tsx, update the iframe src query parameters to prevent 
// 
// the browser's PDF engine from cutting off controls:


<iframe
  src={`${previewUrl}#toolbar=1&navpanes=0&view=Fit`}
  className="split-doc-iframe"
  title="Document Preview"
/>

