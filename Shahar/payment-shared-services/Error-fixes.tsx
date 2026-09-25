//Step 1: In bulk-upload.component.html
// Update the success banner template (lines 43–52 in image_45.png) 
// to ensure the text is populated with fallback to Figma's exact copy


@if (showSuccessBanner()) {
  <div class="success-banner" role="status">
    <div class="success-banner__left">
      <mat-icon class="success-banner__icon">check_circle</mat-icon>
      <span class="success-banner__text">
        {{ successMessage() || 'Successfully uploaded for processing.' }}
      </span>
    </div>
    <button class="success-banner__close" (click)="dismissBanner()" aria-label="Dismiss success message">
      <mat-icon>close</mat-icon>
    </button>
  </div>
}



//Step 2: In bulk-upload.component.scss
// Replace lines 60 to 102 in bulk-upload.component.scss (image_46.png / image_47.png) with:


/* ==========================================================================
   Success Banner (Exact Figma Spec)
   ========================================================================== */
   .success-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 54px;
    padding: 14px 20px;
    /* Top touches close to header, standard side margins, breathing room below */
    margin: 6px 24px 24px 24px;
    background-color: #eaf5ea;
    /* Light borders on top and sides, thick prominent dark green bottom accent */
    border: 1px solid #c8e6c9;
    border-bottom: 2.5px solid #2e7d32;
    border-radius: 4px 4px 0 0; /* subtle top rounding, flat bottom along accent line */
    box-sizing: border-box;
  
    &__left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  
    &__icon {
      color: #2e7d32;
      font-size: 20px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    &__text {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 20px;
      letter-spacing: 0.1px;
    }
  
    &__close {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333333;
      transition: opacity 0.15s ease-in-out;
  
      &:hover {
        opacity: 0.7;
      }
  
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  }