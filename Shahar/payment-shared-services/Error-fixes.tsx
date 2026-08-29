// src/pages/instructions/SplitPaymentMakerModal/SplitPaymentMakerModal.css
//Replace your SplitPaymentMakerModal.css with this targeted version:

/* ==========================================================================
   SplitPaymentMakerModal - Fixed Side-by-Side Dual Pane (Never Collapses)
   ========================================================================== */

/* 1. Backdrop strictly pinned below top navigation */
.split-maker-modal-overlay {
  position: fixed !important;
  top: 56px !important; /* Leaves Global Account Bank header visible */
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 56px) !important;
  background-color: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(2px);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9000 !important;
  padding: 12px 20px 20px 20px !important;
  box-sizing: border-box !important;
}

/* 2. Floating Window */
.split-maker-modal-window {
  display: flex !important;
  flex-direction: column !important;
  background: #ffffff !important;
  border-radius: 6px !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.28) !important;
  width: 96vw !important;
  max-width: 1720px !important;
  height: calc(100vh - 84px) !important;
  max-height: 940px !important;
  min-height: 480px !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

/* 3. Header Bar */
.split-maker-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 20px !important;
  background-color: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  flex-shrink: 0 !important;
  min-height: 48px !important;
  box-sizing: border-box !important;
}

.split-maker-meta {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex-wrap: nowrap !important;
}

.split-maker-title {
  margin: 0 !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
  white-space: nowrap !important;
}

.split-doc-dropdown {
  height: 28px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #002d72 !important;
  background-color: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 4px !important;
  padding: 0 8px !important;
  outline: none !important;
  cursor: pointer !important;
}

.split-maker-badge {
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 3px 8px !important;
  border-radius: 3px !important;
  color: #002d72 !important;
  background-color: #e0f2fe !important;
  white-space: nowrap !important;
}

.split-maker-controls {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.split-maker-btn-close {
  background: transparent !important;
  border: none !important;
  color: #64748b !important;
  font-size: 22px !important;
  font-weight: 400 !important;
  cursor: pointer !important;
  padding: 2px 6px !important;
  line-height: 1 !important;
  border-radius: 4px !important;
  transition: color 0.15s, background-color 0.15s !important;
}

.split-maker-btn-close:hover {
  color: #0f172a !important;
  background-color: #f1f5f9 !important;
}

/* 4. Strict 50/50 Body Grid (Locked Side-by-Side) */
.split-maker-body {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
  gap: 16px !important;
  padding: 12px 16px !important;
  flex: 1 1 0 !important;
  min-height: 0 !important;
  overflow: hidden !important;
  background: #f8fafc !important;
  box-sizing: border-box !important;
}

/* Left Panel: Document Viewer */
.split-maker-panel.left-panel {
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

.split-maker-loading {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
  color: #64748b !important;
  font-size: 13px !important;
}

.split-spinner {
  width: 28px !important;
  height: 28px !important;
  border: 3px solid #e2e8f0 !important;
  border-top-color: #002d72 !important;
  border-radius: 50% !important;
  animation: split-spin 0.8s linear infinite !important;
  margin-bottom: 8px !important;
}

@keyframes split-spin {
  to { transform: rotate(360deg); }
}

.split-doc-iframe {
  width: 100% !important;
  height: 100% !important;
  flex: 1 1 auto !important;
  border: none !important;
}

.split-image-container {
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
  width: 100% !important;
  height: 100% !important;
  overflow: auto !important;
}

.split-doc-img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 4px !important;
}

.split-text-container {
  background: #0f172a !important;
  color: #f8fafc !important;
  padding: 12px !important;
  border-radius: 4px !important;
  font-family: monospace !important;
  font-size: 11px !important;
  height: 100% !important;
  overflow: auto !important;
  white-space: pre-wrap !important;
}

/* Excel Sheet Tab & Table Styling */
.excel-tabs-bar {
  display: flex !important;
  gap: 4px !important;
  border-bottom: 1px solid #cbd5e1 !important;
  margin-bottom: 8px !important;
  overflow-x: auto !important;
  flex-shrink: 0 !important;
}

.excel-tab-btn {
  padding: 4px 10px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #475569 !important;
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  border-bottom: none !important;
  border-radius: 4px 4px 0 0 !important;
  cursor: pointer !important;
}

.excel-tab-btn.active {
  background: #ffffff !important;
  color: #002d72 !important;
  border-color: #002d72 !important;
  border-top: 2px solid #002d72 !important;
}

.excel-table-wrapper {
  overflow: auto !important;
  width: 100% !important;
  height: 100% !important;
  flex: 1 1 auto !important;
}

.split-doc-table {
  width: 100% !important;
  border-collapse: collapse !important;
  font-size: 11px !important;
  color: #1e293b !important;
}

.split-doc-table th {
  background-color: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  padding: 6px 8px !important;
  text-align: left !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 1 !important;
}

.split-doc-table td {
  border: 1px solid #e2e8f0 !important;
  padding: 5px 8px !important;
  white-space: nowrap !important;
}

.split-doc-table tr.row-selected td {
  background-color: #ecfdf5 !important;
  color: #065f46 !important;
  font-weight: 600 !important;
}

.split-doc-table tr:hover td {
  background-color: #f8fafc !important;
}

/* Right Panel: Form Pane with Dedicated Independent Scroll */
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
  padding: 8px 14px 16px 14px !important;
  box-sizing: border-box !important;
}

/* Ensure child elements inside SSPaymentFlow never stretch outside the panel */
.split-form-scroll-pane .sample-container,
.split-form-scroll-pane .ss-payment-flow {
  padding: 0 !important;
  width: 100% !important;
  min-width: 0 !important;
}

/* Modal Bottom Action Footer */
.split-maker-footer {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 10px !important;
  padding: 10px 20px !important;
  background: #ffffff !important;
  border-top: 1px solid #e2e8f0 !important;
  flex-shrink: 0 !important;
}

/* Removed media query that collapsed grid to single-column */