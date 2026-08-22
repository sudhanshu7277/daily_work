// Here are the complete, final CSS files maintaining the clean 50% : 50% split with polished enterprise form styles.

//1. src/pages/instructions/SplitPaymentMakerModal.css

/* ==========================================================================
   Split Payment Maker Modal (50% : 50% Viewport)
   ========================================================================== */

   .split-maker-modal-overlay {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(4px);
    z-index: 99999;
    display: flex;
    overflow: hidden;
  }
  
  .split-maker-modal-window {
    width: 100vw;
    height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  /* ==========================================================================
     Top Header Bar
     ========================================================================== */
  
  .split-maker-header {
    height: 50px;
    min-height: 50px;
    background-color: #002d72;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }
  
  .split-maker-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .split-maker-title {
    font-size: 15px;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
    letter-spacing: 0.2px;
  }
  
  .split-maker-badge {
    font-size: 12px;
    background-color: #004b99;
    padding: 4px 10px;
    border-radius: 4px;
    max-width: 320px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .split-doc-dropdown {
    background-color: #004b99;
    color: #ffffff;
    border: 1px solid #0284c7;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    max-width: 350px;
    cursor: pointer;
    outline: none;
  }
  
  .split-doc-dropdown:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
  }
  
  .split-maker-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .split-maker-btn-close {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    line-height: 1;
    transition: background-color 0.15s ease;
  }
  
  .split-maker-btn-close:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  /* ==========================================================================
     50% / 50% Body Layout
     ========================================================================== */
  
  .split-maker-body {
    flex: 1;
    display: flex;
    width: 100vw;
    height: calc(100vh - 50px);
    overflow: hidden;
  }
  
  /* Left Panel: Document Viewer (50%) */
  .split-maker-panel.left-panel {
    flex: 0 0 50%;
    width: 50%;
    height: 100%;
    background-color: #2b2b2b;
    border-right: 3px solid #cbd5e1;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .split-doc-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background-color: #2b2b2b;
  }
  
  /* Right Panel: Payment Form (50%) */
  .split-maker-panel.right-panel {
    flex: 0 0 50%;
    width: 50%;
    height: 100%;
    background-color: #f8fafc;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  
  .split-form-scroll-pane {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
  }
  
  /* ==========================================================================
     Non-PDF File Viewers (Images, Plain Text, Excel)
     ========================================================================== */
  
  /* Images */
  .split-image-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1e293b;
    box-sizing: border-box;
  }
  
  .split-doc-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  
  /* Plain Text & Logs */
  .split-text-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 20px;
    background-color: #ffffff;
    font-family: Consolas, "Courier New", monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #1e293b;
    box-sizing: border-box;
  }
  
  .split-text-container pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  /* Excel Sheet Viewer */
  .split-excel-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  
  .split-excel-tabs {
    display: flex;
    background-color: #e2e8f0;
    border-bottom: 1px solid #cbd5e1;
    overflow-x: auto;
  }
  
  .split-excel-tab-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    color: #475569;
    white-space: nowrap;
  }
  
  .split-excel-tab-btn.active {
    background-color: #ffffff;
    color: #002d72;
    border-bottom: 2px solid #002d72;
  }
  
  .split-excel-table-scroll {
    flex: 1;
    overflow: auto;
    background-color: #ffffff;
  }
  
  .split-excel-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    font-family: monospace;
  }
  
  .split-excel-table td {
    border: 1px solid #e2e8f0;
    padding: 5px 8px;
    white-space: nowrap;
    color: #1e293b;
  }
  
  .split-excel-row-num {
    background-color: #f8fafc;
    font-weight: bold;
    text-align: center;
    color: #64748b;
    width: 36px;
    border-right: 2px solid #cbd5e1 !important;
    user-select: none;
  }
  
  /* ==========================================================================
     Loading & Fallback States
     ========================================================================== */
  
  .split-maker-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94a3b8;
    gap: 12px;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  }
  
  .split-spinner {
    width: 34px;
    height: 34px;
    border: 3px solid #475569;
    border-top-color: #38bdf8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* ==========================================================================
     Custom Scrollbar
     ========================================================================== */
  
  .split-form-scroll-pane::-webkit-scrollbar,
  .split-excel-table-scroll::-webkit-scrollbar,
  .split-text-container::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .split-form-scroll-pane::-webkit-scrollbar-track,
  .split-excel-table-scroll::-webkit-scrollbar-track,
  .split-text-container::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  .split-form-scroll-pane::-webkit-scrollbar-thumb,
  .split-excel-table-scroll::-webkit-scrollbar-thumb,
  .split-text-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .split-form-scroll-pane::-webkit-scrollbar-thumb:hover,
  .split-excel-table-scroll::-webkit-scrollbar-thumb:hover,
  .split-text-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }








  // 2. src/pages/ss-payment/payment-flow.css


  //Here is the complete, unabridged payment-flow.css including 
  // all styling for Maker, Checker (dual-blind keying & error 
  // flagging), Repair (amber/green diff states), 
  // Decision Bars, and Global Submission Modals:


  /* ==========================================================================
   Complete Payment Flow Styles (Maker, Checker, Repair & Split Modal)
   ========================================================================== */

