/* 1. Collapsed Cluster: Ensure no cell top borders */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-bottom: 1px solid #d8e4e6 !important;

  .ag-cell {
    border-top: none !important;
  }

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 2. Expanded Cluster: Direct top border on every cell of the row */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-bottom: 1px solid #b8d9f0 !important;

  > .ag-cell {
    border-top: 2px solid $bmo-blue !important;
  }

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* 3. Child Rows */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-bottom: 1px solid #e0e0e0 !important;

  .ag-cell {
    border-top: none !important;
  }

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 4. Bottom Cluster End (Existing working rule) */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}