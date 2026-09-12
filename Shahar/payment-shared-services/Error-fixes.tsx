// 1. In multi-level-customer-grid.component.ts
// Lines 305–315 snapshot the current column widths before setting 
// columnDefs, and immediately restore them via applyColumnState. This prevents AG Grid from expanding the column when the checkbox state updates.

// Replace lines 305–315 with:

cellStyle: (params) => {
  const level = params.data?._level ?? 0;
  // Conditional ternary operator targeting non-indented (0) and 1-level indented (1) records:
  const isShallow = level <= 1;

  return {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
    maxWidth: isShallow ? '100%' : 'none'
  };
},

// 2. In multi-level-customer-grid.component.ts (syncHeaderCheckbox(), lines 305–316)
// In image_31.png, replace lines 305–316:

if (this.columnDefs[0]) {
  this.columnDefs = [
    {
      ...this.columnDefs[0],
      headerComponentParams: { ...this.columnDefs[0].headerComponentParams, state }
    },
    ...this.columnDefs.slice(1)
  ];

  if (this.gridApi) {
    // Snapshot the current pixel widths of all columns before updating definitions
    const colState = this.gridApi.getColumnState();

    this.gridApi.setGridOption('columnDefs', this.columnDefs);

    // Immediately restore exact column widths so flex: 2 cannot expand Profile Name on check/uncheck
    this.gridApi.applyColumnState({
      state: colState.map(c => ({ colId: c.colId, width: c.width })),
      applyOrder: false
    });
  }
}

