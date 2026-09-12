// 1. multi-level-customer-grid.component.ts
/// Locate syncHeaderCheckbox() (starting at line 298). Replace the method with:

private syncHeaderCheckbox(): void {
  const nodes = this.allNodes();
  if (!nodes.length) return;

  const sel = nodes.filter(n => n._selected).length;
  const state: 'none' | 'some' | 'all' = sel === 0 ? 'none' : sel === nodes.length ? 'all' : 'some';

  if (this.columnDefs && this.columnDefs[0]?.headerComponentParams) {
    this.columnDefs[0].headerComponentParams.state = state;
  }

  if (this.gridApi) {
    this.gridApi.refreshHeader();
  }
}


//2. name-renderers.component.ts
//In NameHeaderComponent (lines 275–282), add change detection 
// inside the existing refresh hook so the header icon repaints 
// when this.gridApi.refreshHeader() is called:

refresh(p: any): boolean {
  this.params = p;
  this.state = p.state ?? 'none';
  this.showCheckbox = p.showCheckbox ?? true;
  this.cdr.detectChanges();
  return true;
}


// 3. Verification of multi-level-grid.config.ts
// Ensure your baseline configuration for profileName remains intact:

{
  field: 'profileName',
  headerName: 'Profile Name',
  sortable: true,
  minWidth: 170,
  width: 170,
  flex: 2,
  headerComponent: NameHeaderComponent,
  headerComponentParams: {
    onSelectAll: onHeaderCheckClick,
    state: 'none'
  },
  cellRenderer: NameCellComponent,
  cellRendererParams: {
    onCheck: onCheckboxClick,
    onToggle: toggleExpand
  },
  cellStyle: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
},