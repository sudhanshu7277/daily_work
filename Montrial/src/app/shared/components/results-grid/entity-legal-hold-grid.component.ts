// entity-legal-hold-grid.component.ts
import { Component } from '@angular/core';
import { ColDef, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

// ─── LEGAL HOLD Badge Renderer ──────────────────────────────────────────────
@Component({
  selector: 'legal-hold-badge',
  standalone: true,
  template: `
    <ng-container *ngIf="value === 'LEGAL HOLD'; else na">
      <span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-[#1e3a8a] rounded-full">
        LEGAL HOLD
      </span>
    </ng-container>
    <ng-template #na>
      <span class="text-gray-500 text-sm font-medium">N/A</span>
    </ng-template>
  `
})
export class LegalHoldBadgeComponent {
  value!: string;
  agInit(params: ICellRendererParams) { this.value = params.value; }
  refresh(params: ICellRendererParams) { this.value = params.value; return true; }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-entity-legal-hold-grid',
  standalone: true,
  imports: [AgGridAngular, LegalHoldBadgeComponent],
  template: `
    <!-- Filter bar (matches screenshots) -->
    <div class="flex flex-wrap items-center gap-3 mb-4 bg-white p-4 rounded-t-xl border border-gray-200 border-b-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Search result filter</span>
        <select class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Select</option>
        </select>
      </div>

      <div class="flex items-center gap-2 flex-1 min-w-[300px]">
        <span class="text-sm font-medium text-gray-700">Showing:</span>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let filter of showingFilters; let i = index"
                class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-full cursor-pointer hover:bg-gray-50">
            {{ filter }}
            <button (click)="removeFilter(i)" class="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
          </span>
        </div>
      </div>

      <button class="px-5 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-600 rounded-full hover:bg-blue-50 transition-colors">
        RESET
      </button>
    </div>

    <!-- AG Grid -->
    <ag-grid-angular
      class="ag-theme-alpine w-full border border-gray-200 rounded-b-xl overflow-hidden shadow-sm"
      style="height: 680px;"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [gridOptions]="gridOptions"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  `,
  styles: [`
    :host ::ng-deep {
      --ag-row-height: 52px;
      --ag-header-height: 44px;
      --ag-font-size: 14px;
      --ag-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --ag-foreground-color: #111827;
      --ag-header-foreground-color: #334155;
      --ag-header-background-color: #f8fafc;
      --ag-background-color: #ffffff;
      --ag-selected-row-background-color: #eff6ff;
      --ag-row-hover-color: #f1f5f9;
      --ag-header-cell-moving-background-color: #e5e7eb;
    }

    .ag-theme-alpine .ag-header-cell {
      border-right: 1px solid #e2e8f0;
    }

    .ag-theme-alpine .ag-header-cell:last-child {
      border-right: none;
    }

    .ag-theme-alpine .ag-group-cell {
      padding-left: 8px !important;
      font-weight: 500;
    }

    /* Light blue background for expanded top-level rows */
    .ag-row-level-0.ag-row-expanded {
      background-color: #f0f7ff !important;
    }

    /* Chevron styling */
    .ag-theme-alpine .ag-group-expanded .ag-group-contract-icon,
    .ag-theme-alpine .ag-group-contracted .ag-group-expand-icon {
      font-size: 18px;
      color: #374151;
      font-weight: 600;
    }
  `]
})
export class EntityLegalHoldGridComponent {
  private gridApi!: GridApi;

  showingFilters = [
    'Profile Name',
    'Proxy OCIF ID',
    'Legal Hold Status',
    'Legal Hold Name',
    'Customer Lifecycle Status',
    'Role Type',
    'Address',
    'Legal Hold Applied Date',
    'Legal Hold Release Date'
  ];

  removeFilter(index: number) {
    this.showingFilters.splice(index, 1);
  }

  // FLAT DATA with path (required for v32+ treeData without typing issues)
  rowData = [
    {
      path: ['Corp 2'],
      ocifId: "1000-12345",
      profileName: "Corp 2",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 3'],
      ocifId: "1000-12345",
      profileName: "Corp 3",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "legalhold_name_123",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 4'],
      ocifId: "1000-12345",
      profileName: "Corp 4",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "legalhold_name_123",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 5'],
      ocifId: "1000-12345",
      profileName: "Corp 5",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "legalhold_name_123",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 5', 'Role Player F'],
      ocifId: "RP-F",
      profileName: "Role Player F",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Authorized Signatory of ABC Ltd.",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 5', 'Role Player G'],
      ocifId: "RP-G",
      profileName: "Role Player G",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Authorized Signatory of ABC Ltd.",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 5', 'Role Player D'],
      ocifId: "RP-D",
      profileName: "Role Player D",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Authorized Signatory of ABC Ltd.",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 5', 'Role Player E'],
      ocifId: "RP-E",
      profileName: "Role Player E",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Authorized Signatory of ABC Ltd.",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      path: ['Corp 5', 'ABC Ltd.'],
      ocifId: "ABC-Ltd",
      profileName: "ABC Ltd.",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    }
    // Add more rows following the same pattern
  ];

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 48,
      minWidth: 48,
      maxWidth: 48,
      pinned: 'left',
      lockPosition: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      minWidth: 340,
      flex: 2.1,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params: any) => `<span class="text-gray-900 font-medium">${params.value}</span>`
      }
    },
    {
      headerName: 'Proxy OCIF ID',
      field: 'ocifId',
      width: 140
    },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      width: 160,
      cellRenderer: LegalHoldBadgeComponent
    },
    {
      headerName: 'Legal Hold Name',
      field: 'holdName',
      width: 180
    },
    {
      headerName: 'Customer Lifecycle Status',
      field: 'lifecycle',
      width: 170
    },
    {
      headerName: 'Role Type',
      field: 'role',
      minWidth: 240,
      flex: 1.4
    },
    {
      headerName: 'Address',
      field: 'address',
      minWidth: 300,
      flex: 1.8
    }
  ];

  gridOptions: GridOptions = {
    treeData: true,
    getDataPath: (data: any) => data.path, // ← Required for path-based tree data

    getRowId: (params) => params.data.ocifId,

    rowSelection: {
      mode: 'multiRow',
      groupSelects: 'descendants',
      headerCheckbox: true,
      checkboxes: true
    },

    groupDefaultExpanded: 1,
    suppressRowClickSelection: true,
    animateRows: true,

    icons: {
      treeClosed: '<span class="text-gray-700 text-xl">▼</span>',
      treeOpen: '<span class="text-gray-700 text-xl">▲</span>'
    },

    onGridReady: (params) => {
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    }
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
  }
}