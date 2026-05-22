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