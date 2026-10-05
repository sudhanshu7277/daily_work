//In bulk-upload.component.scss (lines 122–164 shown in your previous code view), replace the .upload-error-banner block with this exact SCSS:


.upload-error-banner {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px 16px;
    margin: 0 0 16px 0;
    background: #fdf4f5;
    border-bottom: 2px solid #d93025;
  
    &__left {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
  
    &__header-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  
    &__icon {
      color: #d93025;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
  
    &__text {
      font-size: 14px;
      font-weight: 600;
      color: #102333;
      line-height: 20px;
    }
  
    &__subtext {
      margin: 2px 0 0 30px;
      font-size: 13px;
      color: #333;
      line-height: 1.4;
  
      ul {
        margin: 4px 0 0 0;
        padding-left: 18px;
      }
    }
  
    &__close {
      border: none;
      background: transparent;
      cursor: pointer;
      color: #666;
      padding: 0;
      line-height: 1;
      margin-left: 12px;
      flex-shrink: 0;
  
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  }