// Change 1 — customer-search-grid.component.scss (add at the bottom):

/* ── Header: remove grey column separator lines ── */
::ng-deep {
    .ag-header-cell {
      border-right: none !important;
    }
    .ag-header-cell-resize::after {
      display: none !important;
    }
  
    /* ── Ensure sort icons are visible on sortable columns ── */
    .ag-sort-indicator-container {
      display: flex !important;
      opacity: 1 !important;
    }
    .ag-sort-order {
      display: none; /* hide the "1" number next to sort icon */
    }
  }


  // Change 2 — columnDefs in the constructor (two targeted edits only):

  // Profile Name column — add unSortIcon + sort params (lines 322–338, add 3 lines)
{
    headerName: '',
    field: 'profileName',
    sortable: true,
    unSortIcon: true,          // ← ADD: always show ↑↓ even when unsorted
    sort: null,                // ← ADD: start unsorted
    minWidth: 260,
    flex: 2,
    cellRenderer: NameCellComponent,
    cellRendererParams: {
      onCheck:  (uid: string) => this.onCheckboxClick(uid),
      onToggle: (uid: string) => this.toggleExpand(uid),
    },
    headerComponent: NameHeaderComponent,
    headerComponentParams: {
      state: 'none' as 'none' | 'some' | 'all',
      onSelectAll: (select: boolean) => this.onSelectAll(select),
      showSort: true,          // ← ADD: flag for NameHeaderComponent to render sort icon
    },
  },
  
  // Legal Hold Status column — add unSortIcon (lines 340–351, add 1 line)
  {
    headerName: 'Legal Hold Status',
    field: 'status',
    sortable: true,
    unSortIcon: true,          // ← ADD
    sort: null,
    width: 170,
    cellRenderer: (p: ICellRendererParams) =>
      p.value === 'LEGAL HOLD'
        ? '<span class="cs-lh-pill">LEGAL HOLD</span>'
        : p.value === 'PROCESSING'
        ? '<span class="cs-lh-processing">PROCESSING</span>'
        : '<span class="cs-lh-na">N/A</span>',
  },