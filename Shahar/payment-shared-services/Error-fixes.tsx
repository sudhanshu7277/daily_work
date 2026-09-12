// 1. In multi-level-customer-grid.component.ts
// Locate syncHeaderCheckbox() (around line 298 in Image 23):

// Check what follows line 304. If you have:


this.columnDefs[0].headerComponentParams.state = state;
this.gridApi.setGridOption('columnDefs', this.columnDefs); // <-- THIS LINE TRIGGERS THE EXPANSION

// or:

this.gridApi.setColumnDefs(this.columnDefs);

// Replace that redraw call by refreshing the header directly without touching the column definitions:

private syncHeaderCheckbox(): void {
  const nodes = this.allNodes();
  if (!nodes.length) return;

  const sel = nodes.filter(n => n._selected).length;
  const state: 'none' | 'some' | 'all' = sel === 0 ? 'none' : sel === nodes.length ? 'all' : 'some';

  // Update the state property in params
  if (this.columnDefs && this.columnDefs[0]?.headerComponentParams) {
    this.columnDefs[0].headerComponentParams.state = state;
  }

  // Refresh ONLY the header cells, NOT the column layout or widths
  if (this.gridApi) {
    this.gridApi.refreshHeader();
  }
}

//2. In multi-level-customer-grid.component.ts (if columnDefs must be reset)
// If your architecture requires updating column definitions via 
// setGridOption, capture and restore the column state so widths remain 
// identical before and after the click:

private syncHeaderCheckbox(): void {
  const nodes = this.allNodes();
  if (!nodes.length) return;

  const sel = nodes.filter(n => n._selected).length;
  const state: 'none' | 'some' | 'all' = sel === 0 ? 'none' : sel === nodes.length ? 'all' : 'some';

  if (this.gridApi) {
    // 1. Capture exact pixel widths prior to updating header state
    const colState = this.gridApi.getColumnState();

    if (this.columnDefs && this.columnDefs[0]?.headerComponentParams) {
      this.columnDefs[0].headerComponentParams.state = state;
    }

    // 2. Refresh header without letting flex reset widths
    this.gridApi.refreshHeader();

    // If setGridOption('columnDefs') was strictly needed:
    // this.gridApi.setGridOption('columnDefs', [...this.columnDefs]);
    // this.gridApi.applyColumnState({ state: colState, applyOrder: false });
  }
}

