/* Header wrapper block alignment adjustments */
.dashboard-header {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 24px;
    
    /* 🌟 FIX 1: Remove the negative margin causing the invisible overlapping glitch */
    margin-top: 0px !important; 
    width: 100%;
    flex-wrap: nowrap !important;
}

/* Filters panel layout adjustments */
.dashboard-header-filters {
    display: flex;
    flex-direction: row !important;
    align-items: flex-end !important;
    gap: 12pxpx;
    flex-wrap: nowrap !important;
    margin-left: auto !important;
    
    /* 🌟 FIX 2: Elevate the stack layer order to make sure fields capture mouse events natively */
    position: relative !important;
    z-index: 10 !important; 
}


.box-instruction-styles {
    display: inline-flex;
    width: max-content;
    
    /* Match the padding & border-radius of the StatusTag component */
    padding: 4px 12px; 
    border-radius: 4px;
    
    /* Add the core border layout style */
    border: 1px solid #1a365d; /* Dark navy border to match the look */
    background-color: transparent; /* Or add a light background variant if needed */
  
    /* Text formatting overrides */
    font-size: 11px;
    font-weight: 600;
    color: #1a365d;
    text-align: center;
    align-items: center;
    justify-content: center;
    height: auto;
  }