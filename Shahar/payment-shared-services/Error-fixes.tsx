/* --- Cluster Closed (Default state) --- */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-bottom: 1px solid #d8e4e6 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* --- Cluster Open (Parent Header) --- */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-bottom: 1px solid #b8d9f0 !important;
  outline: 2px solid $bmo-blue !important;
  outline-offset: -2px;
  /* Clip outline to only show the TOP side */
  clip-path: inset(0 0 calc(100% - 2px) 0);
  z-index: 10 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* --- Child Rows --- */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-bottom: 1px solid #e0e0e0 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* --- Bottom Line on Final Child Row (Working Baseline) --- */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}