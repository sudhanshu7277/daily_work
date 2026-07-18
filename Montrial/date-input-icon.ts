///  scss

// File: customer-search-grid.component.scss

// 1. Core prerequisite: Ensure parent is relatively positioned
.date-input-wrapper {
    position: relative;
  }
  
  // 2. Padding to prevent text overlap
  .custom-date-input {
    padding-right: 48px; /* 16px margin + 18px width + ~14px safe extra space */
  }
  
  // 3. New robust positioning for the icon
  .custom-calendar-icon {
    position: absolute;
    right: 16px; /* Distance from the inside-right border of the input box */
  
    /* More robust vertical centering */
    top: 0;
    bottom: 0;
    margin: auto 0;
  
    width: 18px;
    height: 18px;
  
    /* This allows clicks to pass through to the input field,
       making the explicit click handler in HTML redundant (fixed in Step 2). */
    pointer-events: none;
  
    z-index: 2;
  
    /* Keep all background property changes from the "fix" from image_38.png */
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-image: url("data:image/svg+xml,..."); // Keep the original SVG data from image_38.png
  }

  // html

  <span class="custom-calendar-icon"></span>