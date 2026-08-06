// Option 2: Selective Styling via headerClass
//If you only want to shift specific headers (like Customer Lifecycle Status and eDiscovery Project Manager), define a utility class in SCSS and apply it in your column definitions.

// 1. Add class to customer-search-grid.component.scss:

::ng-deep .shift-header-left {
  .ag-header-cell-label {
    justify-content: flex-start !important;
    padding-left: 2px !important;
  }
  .ag-header-cell-text {
    margin-left: 0 !important;
    padding-left: 0 !important;
  }
}


// 2. Apply headerClass in customer-search-grid.component.ts:

// Line 432
{ 
  headerName: 'Customer Lifecycle Status', 
  field: 'lifecycle', 
  width: 220,
  headerClass: 'shift-header-left'
},

// Line 447
{ 
  headerName: 'eDiscovery Project Manager', 
  field: 'eDiscoveryProjectManager', 
  width: 250,
  headerClass: 'shift-header-left'
}