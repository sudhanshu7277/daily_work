//1. In multi-level-grid.config.ts
// Keep your exact 3 properties (minWidth: 170, width: 170, 
// flex: 2), but add maxWidth and proper cell style 
// constraints so AG-Grid's flex: 2 cannot expand excessively upon selection:

{
  field: 'profileName',
  headerName: 'Profile Name',
  sortable: true,
  minWidth: 170,
  width: 170,
  flex: 2,
  maxWidth: 380, // Dynamic ceiling: lets flex: 2 expand naturally, but stops excessive ballooning on selection
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
    boxSizing: 'border-box'
  }
},

  // 2. In name-renderers.component.ts
// The reason multi-level deep items (level 1, 2, 3) 
// were either spilling over Proxy OCIF ID or getting cut down to 
// Dou... at 170px is that the inner flex items did not 
// allow shrinkage and truncation inside indented containers.

// Update NameCellComponent styles (lines 48–74):


:host {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.name-text {
  color: #0079c1;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
  min-width: 0; // Essential: allows text to shrink and show ellipsis instead of forcing the container wide
}


//3. In multi-level-customer-grid-component.scss
// Add this rule to lock the cell container to AG-Grid’s 
// layout track so row selection never causes geometry shifting:


.ag-cell[col-id="profileName"] {
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

/* Ensure selected rows do not trigger horizontal reflows */
.ag-row.ag-row-selected {
  .ag-cell[col-id="profileName"] {
    overflow: hidden !important;
    box-sizing: border-box !important;
  }
}