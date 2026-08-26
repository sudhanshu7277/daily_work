// 1. Component HTML Template


<button type="button" class="upload-docs-btn" (click)="onUploadDocuments()">
  <svg 
    class="upload-icon" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Upward arrow -->
    <path 
      d="M12 16V4M12 4L7 9M12 4L17 9" 
      stroke="currentColor" 
      stroke-width="2.2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <!-- Bottom horizontal tray line -->
    <path 
      d="M5 20H19" 
      stroke="currentColor" 
      stroke-width="2.2" 
      stroke-linecap="round" 
    />
  </svg>
  <span class="upload-btn-text">UPLOAD DOCUMENTS</span>
</button>



// 2. SCSS / CSS Styling


.upload-docs-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 28px;
    
    background-color: #0079C1; /* BMO primary blue */
    color: #ffffff;
    
    border: none;
    border-radius: 9999px; /* Pill shape */
    outline: none;
    cursor: pointer;
    
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    
    transition: background-color 0.2s ease, transform 0.1s ease;
  
    &:hover {
      background-color: #005a91;
    }
  
    &:active {
      background-color: #004b7a;
      transform: scale(0.98);
    }
  
    .upload-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }
  
    .upload-btn-text {
      line-height: 1;
      white-space: nowrap;
    }
  }


  // SAME ICON INVERTED


  <button type="button" class="download-btn" (click)="onDownload()">
  <svg 
    class="download-icon" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Downward pointing arrow -->
    <path 
      d="M12 4V16M12 16L7 11M12 16L17 11" 
      stroke="currentColor" 
      stroke-width="2.2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    <!-- Bottom horizontal tray line -->
    <path 
      d="M5 20H19" 
      stroke="currentColor" 
      stroke-width="2.2" 
      stroke-linecap="round" 
    />
  </svg>
  <span class="download-btn-text">DOWNLOAD</span>
</button>

/// SCSS FOR INVERTED ICON


.download-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 8px 12px;
    color: #1a1a1a;
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: color 0.15s ease, opacity 0.15s ease;
  
    &:hover {
      color: #0079c1; /* Theme blue hover */
    }
  
    &:active {
      opacity: 0.75;
    }
  
    .download-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }
  
    .download-btn-text {
      line-height: 1;
      white-space: nowrap;
    }
  }