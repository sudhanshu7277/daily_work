//Lines 304–310 update this.columnDefs[0].headerComponentParams and then call:

this.gridApi.setGridOption('columnDefs', this.columnDefs);


// Replace the syncHeaderCheckbox method with:



private syncHeaderCheckbox(): void {
  const nodes = this.allNodes();
  if (!nodes.length) return;

  const sel = nodes.filter(n => n._selected).length;
  const state: 'none' | 'some' | 'all' = sel === 0 ? 'none' : sel === nodes.length ? 'all' : 'some';

  if (this.columnDefs && this.columnDefs[0]?.headerComponentParams) {
    this.columnDefs[0].headerComponentParams.state = state;
  }

  if (this.gridApi) {
    // 1. Snapshot the exact current column widths and positions
    const savedColState = this.gridApi.getColumnState();

    // 2. Refresh only the header component cells without recalculating grid flex layout
    this.gridApi.refreshHeader();

    // 3. Fallback: if your custom header renderer requires setGridOption to pick up state,
    // restore the exact snapshot so widths cannot shift or expand:
    if (this.columnDefs) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
      this.gridApi.applyColumnState({ state: savedColState, applyOrder: false });
    }
  }
}

// In name-renderers.component.ts
// Ensure the header component updates its icon when refreshHeader() 
// fires. In NameHeaderComponent, implement or update refresh(params: any): boolean:

refresh(params: any): boolean {
  this.params = params;
  this.state = params.state ?? 'none';
  return true; // Tells AG Grid the custom header refreshed successfully in place
}