.sample-container {
    padding: 16px 20px 32px 20px;
    background-color: #f8fafc;
    min-height: 100%;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  
  .parent-section-heading {
    font-size: 15px;
    font-weight: 700;
    color: #0f2d59;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1.5px solid #e2e8f0;
  }
  
  /* Outer Accordion Wrapper */
  .payment-component-wrapper {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  
  /* ==========================================================================
     Accordion & Section Card Styles
     ========================================================================== */
  
  .payment-component-wrapper details,
  .payment-section-card {
    border: 1px solid #d9e2ec;
    border-radius: 6px;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    margin-bottom: 12px;
  }
  
  .payment-component-wrapper summary,
  .payment-section-header {
    background-color: #edf2f7;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    cursor: pointer;
    border-bottom: 1px solid #e2e8f0;
    user-select: none;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .payment-component-wrapper summary:hover {
    background-color: #e2e8f0;
  }
  
  /* Section Body & Dynamic Grid */
  .payment-section-body,
  .payment-component-wrapper details > div {
    padding: 14px 16px;
    background-color: #ffffff;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 12px 14px;
    align-items: flex-start;
  }
  
  /* Form Groups & Labels */
  .form-group,
  .form-field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    box-sizing: border-box;
  }
  
  .form-group label,
  .form-field-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #475569;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .form-field-label .required-star {
    color: #dc2626;
    font-weight: bold;
  }
  
  /* ==========================================================================
     Universal Form Controls (Inputs, Selects, Textareas)
     ========================================================================== */
  
  .payment-component-wrapper input[type="text"],
  .payment-component-wrapper input[type="number"],
  .payment-component-wrapper input[type="date"],
  .payment-component-wrapper select,
  .payment-component-wrapper textarea {
    width: 100%;
    height: 32px;
    padding: 5px 8px;
    font-size: 12px;
    color: #1e293b;
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  
  .payment-component-wrapper textarea {
    height: auto;
    min-height: 56px;
    resize: vertical;
  }
  
  .payment-component-wrapper input:focus,
  .payment-component-wrapper select:focus,
  .payment-component-wrapper textarea:focus {
    border-color: #00509d;
    box-shadow: 0 0 0 2px rgba(0, 80, 157, 0.15);
  }
  
  .payment-component-wrapper input:disabled,
  .payment-component-wrapper select:disabled {
    background-color: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
  
  /* Hardcap & Validation Pass Subtext */
  .hardcap-status-text,
  .payment-component-wrapper .status-pass {
    font-size: 11px;
    color: #059669;
    font-weight: 600;
    margin-top: 3px;
  }
  
  /* ==========================================================================
     Checker Mode & Dual-Blind Verification Styles
     ========================================================================== */
  
  .parent-section-checker-info {
    background: #f0f4f8;
    border: 1px solid #d9e2ec;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }
  
  .parent-section-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    color: #334e68;
  }
  
  /* Checker Re-Keying & Mismatch Highlights */
  .input-dual-blind-active {
    border-color: #0284c7 !important;
    background-color: #f0f9ff !important;
  }
  
  .input-mismatch,
  .field-flagged-rejected {
    border-color: #dc2626 !important;
    background-color: #fef2f2 !important;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
  }
  
  /* ==========================================================================
     Repair Mode Diff Highlights
     ========================================================================== */
  
  /* Yellow/Amber: Flagged by Checker for review */
  .repair-field-review,
  .field-repair-review {
    border-color: #f59e0b !important;
    background-color: #fffbeb !important;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2) !important;
  }
  
  /* Green: Newly modified by Repair user */
  .repair-field-modified,
  .field-repair-modified {
    border-color: #10b981 !important;
    background-color: #ecfdf5 !important;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
  }
  
  /* ==========================================================================
     Action Bars & Buttons (Maker, Checker & Repair)
     ========================================================================== */
  
  .action-bar,
  .action-container {
    margin-top: 20px;
    padding: 12px 16px;
    background-color: #ffffff;
    border: 1px solid #d9e2ec;
    border-radius: 6px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .action-container {
    flex-direction: column;
    background-color: #f8fafc;
  }
  
  .lmn-btn {
    height: 34px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }
  
  .lmn-btn-primary {
    background-color: #002d72;
    color: #ffffff;
    border-color: #002d72;
  }
  
  .lmn-btn-primary:hover:not(:disabled) {
    background-color: #004b99;
  }
  
  .btn-reject {
    background-color: #dc2626;
    color: #ffffff;
    border: 1px solid #b91c1c;
    height: 34px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  
  .btn-reject:hover:not(:disabled) {
    background-color: #b91c1c;
  }
  
  .lmn-btn-unclickable,
  .lmn-btn:disabled,
  .btn-reject:disabled {
    background-color: #94a3b8 !important;
    border-color: #94a3b8 !important;
    color: #ffffff !important;
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  /* ==========================================================================
     Global Submission Status Modal
     ========================================================================== */
  
  .modal {
    position: fixed;
    inset: 0;
    z-index: 100000;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-backdrop {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-container {
    background: #ffffff;
    width: 90%;
    max-width: 480px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }
  
  .modal-header {
    background-color: #002d72;
    color: #ffffff;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
  }
  
  .close-btn {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
  }
  
  .modal-body {
    padding: 18px;
  }
  
  .details-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 13px;
    color: #334e68;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 6px;
  }
  
  .detail-row .label {
    font-weight: 600;
    color: #64748b;
  }
  
  .detail-row .value {
    color: #1e293b;
  }
  
  .modal-footer {
    padding: 12px 18px;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
  }







  //Step 1: Hide the PDF Thumbnail Sidebar and Maximize Document View
//In SplitPaymentMakerModal.tsx, update the PDF iframe src to collapse 
// the navigation pane (navpanes=0) and auto-fit the page width (view=FitH):


{/* In SplitPaymentMakerModal.tsx */}
{isPdf ? (
    <iframe
      src={`${previewUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
      title={fileName || 'Document Preview'}
      className="split-doc-iframe"
    />
  ) : (
    // ... other renderers
  )}