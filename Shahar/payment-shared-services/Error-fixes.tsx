// Replace lines 209 to 246 in multi-level-customer-grid-component.scss with this block:


/* 1. Base Row Defaults: All rows have the standard grey bottom divider */
.ag-row {
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;
  box-shadow: none !important;
  background-color: #ffffff;

  .ag-cell {
    display: flex !important;
    align-items: center !important;
    font-size: 13px !important;
    color: #1c2333;
    border: none !important; /* Strips any cell-level border overrides */
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

/* 2. Closed / Collapsed Cluster: Stays standard grey, NO blue accent */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;
  box-shadow: none !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 3. Open / Expanded Cluster: Top horizontal BMO Blue line ONLY */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-bottom: 1px solid #b8d9f0 !important;
  box-shadow: inset 0 2px 0 0 $bmo-blue !important;
  z-index: 2 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* 4. Child Rows when cluster is open */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #e0e0e0 !important;
  box-shadow: none !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 5. Bottom line for the last child in an open cluster */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}