// Step 1: Update columnDefs (customer-search-grid.component.ts)

this.columnDefs = [
    {
      headerName: 'Profile Name', // Set headerName explicitly if not handled internally by NameHeaderComponent
      field: 'profileName',
      sortable: true, // 🟢 Enabled sorting for Profile Name
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
      sortable: false, // Disabled
      width: 205 
    },
    {
      headerName: 'Legal Hold Status',
      field: 'status',
      sortable: true, // 🟢 Enabled sorting for Legal Hold Status
      width: 170,
      cellRenderer: (p: ICellRendererParams) => {
        if (p.value === 'LEGAL HOLD') return '<span class="cs-lh-pill">LEGAL HOLD</span>';
        if (p.value === 'PROCESSING') return '<span class="cs-lh-processing">PROCESSING</span>';
        return '<span class="cs-lh-na">N/A</span>';
      }
    },
    { headerName: 'Legal Hold Name', field: 'holdName', sortable: false, width: 200 },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', sortable: false, width: 190 },
    { headerName: 'Role Type', field: 'roleType', sortable: false, width: 130 },
    {
      headerName: 'Address',
      field: 'address',
      sortable: false,
      flex: 1,
      minWidth: 200,
      wrapText: true,
      autoHeight: false
    },
    { headerName: 'eDiscovery Project Manager', field: 'eDiscoveryProjectManager', sortable: false, width: 200 },
    { headerName: 'Responsible Lawyer Email', field: 'responsibleLawyerEmail', sortable: false, width: 200 },
    { 
      headerName: 'Legal Hold Applied Date', 
      field: 'holdApplyDate', 
      sortable: false, 
      width: 200, 
      valueFormatter: (p: any) => this.formatDateTime(p.value) 
    },
    { 
      headerName: 'Legal Hold Release Date', 
      field: 'holdReleaseDate', 
      sortable: false, 
      width: 200, 
      valueFormatter: (p: any) => this.formatDateTime(p.value) 
    }
  ];

  // Step 2: SCSS Fixes (customer-search-grid.component.scss)

  /* --- AG-GRID HEADER CUSTOMIZATION --- */
/* --- AG-GRID CUSTOM HEADER & SORT ICON STYLING --- */

::ng-deep .ag-theme-alpine,
::ng-deep .ag-theme-balham {

  /* 1. Remove vertical grey column dividers */
  .ag-header-cell::after,
  .ag-header-group-cell::after {
    display: none !important;
    border-right: none !important;
  }

  /* 2. Style Sortable Headers & Custom Up/Down Arrows */
  .ag-header-cell-sortable {
    cursor: pointer;

    /* Unsorted state icon */
    .ag-header-icon.ag-sort-none-icon {
      display: inline-block !important;
      opacity: 0.7;
      margin-left: 4px;
    }

    /* Active sort icons */
    .ag-header-icon.ag-sort-ascending-icon,
    .ag-header-icon.ag-sort-descending-icon {
      opacity: 1;
      color: #000000 !important;
      margin-left: 4px;
    }

    /* Prevent default sort order numbers from showing */
    .ag-sort-order {
      display: none !important;
    }
  }
}