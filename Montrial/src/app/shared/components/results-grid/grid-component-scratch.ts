<ag-grid-angular
  style="width: 100%; height: 800px;"
  class="ag-theme-alpine"
  [rowData]="rowData"
  [columnDefs]="columnDefs"
  [gridOptions]="gridOptions"
  (gridReady)="onGridReady($event)">
</ag-grid-angular>

// entity-hierarchy-grid.component.ts
import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

// === CUSTOM BADGE RENDERER (exact match to Figma blue pill) ===
@Component({
  selector: 'legal-hold-renderer',
  standalone: true,
  template: `
    <span *ngIf="params.value === 'LEGAL HOLD'" 
          class="px-3 py-1 bg-[#1E40AF] text-white text-xs font-semibold rounded-full inline-block">
      LEGAL HOLD
    </span>
    <span *ngIf="params.value !== 'LEGAL HOLD'" class="text-gray-500">N/A</span>
  `
})
export class LegalHoldRendererComponent {
  params: ICellRendererParams;
  agInit(params: ICellRendererParams) { this.params = params; }
  refresh(params: ICellRendererParams) { this.params = params; return true; }
}

// === MAIN COMPONENT ===
@Component({
  selector: 'app-entity-hierarchy-grid',
  standalone: true,
  imports: [AgGridAngular, LegalHoldRendererComponent],
  templateUrl: './entity-hierarchy-grid.component.html'
})
export class EntityHierarchyGridComponent implements OnInit {
  private api!: GridApi;

  // CLEANED & ENHANCED DUMMY DATA (based on your paste + all screenshots)
  rowData: any[] = [
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
              address: "33 Dundas St W, Toronto, ON M5G 2C3",
              children: []
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
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          children: []
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
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: []
    },
    {
      ocifId: "C1002",
      profileName: "Corp B",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      children: []
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
            {
              ocifId: "L2-001",
              profileName: "Level 2 Sub",
              legalHoldStatus: "N/A",
              holdName: "",
              lifecycle: "Active Customer",
              role: "Owner",
              address: "33 Dundas St W, Toronto, ON M5G 2C3",
              children: [
                {
                  ocifId: "L3-001",
                  profileName: "Level 3 Deep",
                  legalHoldStatus: "LEGAL HOLD",
                  holdName: "Project Alpha",
                  lifecycle: "Active Customer",
                  role: "Authorized Signatory",
                  address: "33 Dundas St W, Toronto, ON M5G 2C3",
                  children: [
                    {
                      ocifId: "L4-001",
                      profileName: "Level 4 Sub",
                      legalHoldStatus: "N/A",
                      holdName: "",
                      lifecycle: "Active Customer",
                      role: "Owner",
                      address: "33 Dundas St W, Toronto, ON M5G 2C3",
                      children: [
                        {
                          ocifId: "L5-001",
                          profileName: "Level 5 Deepest",
                          legalHoldStatus: "N/A",
                          holdName: "",
                          lifecycle: "Active Customer",
                          role: "Authorized Signatory",
                          address: "33 Dundas St W, Toronto, ON M5G 2C3",
                          children: []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  columnDefs: ColDef[] = [
    {
      headerName: '',
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      pinned: 'left',
      lockPosition: true
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      flex: 1.8,
      minWidth: 380,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params: any) => params.value
      }
    },
    {
      headerName: 'Proxy OCIF ID',
      field: 'ocifId',
      width: 135
    },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      width: 155,
      cellRenderer: LegalHoldRendererComponent
    },
    {
      headerName: 'Legal Hold Name',
      field: 'holdName',
      width: 170
    },
    {
      headerName: 'Customer Lifecycle Status',
      field: 'lifecycle',
      width: 165
    },
    {
      headerName: 'Role Type',
      field: 'role',
      flex: 1.2,
      minWidth: 240
    },
    {
      headerName: 'Address',
      field: 'address',
      flex: 1.5,
      minWidth: 290
    }
  ];

  gridOptions: GridOptions = {
    treeData: true,
    treeDataChildrenField: 'children',           // ← Direct nested support (no flattening!)
    getRowId: (params) => params.data.ocifId,
    rowSelection: {
      mode: 'multiRow',
      groupSelects: 'descendants'               // ← EXACTLY your requirement
    },
    groupDefaultExpanded: 1,                     // expand first level (matches screenshots)
    suppressRowClickSelection: true,
    rowHeight: 52,
    headerHeight: 48,
    animateRows: true,
    icons: {
      treeClosed: '<span style="font-size:18px; font-weight:bold; color:#374151;">↓</span>',
      treeOpen: '<span style="font-size:18px; font-weight:bold; color:#374151;">↑</span>'
    },
    getRowStyle: (params) => {
      if (params.node.expanded && params.node.level === 0) {
        return { backgroundColor: '#f0f7ff' };   // light blue expanded parent (Figma style)
      }
      return undefined;
    },
    onGridReady: (params) => {
      this.api = params.api;
      this.api.sizeColumnsToFit();
    }
  };

  ngOnInit() {
    // Data is already in perfect nested format for treeDataChildrenField
  }

  onGridReady(params: any) {
    this.api = params.api;
  }
}