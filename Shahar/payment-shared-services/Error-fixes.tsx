/* 1. Base row reset: all rows keep the standard grey divider */
.ag-row {
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;
  background-color: #ffffff;

  .ag-cell {
    border-top: none !important;
  }
}

/* 2. Collapsed (Closed) Cluster: No blue line, standard grey only */
.ag-row.row-parent-collapsed {
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;

  .ag-cell {
    border-top: none !important;
  }

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 3. Expanded (Open) Cluster: Solid Blue line across the top */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-bottom: 1px solid #b8d9f0 !important;
  z-index: 5 !important;

  .ag-cell {
    border-top: 2px solid $bmo-blue !important;
  }

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* 4. Child rows inside open cluster */
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

/* 5. Bottom line for the end of the cluster */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}