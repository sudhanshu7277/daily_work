/* 1. Collapsed Cluster: Normal grey row divider only */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-bottom: 1px solid #d8e4e6 !important;
  border-top: none !important;
  box-shadow: none !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 2. Expanded Cluster Parent: Top BMO Blue border */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-bottom: 1px solid #b8d9f0 !important;
  border-top: none !important;
  /* Inset shadow draws strictly inside the top edge so it is never clipped or hidden */
  box-shadow: inset 0 2px 0 0 $bmo-blue !important;
  z-index: 5 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* 3. Child Rows */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-bottom: 1px solid #e0e0e0 !important;
  border-top: none !important;
  box-shadow: none !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 4. Bottom of the Cluster (Already working) */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}