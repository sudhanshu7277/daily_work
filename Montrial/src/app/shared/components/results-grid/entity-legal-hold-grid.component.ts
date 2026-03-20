// entity-legal-hold-grid.component.ts
import { Component } from '@angular/core';
import { ColDef, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

// ─── Custom LEGAL HOLD Badge Renderer ───────────────────────────────────────
@Component({
  selector: 'legal-hold-badge',
  standalone: true,
  template: `
    <ng-container *ngIf="value === 'LEGAL HOLD'; else na">
      <span class="inline-flex items-center px-3 py-0.5 text-xs font-semibold text-white bg-blue-800 rounded-full">
        LEGAL HOLD
      </span>
    </ng-container>
    <ng-template #na>
      <span class="text-gray-500 text-sm">N/A</span>
    </ng-template>
  `
})
export class LegalHoldBadgeComponent {
  value!: string;
  agInit(params: ICellRendererParams) { this.value = params.value; }
  refresh(params: ICellRendererParams) { this.value = params.value; return true; }
}

// ─── Main Component ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-entity-legal-hold-grid',
  standalone: true,
  imports: [AgGridAngular, LegalHoldBadgeComponent],
  template: `
    <ag-grid-angular
      class="ag-theme-alpine h-full w-full border border-gray-200 rounded-md overflow-hidden"
      style="height: 700px;"
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
      --ag-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --ag-foreground-color: #111827;
      --ag-background-color: #ffffff;
      --ag-header-background-color: #f3f4f6;
      --ag-header-cell-moving-background-color: #e5e7eb;
      --ag-selected-row-background-color: #eff6ff;
      --ag-row-hover-color: #f9fafb;
    }

    /* Slightly bolder expand icons */
    .ag-theme-alpine .ag-group-expanded .ag-group-contract-icon,
    .ag-theme-alpine .ag-group-contracted .ag-group-expand-icon {
      font-weight: 700;
      color: #374151;
      font-size: 1.1rem;
    }

    /* Indentation alignment */
    .ag-theme-alpine .ag-group-cell {
      padding-left: 8px !important;
    }

    /* Light bg for expanded top-level parents */
    .ag-row.ag-row-level-0.ag-row-expanded {
      background-color: #f0f7ff !important;
    }
  `]
})
export class EntityLegalHoldGridComponent {
  private gridApi!: GridApi;

  // Your cleaned dummy data (nested children structure)
  rowData = [
    {
      ocifId: "C2001",
      profileName: "Corp Alpha",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: [
        {
          ocifId: "RP-A1",
          profileName: "Role Player A1",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signatory",
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          children: [
            {
              ocifId: "SUB-X1",
              profileName: "Sub Entity X1",
              legalHoldStatus: "N/A",
              holdName: "",
              lifecycle: "Active Customer",
              role: "Owner",
              address: "33 Dundas St W, Toronto, ON M5G 2C3"
            }
          ]
        }
      ]
    },
    {
      ocifId: "C2002",
      profileName: "Corp Beta",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: [
        {
          ocifId: "RP-B1",
          profileName: "Role Player B1",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signatory",
          address: "33 Dundas St W, Toronto, ON M5G 2C3"
        }
      ]
    },
    {
      ocifId: "C1001",
      profileName: "Corp A",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      ocifId: "C1002",
      profileName: "Corp B",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3"
    },
    {
      ocifId: "C3001",
      profileName: "Corp Deep Root",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: [
        {
          ocifId: "L1-001",
          profileName: "Level 1 Entity",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signatory",
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          children: [
            // ... (you can keep expanding as in your original deep example)
          ]
        }
      ]
    }
    // Add more top-level entries as needed
  ];

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      pinned: 'left',
      lockPosition: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      minWidth: 340,
      flex: 2,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,           // no (x children) count
        innerRenderer: (params: any) => `<span class="font-medium">${params.value}</span>`
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
      minWidth: 220,
      flex: 1.3
    },
    {
      headerName: 'Address',
      field: 'address',
      minWidth: 280,
      flex: 1.8
    }
  ];

  gridOptions: GridOptions = {
    treeData: true,
    treeDataChildrenField: 'children',
    getRowId: params => params.data.ocifId,
    rowSelection: { mode: 'multiple', groupSelects: 'descendants' },
    groupDefaultExpanded: 1,               // expand first level by default
    suppressRowClickSelection: true,
    animateRows: true,
    enableCellTextSelection: true,
    onGridReady: params => {
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    }
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
  }
}


// usage

<app-entity-legal-hold-grid></app-entity-legal-hold-grid>