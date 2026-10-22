//1. Update bulk-upload.component.html
//In bulk-upload.component.html (lines 208 to 220 in 
// image_66.png), streamline .duplicate-file-error-heading into a clean flex line:

@if (uploadErrorTitle()) {
  <div class="upload-error-banner__text">
    <div class="duplicate-file-error-heading">
      <mat-icon class="upload-error-banner__icon" aria-hidden="true">remove_circle</mat-icon>
      <span>{{ uploadErrorTitle() }}</span>
    </div>
    <p class="duplicate-file-error-body">{{ 'BULK_UPLOAD.UPLOADED_FILE_NAME_MATCHES_PREVIOUSLY_UPLOADED_FILE' | translate }}</p>
  </div>
}


//2. Update bulk-upload.component.scssIn bulk-upload.component.scss, replace lines 209 to 223 (in image_67.png) with:   

.upload-error-banner__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #102333;

  .duplicate-file-error-heading {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    color: #102333;

    .upload-error-banner__icon {
      color: #d92d20; // Exact Figma error red
      font-size: 18px;
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  }

  .duplicate-file-error-body {
    margin: 0;
    padding-left: 26px; // 18px icon + 8px gap = aligns body text perfectly under the title
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: #102333;
  }
}