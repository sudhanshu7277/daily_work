@if (bulkUploadDataError()) {
    <div class="upload-error-top-banner" role="alert">
      <div class="upload-error-top-banner__left">
        <mat-icon class="upload-error-top-banner__icon">cancel</mat-icon>
        <span class="upload-error-top-banner__text">{{ bulkUploadDataError() }}</span>
      </div>
      <button
        type="button"
        class="upload-error-top-banner__close"
        (click)="dismissUploadError()"
        aria-label="Dismiss upload error"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  }
  
  
  
  
  ::ng-deep .upload-error-top-banner,
  .upload-error-top-banner {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 12px 16px !important;
    margin: 0 24px 16px 24px !important;
    background: #fdf2f2 !important;
    border: 1px solid #d93025 !important;
    border-radius: 4px !important;
    box-sizing: border-box !important;
  
    &_left,
    &__left {
      display: flex !important;
      flex-wrap: nowrap !important;
      align-items: center !important;
      gap: 12px !important;
      flex: 1 !important;
      min-width: 0 !important;
    }
  
    &_icon,
    &__icon {
      color: #d93025 !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      line-height: 18px !important;
      flex-shrink: 0 !important;
      margin: 0 !important;
    }
  
    &_text,
    &__text {
      display: inline-block !important;
      flex: 1 !important;
      width: auto !important;
      margin: 0 !important;
      font-size: 13px !important;
      font-weight: 400 !important;
      color: #102333 !important;
      line-height: 18px !important;
      white-space: pre-line !important;
    }
  
    &_subtext,
    &__subtext,
    ul {
      flex-basis: 100% !important;
      margin: 4px 0 0 30px !important;
      font-size: 13px !important;
      color: #333 !important;
      line-height: 1.4 !important;
    }
  
    &_close,
    &__close {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: none !important;
      background: transparent !important;
      cursor: pointer !important;
      color: #595959 !important;
      padding: 0 !important;
      margin: 0 0 0 12px !important;
      line-height: 1 !important;
      flex-shrink: 0 !important;
  
      mat-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
        line-height: 18px !important;
      }
    }
  }
  