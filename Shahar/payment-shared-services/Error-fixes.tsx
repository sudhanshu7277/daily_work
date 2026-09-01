// Replace Lines 209 to 246 in multi-level-customer-grid-component.scss
// Locate the row block inside ::ng-deep .ag-theme-alpine.csg-grid 
// (lines 209 to 246) and replace it with:


/* Base Row Styles: Standard grey row dividers */
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

/* Closed/Collapsed Cluster -> Default grey border only, NO blue line */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* Open/Expanded Cluster -> Draws Blue Top Line ONLY when open */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-top: none !important;
  border-bottom: 1px solid #b8d9f0 !important;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: $bmo-blue;
    z-index: 10;
    pointer-events: none;
  }

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* Child Cluster Rows */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #e0e0e0 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* Bottom blue line for the last child row of an open cluster */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}

