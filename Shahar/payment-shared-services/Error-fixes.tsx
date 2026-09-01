//Here is the complete, surgically clean replacement for lines 209 to 246 in multi-level-customer-grid-component.scss.

// Replace lines 209 to 246 with this exact code block:

/* -----------------------------------------------------------
     Base Row Styles & Reset
     ----------------------------------------------------------- */
     .ag-row {
      border-top: none !important;
      border-bottom: 1px solid #d8e4e6 !important;
      background-color: #ffffff;
  
      .ag-cell {
        display: flex !important;
        align-items: center !important;
        font-size: 13px !important;
        color: #1c2333;
        border: none !important;
        background: transparent !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        padding-left: 14px !important;
        line-height: 1.5;
  
        &[col-id="profileName"] {
          border-right: 1px solid #d8e4e6 !important;
        }
      }
    }
  
    /* -----------------------------------------------------------
       1. Closed Cluster (Collapsed) -> Plain grey divider, NO blue
       ----------------------------------------------------------- */
    .ag-row.row-parent-collapsed {
      background-color: #ffffff !important;
      border-top: none !important;
      border-bottom: 1px solid #d8e4e6 !important;
  
      .ag-cell {
        border-top: none !important;
        box-shadow: none !important;
      }
  
      &:hover {
        background-color: #f5f9fa !important;
      }
    }
  
    /* -----------------------------------------------------------
       2. Open Cluster (Expanded) -> Top BMO Blue border across all cells
       ----------------------------------------------------------- */
    .ag-row.row-parent-expanded {
      background-color: #e8f4fd !important;
      border-top: none !important;
      border-bottom: 1px solid #b8d9f0 !important;
      z-index: 5 !important;
  
      /* Cell-level top border guarantees the blue line paints above AG-Grid virtual row clipping */
      .ag-cell {
        border-top: 2px solid $bmo-blue !important;
      }
  
      &:hover {
        background-color: #d6ecf9 !important;
      }
    }
  
    /* -----------------------------------------------------------
       3. Expanded Child Rows
       ----------------------------------------------------------- */
    .ag-row.row-child {
      background-color: #ffffff !important;
      border-top: none !important;
      border-bottom: 1px solid #e0e0e0 !important;
  
      .ag-cell {
        border-top: none !important;
      }
  
      &:hover {
        background-color: #f5f9fa !important;
      }
    }
  
    /* -----------------------------------------------------------
       4. Bottom BMO Blue Line on the final child row of open cluster
       ----------------------------------------------------------- */
    .ag-row.row-cluster-end {
      border-bottom: 2px solid $bmo-blue !important;
    }