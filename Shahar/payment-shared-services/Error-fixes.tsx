// 1. multi-level-grid.config.ts
// Replace the entire profileName column definition (lines 69–93) with this configuration:

{
  field: 'profileName',
  headerName: 'Profile Name',
  sortable: true,
  minWidth: 170,
  width: 170,
  suppressSizeToFit: true,
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


// 2. name-renderers.component.ts
// In NameCellComponent, update the component @Component({ styles: [...] })
//  block (around lines 48–74) to enforce containment and graceful ellipsis 
// truncation for deep indentation levels:


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
  min-width: 0;
}


// 3. multi-level-customer-grid-component.scss
// Ensure AG-Grid's selection layer does not mutate column bounds or allow overflow:

/* Constrain Profile Name cell boundaries strictly to the column width */
.ag-cell[col-id="profileName"] {
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
}

/* Ensure row selection does not trigger layout recalculation */
.ag-row.ag-row-selected {
  .ag-cell[col-id="profileName"] {
    overflow: hidden !important;
  }
}