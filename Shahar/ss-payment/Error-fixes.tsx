// payment-flow.css


/* ==========================================================================
   GLOBAL ACCOUNT BANK 2.0 (GAB) ENTERPRISE DESIGN SYSTEM
   ========================================================================== */

/* --------------------------------------------------------------------------
   Container & Layout
   -------------------------------------------------------------------------- */
   .sample-container,
   .ss-payment-flow {
     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
     color: #102a43;
     background-color: #f7f9fb;
     padding: 16px 24px 40px 24px;
   }
   
   .parent-section-heading {
     font-size: 16px;
     font-weight: 600;
     color: #0b2238;
     margin-bottom: 16px;
     letter-spacing: -0.01em;
   }
   
   .parent-section-checker-info {
     background-color: #f0f4f8;
     border: 1px solid #d9e2ec;
     border-radius: 4px;
     padding: 12px 16px;
     margin-bottom: 16px;
   }
   
   .parent-section-meta {
     display: flex;
     flex-wrap: wrap;
     gap: 20px;
     font-size: 12px;
     color: #334e68;
   }
   
   .parent-section-meta strong {
     color: #102a43;
   }
   
   /* --------------------------------------------------------------------------
      Section Accordions & Cards (GAB Look & Feel)
      -------------------------------------------------------------------------- */
   .section-main {
     background: #ffffff;
     border: 1px solid #d9e2ec;
     border-radius: 4px;
     margin-bottom: 16px;
     box-shadow: 0 1px 3px rgba(16, 42, 67, 0.04);
   }
   
   .section-main.noBorders {
     border: 1px solid #d9e2ec;
   }
   
   .section-main-header {
     display: flex;
     align-items: center;
     justify-content: space-between;
     padding: 10px 16px;
     background-color: #e9eff6;
     border-bottom: 1px solid #d9e2ec;
     cursor: pointer;
     user-select: none;
     font-size: 14px;
     font-weight: 600;
     color: #102a43;
   }
   
   .section-main-header:hover {
     background-color: #e1eaf3;
   }
   
   .section-main-body {
     padding: 16px;
   }
   
   .section-main-body.collapsed,
   .section-body.collapsed {
     display: none;
   }
   
   .section {
     background: #ffffff;
     border: 1px solid #e2e8f0;
     border-radius: 4px;
     margin-bottom: 14px;
   }
   
   .section-header {
     display: flex;
     align-items: center;
     justify-content: space-between;
     padding: 8px 14px;
     background-color: #f0f4f8;
     border-bottom: 1px solid #e2e8f0;
     cursor: pointer;
     user-select: none;
     font-size: 13px;
     font-weight: 600;
     color: #243b53;
   }
   
   .section-header:hover {
     background-color: #e4ecf4;
   }
   
   .section-body {
     padding: 14px;
   }
   
   .chev {
     font-size: 12px;
     color: #627d98;
     font-weight: bold;
   }
   
   /* --------------------------------------------------------------------------
      Grid Rows & Form Layouts
      -------------------------------------------------------------------------- */
   .form-row-2 {
     display: grid;
     grid-template-columns: repeat(2, 1fr);
     gap: 16px;
     margin-bottom: 12px;
   }
   
   .form-row-3 {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
     gap: 16px;
     margin-bottom: 12px;
   }
   
   @media (max-width: 900px) {
     .form-row-2,
     .form-row-3 {
       grid-template-columns: 1fr;
     }
   }
   
   /* --------------------------------------------------------------------------
      GAB Field Styling (Inputs, Selects, Labels)
      -------------------------------------------------------------------------- */
   .form-field {
     display: flex;
     flex-direction: column;
     margin-bottom: 8px;
   }
   
   .field-label {
     font-size: 12px;
     font-weight: 500;
     color: #334e68;
     margin-bottom: 4px;
   }
   
   .mandatory-indicator {
     color: #d64545;
     font-weight: 700;
     margin-left: 2px;
   }
   
   .form-field input[type="text"],
   .form-field input[type="number"],
   .form-field input[type="date"],
   .form-field select,
   .form-field textarea {
     height: 34px;
     padding: 6px 10px;
     font-size: 13px;
     color: #102a43;
     background-color: #ffffff;
     border: 1px solid #9fb3c8;
     border-radius: 4px;
     outline: none;
     transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
     box-sizing: border-box;
   }
   
   .form-field textarea {
     height: auto;
     min-height: 68px;
     resize: vertical;
   }
   
   .form-field input::placeholder,
   .form-field textarea::placeholder {
     color: #829ab1;
     font-size: 12px;
   }
   
   .form-field input:focus,
   .form-field select:focus,
   .form-field textarea:focus {
     border-color: #00509d;
     box-shadow: 0 0 0 2px rgba(0, 80, 157, 0.15);
   }
   
   /* Disabled & Readonly State (matching Deal/Client disabled look) */
   .form-field input:disabled,
   .form-field input[readonly],
   .form-field select:disabled,
   .form-field textarea[readonly] {
     background-color: #f0f4f8;
     border-color: #cbd7e2;
     color: #486581;
     cursor: default;
   }
   
   /* --------------------------------------------------------------------------
      Validation States & Flags
      -------------------------------------------------------------------------- */
   .form-field.field-invalid input,
   .form-field.field-invalid select,
   .form-field.field-invalid textarea,
   .form-field input.input-error,
   .form-field select.input-error {
     border-color: #d64545 !important;
     background-color: #fff8f8;
   }
   
   .field-error,
   .dual-blind-error {
     font-size: 11px;
     color: #d64545;
     margin-top: 3px;
     font-weight: 500;
   }
   
   .hint {
     font-size: 11px;
     color: #627d98;
     margin-top: 3px;
   }
   
   .success-message {
     font-size: 11px;
     color: #0f766e;
     margin-top: 3px;
     font-weight: 500;
   }
   
   /* Checker Failed/Flagged Fields */
   .form-field.failed-field input,
   .form-field.failed-field select,
   .form-field.failed-field textarea {
     border-color: #d64545 !important;
     background-color: #ffe3e3 !important;
   }
   
   .field-label.rejected {
     color: #ba2525 !important;
     font-weight: 700;
   }
   
   /* Repair Mode Highlighting */
   .form-field.repair-review-field input,
   .form-field.repair-review-field select,
   .form-field.repair-review-field textarea {
     border-color: #f59e0b !important;
     background-color: #fef3c7 !important;
   }
   
   .form-field.repair-newly-modify-field input,
   .form-field.repair-newly-modify-field select,
   .form-field.repair-newly-modify-field textarea {
     border-color: #10b981 !important;
     background-color: #ecfdf5 !important;
   }
   
   /* --------------------------------------------------------------------------
      GAB Buttons & Action Bar (Matching Image 10)
      -------------------------------------------------------------------------- */
   .action-bar,
   .action-container {
     display: flex;
     align-items: center;
     justify-content: flex-end;
     gap: 12px;
     margin-top: 20px;
     padding-top: 14px;
     border-top: 1px solid #d9e2ec;
   }
   
   /* Standard Base Button */
   .lmn-btn {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     height: 36px;
     padding: 0 20px;
     font-size: 13px;
     font-weight: 500;
     border-radius: 4px;
     border: 1px solid #9fb3c8;
     background-color: #ffffff;
     color: #102a43;
     cursor: pointer;
     text-decoration: none;
     transition: all 0.15s ease-in-out;
     box-sizing: border-box;
   }
   
   .lmn-btn:hover {
     background-color: #f0f4f8;
     border-color: #829ab1;
   }
   
   /* Primary Button (Citi GAB Dark Blue - 'Next →' & 'Submit') */
   .lmn-btn.lmn-btn-primary,
   .btn-approve {
     background-color: #00509d !important;
     border-color: #00509d !important;
     color: #ffffff !important;
     font-weight: 600;
   }
   
   .lmn-btn.lmn-btn-primary:hover,
   .btn-approve:hover {
     background-color: #003d75 !important;
     border-color: #003d75 !important;
   }
   
   /* Outlined Secondary Button ('Save for Later' / 'Reject') */
   .btn-reject {
     height: 36px;
     padding: 0 18px;
     font-size: 13px;
     font-weight: 600;
     border-radius: 4px;
     border: 1px solid #d64545 !important;
     background-color: #ffffff !important;
     color: #d64545 !important;
     cursor: pointer;
     transition: all 0.15s ease-in-out;
   }
   
   .btn-reject:hover {
     background-color: #ffe3e3 !important;
   }
   
   /* Disabled Button State */
   .lmn-btn.lmn-btn-unclickable,
   .lmn-btn.lmn-btn-grey,
   .lmn-btn:disabled,
   .btn-approve:disabled,
   .btn-reject:disabled {
     background-color: #d9e2ec !important;
     border-color: #bcccdc !important;
     color: #829ab1 !important;
     cursor: not-allowed !important;
     box-shadow: none !important;
   }
   
   /* --------------------------------------------------------------------------
      Confirmation / Failure Modal Popup (GAB Clean Styling)
      -------------------------------------------------------------------------- */
   .modal {
     position: fixed !important;
     inset: 0 !important;
     width: 100vw !important;
     height: 100vh !important;
     z-index: 99999 !important;
     display: block !important;
   }
   
   .modal-backdrop {
     position: fixed !important;
     inset: 0 !important;
     width: 100vw !important;
     height: 100vh !important;
     background-color: rgba(16, 42, 67, 0.6) !important;
     display: flex !important;
     align-items: center !important;
     justify-content: center !important;
     z-index: 99999 !important;
   }
   
   .modal-container {
     width: 480px !important;
     max-width: 90vw !important;
     background: #ffffff !important;
     border-radius: 6px !important;
     box-shadow: 0 10px 25px rgba(16, 42, 67, 0.25) !important;
     overflow: hidden !important;
     display: flex !important;
     flex-direction: column !important;
     z-index: 100000 !important;
   }
   
   .modal-header {
     display: flex !important;
     align-items: center !important;
     justify-content: space-between !important;
     padding: 12px 18px !important;
     border-bottom: 1px solid #d9e2ec !important;
     background-color: #e9eff6 !important;
   }
   
   .modal-header h3 {
     margin: 0 !important;
     font-size: 14px !important;
     font-weight: 700 !important;
     color: #102a43 !important;
     letter-spacing: 0.02em;
   }
   
   .close-btn {
     background: none !important;
     border: none !important;
     font-size: 20px !important;
     color: #627d98 !important;
     cursor: pointer !important;
     line-height: 1 !important;
   }
   
   .modal-body {
     padding: 18px !important;
     background: #ffffff !important;
   }
   
   .details-card {
     display: flex !important;
     flex-direction: column !important;
     gap: 10px !important;
   }
   
   .detail-row {
     display: flex !important;
     justify-content: space-between !important;
     font-size: 13px !important;
     border-bottom: 1px solid #f0f4f8 !important;
     padding-bottom: 6px !important;
   }
   
   .detail-row .label {
     color: #627d98 !important;
   }
   
   .detail-row .value {
     color: #102a43 !important;
     font-weight: 500 !important;
   }
   
   .modal-footer {
     padding: 12px 18px !important;
     border-top: 1px solid #d9e2ec !important;
     background-color: #f7f9fb !important;
     display: flex !important;
     justify-content: flex-end !important;
   }