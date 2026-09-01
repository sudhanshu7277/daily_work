// In multi-level-customer-grid-component.scss, replace lines 225 to 237 with this exact block:

/* --- When Open: Show the Top Blue Line --- */
.ag-row.row-parent-expanded {
  background-color: #E8F4FD !important;
  border-bottom: 1px solid #b8d9f0 !important;
  box-shadow: inset 0 2px 0 0 $bmo-blue !important;
  z-index: 2 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* --- When Closed: Remove the Blue Line completely --- */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #e0e0e0 !important;
  box-shadow: none !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}