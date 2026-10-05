::ng-deep .upload-error-banner {
    display: flex !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
    padding: 12px 16px !important;
    margin: 0 0 16px 0 !important;
    background: #fdf4f5 !important;
    border-bottom: 2px solid #d93025 !important;
  
    .upload-error-banner__left {
      display: flex !important;
      align-items: flex-start !important;
      gap: 10px !important;
      flex: 1 !important;
    }
  
    .upload-error-banner__icon {
      color: #d93025 !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      line-height: 20px !important;
      margin-top: 1px !important;
      flex-shrink: 0 !important;
    }
  
    .upload-error-banner__text {
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #102333 !important;
      line-height: 20px !important;
      white-space: pre-line !important; // Renders bulleted/multiline error strings cleanly below the title
    }
  
    .upload-error-banner__close {
      border: none !important;
      background: transparent !important;
      cursor: pointer !important;
      color: #666 !important;
      padding: 0 !important;
      line-height: 1 !important;
      margin-left: 12px !important;
      flex-shrink: 0 !important;
  
      mat-icon {
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
      }
    }
  }