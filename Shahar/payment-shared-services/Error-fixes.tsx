// Here are the exact changes for Profile Name and Legal Hold Status in the customer grid to achieve the grey-to-black bidirectional arrow sort behavior.

// File 1: multi-level-grid.config.ts
// Find lines 104–107:

headerName: 'Legal Hold Status',
field: 'status',
sortable: true,
comparator: () => 0,


// Replace with:

headerName: 'Legal Hold Status',
field: 'status',
sortable: true,
unSortIcon: true,


// (Removing comparator: () => 0 lets AG-Grid actually sort the 
// rows, and unSortIcon: true forces the parallel arrows to display in grey when un-sorted).

// Find lines 70–75:


field: 'profileName',
headerName: 'Profile Name',
// minWidth: 200,
minWidth: 260,
width: 320,
flex: 1.5,

//Replace with:

field: 'profileName',
headerName: 'Profile Name',
sortable: true,
unSortIcon: true,
minWidth: 170,
width: 185,


//File 2: multi-level-customer-grid-component.scss
// Find lines 205–208:

.ag-sort-indicator-icon .ag-icon,
.ag-icon-asc::before,
.ag-icon-desc::before {
  color: $bmo-blue !important;
}


//Replace lines 205–208 with:

/* Default / Unsorted state: show parallel sort arrows in muted grey */
.ag-header-cell:not(.ag-header-cell-sorted) .ag-sort-indicator-icon,
.ag-header-cell:not(.ag-header-cell-sorted) .ag-icon-none::before {
  color: #a0a0a0 !important;
  opacity: 0.8 !important;
  display: inline-block !important;
}

/* Ascending state: active arrow dark/black, opposing arrow muted */
.ag-header-cell.ag-header-cell-sorted-asc .ag-icon-asc::before {
  color: #1c2333 !important;
}
.ag-header-cell.ag-header-cell-sorted-asc .ag-icon-desc::before {
  color: #a0a0a0 !important;
  opacity: 0.4 !important;
}

/* Descending state: active arrow dark/black, opposing arrow muted */
.ag-header-cell.ag-header-cell-sorted-desc .ag-icon-desc::before {
  color: #1c2333 !important;
}
.ag-header-cell.ag-header-cell-sorted-desc .ag-icon-asc::before {
  color: #a0a0a0 !important;
  opacity: 0.4 !important;
}

/* Hover state on sortable headers */
.ag-header-cell:hover .ag-sort-indicator-icon {
  opacity: 1 !important;
}


// File 3: multi-level-customer-grid-component.tsTo
//  enforce the exact cycle (null (grey) $\rightarrow$ 'asc' 
// $\rightarrow$ 'desc'):Find in defaultColDef or gridOptions 
// (lines 110–135):Add sortingOrder:


sortingOrder: ['asc', 'desc'],

