// Step 1: Update columnDefs (customer-search-grid.component.ts)

this.columnDefs = [
    {
      headerName: '',
      field: 'profileName',
      sortable: true,
      minWidth: 260,
      flex: 2,
      cellRenderer: NameCellComponent,
      cellRendererParams: {
        onCheck: (uid: string) => this.onCheckboxClick(uid),
        onToggle: (uid: string) => this.toggleExpand(uid),
      },
      headerComponent: NameHeaderComponent,
      headerComponentParams: {
        state: 'none' as 'none' | 'some' | 'all',
        onSelectAll: (select: boolean) => this.onSelectAll(select),
      },
    },
    {
      headerName: 'Proxy OCIF ID',
      field: 'ocifId',
      sortable: true, // Enable sorting
      width: 205
    },
    {
      headerName: 'Legal Hold Status',
      field: 'status',
      sortable: true,
      width: 170,
      cellRenderer: (p: ICellRendererParams) => {
        if (p.value === 'LEGAL HOLD') return '<span class="cs-lh-pill">LEGAL HOLD</span>';
        if (p.value === 'PROCESSING') return '<span class="cs-lh-processing">PROCESSING</span>';
        return '<span class="cs-lh-na">N/A</span>';
      }
    },
    { headerName: 'Legal Hold Name', field: 'holdName', sortable: true, width: 200 },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', sortable: true, width: 190 },
    { headerName: 'Role Type', field: 'roleType', sortable: true, width: 130 },
    {
      headerName: 'Address',
      field: 'address',
      sortable: true,
      flex: 1,
      minWidth: 200,
      wrapText: true,
      autoHeight: false
    },
    { headerName: 'eDiscovery Project Manager', field: 'eDiscoveryProjectManager', sortable: true, width: 200 },
    { headerName: 'Responsible Lawyer Email', field: 'responsibleLawyerEmail', sortable: true, width: 200 },
    { 
      headerName: 'Legal Hold Applied Date', 
      field: 'holdApplyDate', 
      sortable: true,
      width: 200, 
      valueFormatter: (p: any) => this.formatDateTime(p.value) 
    },
    { 
      headerName: 'Legal Hold Release Date', 
      field: 'holdReleaseDate', 
      sortable: true,
      width: 200, 
      valueFormatter: (p: any) => this.formatDateTime(p.value) 
    }
  ];

  // Step 2: SCSS Fixes (customer-search-grid.component.scss)

  /* --- AG-GRID HEADER CUSTOMIZATION --- */

::ng-deep .ag-theme-alpine,
::ng-deep .ag-theme-balham {

  /* 1. Remove grey vertical dividing lines between headers */
  .ag-header-cell::after,
  .ag-header-group-cell::after {
    display: none !important;
    border-right: none !important;
  }

  /* 2. Header Container Styling */
  .ag-header {
    background-color: #f8f9fa !important; // Clean light background
    border-bottom: 1px solid #e0e0e0 !important;
  }

  .ag-header-cell {
    padding-left: 12px !important;
    padding-right: 12px !important;
    border-right: none !important; // Remove any additional grid border
  }

  .ag-header-cell-text {
    font-size: 13px !important;
    font-weight: 700 !important; // Bold headers matching Figma
    color: #000000 !important;
  }

  /* 3. Custom Up/Down Sort Icon Styling */
  .ag-header-cell-sortable {
    cursor: pointer;

    /* Hide AG-Grid default sort icons if custom arrows are preferred */
    .ag-sort-order {
      display: none !important;
    }

    .ag-sort-ascending-icon,
    .ag-sort-descending-icon,
    .ag-sort-none-icon {
      color: #333333 !important;
      opacity: 0.7;
    }

    &:hover .ag-sort-none-icon {
      opacity: 1;
    }
  }
}