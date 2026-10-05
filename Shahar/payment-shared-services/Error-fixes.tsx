//1. bulk-upload.component.scss
// In lines 122–148 (from image_32.png), replace .upload-error-banner and its child 
// selectors with:

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
  
      // Red circle icon and title on a single line
      .upload-error-banner__header-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
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
  
    // The rest of the message/bullets render below the top line
    &__subtext,
    &__description,
    ul {
      margin: 4px 0 0 30px;
      font-size: 13px;
      color: #333;
      line-height: 1.4;
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
    }
  }


  //2. bulk-upload.component.html
// In lines 58–64 (from image_28.png / image_29.png), update the markup inside 
// .upload-error-banner so the icon + title are grouped on line 1, and the 
// rest sits beneath it:


<div class="upload-error-banner" role="alert">
      <div class="upload-error-banner__left">
        <!-- Line 1: Red circle icon and title in one row -->
        <div class="upload-error-banner__header-row">
          <mat-icon class="upload-error-banner__icon">cancel</mat-icon>
          <span class="upload-error-banner__text">{{ uploadErrorTitle() }}</span>
        </div>

        <!-- Line 2+: Remaining error details and mandatory columns list below -->
        @if (uploadErrorSubtext()) {
          <div class="upload-error-banner__subtext">{{ uploadErrorSubtext() }}</div>
        }
      </div>
      <button class="upload-error-banner__close" (click)="dismissUploadError()" aria-label="Dismiss upload error">
        <mat-icon>close</mat-icon>
      </button>
    </div>