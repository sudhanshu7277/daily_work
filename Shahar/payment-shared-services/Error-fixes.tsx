.upload-error-banner {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 10px 16px;
    margin: 0 25px 12px 6px;
    background: #fdf4f5;
    border-bottom: 2px solid #d93025;
  
    &_left {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      flex: 1;
    }
  
    &_icon {
      color: #d93025;
      font-size: 20px;
      width: 20px;
      height: 20px;
      line-height: 20px;
      margin-top: 1px;
      flex-shrink: 0;
    }
  
    &_text {
      font-size: 14px;
      font-weight: 600;
      color: #102333;
      line-height: 20px;
      white-space: pre-line;
    }
  
    &_close {
      border: none;
      background: transparent;
      cursor: pointer;
      color: #666;
      padding: 0;
      line-height: 1;
      margin-top: 2px;
      margin-left: 12px;
      flex-shrink: 0;
  
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  }