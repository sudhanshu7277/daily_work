// 1. multi-level-grid.config.ts
// In your profileName column definition, add suppressSizeToFit: true and maxWidth.

// AG Grid's flex: 2 calculates an initial target width, but without maxWidth, clicking a row lets the column grow dynamically to the widest text on screen:

{
  field: 'profileName',
  headerName: 'Profile Name',
  sortable: true,
  minWidth: 170,
  width: 170,
  flex: 2,
  maxWidth: 260, // Locks the ceiling so clicking/focusing never blows the column wide
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


// 2. multi-level-customer-grid-component.scss
// When a row is clicked, AG Grid applies .ag-row-focus and .ag-cell-focus. Browsers natively expand flex items if an inner child receives focus unless the cell track has an explicit width constraint matching AG Grid's computed style.

// Add these exact rules to your SCSS file:

/* Prevent AG Grid header and cell tracks from expanding on click/focus */
.ag-header-cell[col-id="profileName"],
.ag-cell[col-id="profileName"] {
  max-width: 260px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
}

/* Specifically suppress the browser auto-scroll/expansion on focus/selected state */
.ag-row-selected,
.ag-row-focus {
  .ag-cell[col-id="profileName"] {
    max-width: 260px !important;
    width: inherit;
  }
}