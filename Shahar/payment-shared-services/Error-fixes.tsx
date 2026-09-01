//Put border-top: 2px solid $bmo-blue !important directly on .ag-row.row-parent-expanded:

/* 1. Base Row Defaults: Grey bottom divider, zero top borders */
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

/* 2. Closed / Collapsed Parent Row -> Plain grey bottom divider, NO top blue line */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 3. Open / Expanded Parent Row -> Top Blue border right here */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-top: 2px solid $bmo-blue !important;
  border-bottom: 1px solid #b8d9f0 !important;
  z-index: 2 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* 4. Child cluster rows inside open cluster */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #e0e0e0 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* 5. Blue line at the bottom of the open cluster */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}