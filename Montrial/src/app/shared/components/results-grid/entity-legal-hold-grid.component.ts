// entity-legal-hold-grid.component.ts
import { Component } from '@angular/core';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

// LEGAL HOLD BADGE
@Component({
  selector: 'legal-hold-badge',
  standalone: true,
  template: `
    <ng-container *ngIf="value === 'LEGAL HOLD'; else na">
      <span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-[#1e3a8a] rounded-full">LEGAL HOLD</span>
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

// MAIN COMPONENT
@Component({
  selector: 'app-entity-legal-hold-grid',
  standalone: true,
  imports: [AgGridAngular, LegalHoldBadgeComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3 mb-4 bg-white p-4 rounded-t-xl border border-gray-200 border-b-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Search result filter</span>
        <select class="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
          <option>Select</option>
        </select>
      </div>

      <div class="flex-1 flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Showing:</span>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let f of visibleFilters" class="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-full">
            {{ f }}
          </span>
        </div>
      </div>

      <button (click)="forceSelectCorp5()" class="px-5 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md">
        Debug: Select Corp 5 Cluster
      </button>
    </div>

    <ag-grid-angular
      class="ag-theme-alpine w-full border border-gray-200 rounded-b-xl overflow-hidden"
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
      --ag-header-height: 44px;
      --ag-font-size: 14px;
      --ag-header-background-color: #f8fafc;
      --ag-selected-row-background-color: #eff6ff;
      --ag-row-hover-color: #f1f5f9;
    }
    .ag-pinned-left-cols-container { box-shadow: 3px 0 8px -3px rgba(0,0,0,0.1); }
    .ag-row-level-0.ag-row-expanded { background-color: #f0f7ff !important; }
    .ag-group-cell { font-weight: 500; padding-left: 8px !important; }
    .ag-group-expanded .ag-group-contract-icon,
    .ag-group-contracted .ag-group-expand-icon { font-size: 18px; color: #374151; }
  `]
})
export class EntityLegalHoldGridComponent {
  private gridApi!: GridApi;

  visibleFilters = ['Profile Name','Proxy OCIF ID','Legal Hold Status','Legal Hold Name','Customer Lifecycle Status','Role Type','Address'];

  rowData = [
    { id: 'corp2',  path: ['Corp 2'],       profileName: 'Corp 2',       ocifId: '1000-12345', legalHoldStatus: 'N/A',         holdName: '',          lifecycle: 'Active Customer', role: 'Owner',                          address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'corp3',  path: ['Corp 3'],       profileName: 'Corp 3',       ocifId: '1000-12345', legalHoldStatus: 'LEGAL HOLD',  holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner',                          address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'corp4',  path: ['Corp 4'],       profileName: 'Corp 4',       ocifId: '1000-12345', legalHoldStatus: 'LEGAL HOLD',  holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner',                          address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'corp5',  path: ['Corp 5'],       profileName: 'Corp 5',       ocifId: '1000-12345', legalHoldStatus: 'LEGAL HOLD',  holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner',                          address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'rp-f',   path: ['Corp 5','Role Player F'], profileName: 'Role Player F', ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'rp-g',   path: ['Corp 5','Role Player G'], profileName: 'Role Player G', ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'rp-d',   path: ['Corp 5','Role Player D'], profileName: 'Role Player D', ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'rp-e',   path: ['Corp 5','Role Player E'], profileName: 'Role Player E', ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'rp-a',   path: ['Corp 5','Role Player A'], profileName: 'Role Player A', ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Owner of ABC Ltd.',             address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'rp-b',   path: ['Corp 5','Role Player B'], profileName: 'Role Player B', ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'rp-c',   path: ['Corp 5','Role Player C'], profileName: 'Role Player C', ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { id: 'abc',    path: ['Corp 5','ABC Ltd.'],      profileName: 'ABC Ltd.',      ocifId: '1000-12345', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Owner',                          address: '33 Dundas St W, Toronto, ON M5G 2C3' }
  ];

  columnDefs: ColDef[] = [
    { headerName: '', checkboxSelection: true, headerCheckboxSelection: true, width: 48, pinned: 'left', lockPosition: true },
    { headerName: 'Profile Name', field: 'profileName', minWidth: 340, flex: 2.2, cellRenderer: 'agGroupCellRenderer', cellRendererParams: { suppressCount: true } },
    { headerName: 'Proxy OCIF ID', field: 'ocifId', width: 145 },
    { headerName: 'Legal Hold Status', field: 'legalHoldStatus', width: 165, cellRenderer: LegalHoldBadgeComponent },
    { headerName: 'Legal Hold Name', field: 'holdName', width: 185 },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 175 },
    { headerName: 'Role Type', field: 'role', minWidth: 260, flex: 1.4 },
    { headerName: 'Address', field: 'address', minWidth: 320, flex: 1.8 }
  ];

  gridOptions: GridOptions = {
    treeData: true,
    getDataPath: data => data.path,
    getRowId: params => params.data.id,

    rowSelection: {
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
      groupSelects: 'descendants'          // ← Full cluster selection (both directions)
    },

    groupDefaultExpanded: 1,
    suppressRowClickSelection: true,
    animateRows: true,

    onGridReady: (params: GridReadyEvent) => {
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    },

    onSelectionChanged: () => {
      const selected = this.gridApi.getSelectedRows();
      console.group('✅ Selected Records');
      console.log('Total:', selected.length);
      if (selected.length) console.table(selected.map(r => ({ Profile: r.profileName, Role: r.role, Status: r.legalHoldStatus })));
      console.groupEnd();
    }
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  // Debug button — forces the entire Corp 5 cluster to be selected
  forceSelectCorp5() {
    const parent = this.gridApi.getRowNode('corp5');
    if (parent) {
      parent.setSelected(true, true);   // true = suppress event to avoid loop
      this.gridApi.refreshCells({ force: true });
      console.log('✅ Force-selected entire Corp 5 cluster');
    }
  }
}