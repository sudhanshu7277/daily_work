::ng-deep .upload-error-banner,
.upload-error-banner {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  padding: 10px 16px !important;
  background: #fdf4f5 !important;
  border-bottom: 2px solid #d93025 !important;
  margin: -32px 0 16px 0 !important; // Adjusts vertical pull to sit neatly beside "Max file size is 2GB"

  // Target both BEM conventions (_left and __left)
  &_left,
  &__left {
    display: flex !important;
    flex-wrap: wrap !important; // Allows second element to break onto a new line!
    align-items: center !important;
    gap: 8px !important;
    flex: 1 !important;
  }

  // Row 1: The red cancel icon stays on the first line
  &_icon,
  &__icon {
    color: #d93025 !important;
    font-size: 20px !important;
    width: 20px !important;
    height: 20px !important;
    line-height: 20px !important;
    flex-shrink: 0 !important;
  }

  // Row 2: Forces "Missing mandatory columns" onto the next line
  &_text,
  &__text {
    flex-basis: 100% !important; // Forces line break purely via CSS!
    width: 100% !important;
    display: block !important;
    margin-left: 28px !important; // Aligns under the text of line 1
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #102333 !important;
    line-height: 20px !important;
    white-space: pre-line !important; // Preserves multiline breaks for bullets/subtext
  }

  // Row 3: Description, bullets, or subtext
  &_subtext,
  &__subtext,
  ul {
    flex-basis: 100% !important;
    margin: 4px 0 0 28px !important;
    font-size: 13px !important;
    color: #333 !important;
    line-height: 1.4 !important;
  }

  &_close,
  &__close {
    border: none !important;
    background: transparent !important;
    cursor: pointer !important;
    color: #666 !important;
    padding: 0 !important;
    line-height: 1 !important;
    margin-top: 2px !important;
    margin-left: 12px !important;
    flex-shrink: 0 !important;

    mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }
  }
}