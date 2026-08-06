// Step 1: Update Column Definitions in customer-search-grid.component.ts
///Replace hardcoded width and flex: 1 properties with minWidth on the affected columns so AG Grid can dynamically expand them:

// Line 395: Profile Name column
{
  headerName: '',
  field: 'profileName',
  sortable: true,
  comparator: () => 0,
  minWidth: 180, // Remove 'flex: 1' or hardcoded 'width'
  cellRenderer: NameCellComponent,
  cellRendererParams: { ... },
  headerComponent: NameHeaderComponent,
  headerComponentParams: { ... }
},

// Line 432: Customer Lifecycle Status column
{ 
  headerName: 'Customer Lifecycle Status', 
  field: 'lifecycle', 
  minWidth: 220 // Changed from fixed width: 190
},

// Line 447: eDiscovery Project Manager column
{ 
  headerName: 'eDiscovery Project Manager', 
  field: 'eDiscoveryProjectManager', 
  minWidth: 240 // Changed from fixed width: 200
}


// Step 2: Add the Auto-Sizing Helper Method
//Add this method to CustomerSearchGridComponent:

/**
 * Dynamically adjusts all visible column widths based on cell content AND header text length.
 */
autoSizeAllColumnsWithHeader(): void {
  if (!this.gridApi) return;

  // Passing 'false' instructs AG Grid NOT to skip the header,
  // forcing it to calculate width based on the header text length.
  setTimeout(() => {
    this.gridApi.autoSizeAllColumns(false);
  }, 0);
}


// Step 3: Trigger Auto-Sizing on Grid Initialization and Filter Changes
// Call autoSizeAllColumnsWithHeader() in onGridReady, onFirstDataRendered, and inside onFilterChange():

onGridReady(e: GridReadyEvent): void {
  this.gridApi = e.api;
  this.autoSizeAllColumnsWithHeader();
}

onFirstDataRendered(e: FirstDataRenderedEvent): void {
  this.autoSizeAllColumnsWithHeader();
}

onFilterChange(): void {
  this.selectedFilterIds = this.normalizeSelectedFilters(this.selectedFilterIds);
  this.syncColumns();
  this.cdr.detectChanges();

  // Recalculate column widths whenever visible columns change
  this.autoSizeAllColumnsWithHeader();
}