/* 1. When Open (Expanded): Render the top blue line */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-top: 2px solid $bmo-blue !important;
  border-bottom: 1px solid #b8d9f0 !important;
  z-index: 10 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* 2. When Closed (Collapsed): Completely reset top border */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 3. Child row inside cluster */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #e0e0e0 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 4. Bottom blue line on the final child row */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}