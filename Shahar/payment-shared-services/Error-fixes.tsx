

:host {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

.name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 0px; /* Crucial: flex-basis: 0px prevents intrinsic text width from dictating cell size */
  min-width: 0;
  max-width: 100%;
}


// 2. In multi-level-customer-grid.component.html (Grid Options)
If AG Grid's cell focus engine is what stretches the column upon click, add these two standard properties to <ag-grid-angular>:

<ag-grid-angular
  [suppressCellFocus]="true"
  [suppressScrollOnNewData]="true"
  ...



  // 3. In multi-level-grid.config.ts
Keep your baseline configuration intact:

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