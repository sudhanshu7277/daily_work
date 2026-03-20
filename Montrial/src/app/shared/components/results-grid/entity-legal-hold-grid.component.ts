// entity-legal-hold-grid.component.ts
import { Component } from '@angular/core';
import { ColDef, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

// ─── Exact LEGAL HOLD Badge (dark navy blue pill from screenshots) ───────
@Component({
  selector: 'legal-hold-badge',
  standalone: true,
  template: `
    <ng-container *ngIf="value === 'LEGAL HOLD'; else na">
      <span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-[#1E3A8A] rounded-full tracking-wide">
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

// ─── MAIN COMPONENT – 100% Figma Replica ───────────────────────────────────
@Component({
  selector: 'app-entity-legal-hold-grid',
  standalone: true,
  imports: [AgGridAngular, LegalHoldBadgeComponent],
  template: `
    <!-- FILTER BAR – EXACT MATCH TO ALL SCREENSHOTS -->
    <div class="flex flex-wrap items-center gap-3 mb-4 bg-white p-4 rounded-t-xl border border-gray-200">
      <!-- Search result filter -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Search result filter</span>
        <select class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Select</option>
          <option>Legal Hold Only</option>
          <option>Active Only</option>
        </select>
      </div>

      <!-- Showing pills -->
      <div class="flex items-center gap-2 flex-1">
        <span class="text-sm font-medium text-gray-700">Showing:</span>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let filter of activeFilters; let i = index"
                (click)="removeFilter(i)"
                class="inline-flex items-center gap-1 px-4 py-1 text-xs font-medium bg-white border border-gray-300 rounded-full cursor-pointer hover:bg-gray-100">
            {{ filter }}
            <span class="text-gray-400 hover:text-red-500 text-lg leading-none">×</span>
          </span>
        </div>
      </div>

      <!-- RESET -->
      <button (click)="resetFilters()"
              class="px-6 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50 border border-blue-600 rounded-full transition-colors">
        RESET
      </button>
    </div>

    <!-- AG-GRID – PERFECT VISUAL MATCH -->
    <ag-grid-angular
      class="ag-theme-alpine w-full border border-gray-200 rounded-b-xl overflow-hidden"
      style="height: 720px;"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [gridOptions]="gridOptions"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  `,
  styles: [`
    :host ::ng-deep {
      --ag-row-height: 52px;
      --ag-header-height: 48px;
      --ag-font-size: 14px;
      --ag-font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --ag-foreground-color: #111827;
      --ag-background-color: #ffffff;
      --ag-header-background-color: #f8fafc;
      --ag-header-foreground-color: #334155;
      --ag-selected-row-background-color: #eff6ff;
      --ag-row-hover-color: #f1f5f9;
    }

    /* Expanded top-level parents get exact light-blue background */
    .ag-row-level-0.ag-row-expanded {
      background-color: #f0f7ff !important;
    }

    /* Custom chevrons (▲ expanded / ▼ collapsed) – exact match */
    .ag-theme-alpine .ag-group-expanded .ag-group-contract-icon,
    .ag-theme-alpine .ag-group-contracted .ag-group-expand-icon {
      font-size: 18px;
      font-weight: 700;
      color: #374151;
    }

    /* Pill hover effect */
    .ag-theme-alpine .ag-group-cell {
      padding-left: 12px !important;
      font-weight: 500;
    }
  `]
})
export class EntityLegalHoldGridComponent {
  private gridApi!: GridApi;

  // Active filter pills (exactly as shown in screenshots)
  activeFilters = [
    'Profile Name', 'Proxy OCIF ID', 'Legal Hold Status',
    'Legal Hold Name', 'Customer Lifecycle Status', 'Role Type',
    'Address', 'Legal Hold Applied Date', 'Legal Hold Release Date'
  ];

  removeFilter(index: number) {
    this.activeFilters.splice(index, 1);
  }

  resetFilters() {
    this.activeFilters = [
      'Profile Name', 'Proxy OCIF ID', 'Legal Hold Status',
      'Legal Hold Name', 'Customer Lifecycle Status', 'Role Type',
      'Address', 'Legal Hold Applied Date', 'Legal Hold Release Date'
    ];
  }

  // Data – matches every screenshot (Corp 2–5 hierarchy + Role Players + ABC Ltd.)
  rowData = [
    {
      ocifId: "Corp2",
      profileName: "Corp 2",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: []
    },
    {
      ocifId: "Corp3",
      profileName: "Corp 3",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "legalhold_name_123",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: []
    },
    {
      ocifId: "Corp4",
      profileName: "Corp 4",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "legalhold_name_123",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: []
    },
    {
      ocifId: "Corp5",
      profileName: "Corp 5",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "legalhold_name_123",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: [
        { ocifId: "RP-F", profileName: "Role Player F", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Authorized Signatory of ABC Ltd.", address: "33 Dundas St W, Toronto, ON M5G 2C3" },
        { ocifId: "RP-G", profileName: "Role Player G", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Authorized Signatory of ABC Ltd.", address: "33 Dundas St W, Toronto, ON M5G 2C3" },
        { ocifId: "RP-D", profileName: "Role Player D", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Authorized Signatory of ABC Ltd.", address: "33 Dundas St W, Toronto, ON M5G 2C3" },
        { ocifId: "RP-E", profileName: "Role Player E", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Authorized Signatory of ABC Ltd.", address: "33 Dundas St W, Toronto, ON M5G 2C3" },
        { ocifId: "RP-A", profileName: "Role Player A", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Owner of ABC Ltd.", address: "33 Dundas St W, Toronto, ON M5G 2C3" },
        { ocifId: "RP-B", profileName: "Role Player B", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Authorized Signatory of ABC Ltd.", address: "33 Dundas St W, Toronto, ON M5G 2C3" },
        { ocifId: "RP-C", profileName: "Role Player C", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Authorized Signatory of ABC Ltd.", address: "33 Dundas St W, Toronto, ON M5G 2C3" },
        { ocifId: "ABCLtd", profileName: "ABC Ltd.", legalHoldStatus: "N/A", holdName: "", lifecycle: "Active Customer", role: "Owner", address: "33 Dundas St W, Toronto, ON M5G 2C3" }
      ]
    }
  ];

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
      suppressMenu: true
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      minWidth: 360,
      flex: 2.2,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params: any) => `<span class="font-medium">${params.value}</span>`
      }
    },
    {
      headerName: 'Proxy OCIF ID',
      field: 'ocifId',
      width: 145
    },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      width: 165,
      cellRenderer: LegalHoldBadgeComponent
    },
    {
      headerName: 'Legal Hold Name',
      field: 'holdName',
      width: 185
    },
    {
      headerName: 'Customer Lifecycle Status',
      field: 'lifecycle',
      width: 175
    },
    {
      headerName: 'Role Type',
      field: 'role',
      minWidth: 260,
      flex: 1.4
    },
    {
      headerName: 'Address',
      field: 'address',
      minWidth: 310,
      flex: 1.8
    }
  ];

  gridOptions: GridOptions = {
    treeData: true,
    treeDataChildrenField: 'children',
    getRowId: (params) => params.data.ocifId,
    rowSelection: { mode: 'multiple', groupSelects: 'descendants' },
    groupDefaultExpanded: 1,
    suppressRowClickSelection: true,
    animateRows: true,
    icons: {
      treeClosed: '<span style="font-size:18px">▼</span>',
      treeOpen: '<span style="font-size:18px">▲</span>'
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

<app-entity-legal-hold-grid></app-entity-legal-hold-grid>