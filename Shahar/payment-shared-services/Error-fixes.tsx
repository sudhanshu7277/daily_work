// The Complete 2-Part Fix
// Fix 1: Stop Letter-by-Letter Wrapping in name-renderers.component.ts
// Update .name-text around line 65:


.name-text {
  color: #0079c1;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}


//Fix 2: Dynamic Auto-Adjusting Width in multi-level-grid.config.ts
// Allow the column to size according to character length and hierarchy indentation without dead whitespace:

// In createMultiLevelColumnDefs:

// Remove width: 320 and flex: 1.5.

// Set minWidth: 200 (or 220) to guarantee header text fit.

// Allow standard dynamic flex (flex: 1) or auto-sizing.


{
  field: 'profileName',
  headerName: 'Profile Name',
  minWidth: 220,
  flex: 1,
  headerComponent: NameHeaderComponent,
  headerComponentParams: {
    onSelectAll: onHeaderCheckClick,
    state: 'none'
  },
  cellRenderer: NameCellComponent,
  cellRendererParams: {
    onCheck: onCheckboxClick,
    onToggle: toggleExpand
  }
},



//Fix 3: AG-Grid Auto-Size Columns on Expand / Collapse
// To dynamically size the column when children expand (accounting for the level * 20 indenting shown in Images 83–85), invoke AG-Grid's column auto-size in multi-level-customer-grid-component.ts.

// In toggleExpand (lines 329–337):


toggleExpand(uid: string): void {
  const found = this.findNode(uid);
  if (!found) return;

  found.node._expanded = !found.node._expanded;

  withPreservedScroll(this.hostEl?.nativeElement, () => {
    this.refresh();
    this.gridApi?.redrawRows();

    // Auto-adjust column widths dynamically based on expanded content
    setTimeout(() => {
      this.gridApi?.autoSizeColumns(['profileName'], false);
    });
  });
}


//Also run it once in onGridReady (lines 418–421):


onGridReady(e: GridReadyEvent): void {
  this.gridApi = e.api;
  this.addHeaderKeyboardSupport();
  setTimeout(() => {
    this.gridApi?.autoSizeColumns(['profileName'], false);
  });
}