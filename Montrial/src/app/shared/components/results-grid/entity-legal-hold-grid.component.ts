// entity-legal-hold-grid.component.ts
import { Component } from '@angular/core';
import { ColDef, GridApi, GridOptions, ICellRendererParams, RowNode } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

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

      <div class="flex items-center gap-2 flex-1">
        <span class="text-sm font-medium text-gray-700">Showing:</span>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let f of showingFilters" class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-full">
            {{ f }}
          </span>
        </div>
      </div>

      <button (click)="debugSelectParent()" class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md">
        Debug: Select Corp 5
      </button>
    </div>

    <ag-grid-angular
      #agGrid
      class="ag-theme-alpine w-full border border-gray-200 rounded-b-xl"
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
      --ag-header-background-color: #f8fafc;
      --ag-selected-row-background-color: #eff6ff;
    }
    .ag-pinned-left-cols-container {
      box-shadow: 2px 0 5px rgba(0,0,0,0.08);
    }
    .ag-row-level-0.ag-row-expanded {
      background-color: #f0f7ff !important;
    }
  `]
})
export class EntityLegalHoldGridComponent {
  private gridApi!: GridApi;
  private gridColumnApi: any;

  showingFilters = ['Profile Name', 'Proxy OCIF ID', 'Legal Hold Status', 'Legal Hold Name', 'Role Type', 'Address'];

  rowData = [
    { path: ['Corp 2'], ocifId: 'corp-2', profileName: 'Corp 2', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 3'], ocifId: 'corp-3', profileName: 'Corp 3', legalHoldStatus: 'LEGAL HOLD', holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 4'], ocifId: 'corp-4', profileName: 'Corp 4', legalHoldStatus: 'LEGAL HOLD', holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 5'], ocifId: 'corp-5', profileName: 'Corp 5', legalHoldStatus: 'LEGAL HOLD', holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 5', 'Role Player F'], ocifId: 'rp-f', profileName: 'Role Player F', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 5', 'Role Player G'], ocifId: 'rp-g', profileName: 'Role Player G', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 5', 'Role Player D'], ocifId: 'rp-d', profileName: 'Role Player D', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 5', 'Role Player E'], ocifId: 'rp-e', profileName: 'Role Player E', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory of ABC Ltd.', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
    { path: ['Corp 5', 'ABC Ltd.'], ocifId: 'abc-ltd', profileName: 'ABC Ltd.', legalHoldStatus: 'N/A', holdName: '', lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W, Toronto, ON M5G 2C3' }
  ];

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 48,
      pinned: 'left',
      lockPosition: true,
      suppressHeaderMenuButton: true
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      minWidth: 340,
      flex: 2,
      pinned: 'left',
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: { suppressCount: true }
    },
    { headerName: 'Proxy OCIF ID', field: 'ocifId', width: 140 },
    { headerName: 'Legal Hold Status', field: 'legalHoldStatus', width: 160, cellRenderer: LegalHoldBadgeComponent },
    { headerName: 'Legal Hold Name', field: 'holdName', width: 180 },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 170 },
    { headerName: 'Role Type', field: 'role', minWidth: 240, flex: 1.4 },
    { headerName: 'Address', field: 'address', minWidth: 300, flex: 1.8 }
  ];

  gridOptions: GridOptions = {
    treeData: true,
    getDataPath: data => data.path,
    getRowId: params => params.data.ocifId,

    rowSelection: {
      mode: 'multiRow',
      groupSelects: 'descendants',
      headerCheckbox: true,
      checkboxes: true
    },

    groupDefaultExpanded: 1,
    suppressRowClickSelection: true,
    animateRows: true,

    // Performance
    rowBuffer: 20,
    debounceVerticalScrollbar: true,
    suppressAnimationFrame: true,

    onGridReady: params => {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    },

    onSelectionChanged: () => {
      console.log('Selection changed');
      const selected = this.gridApi.getSelectedRows().map(r => r.profileName);
      console.log('Selected:', selected);
    }
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  // Debug: select parent and verify children get selected
  debugSelectParent() {
    if (!this.gridApi) return;

    const node = this.gridApi.getRowNode('corp-5');
    if (node) {
      node.setSelected(true, true);  // select + sourceEvent = true to trigger cascade
      this.gridApi.refreshCells({ force: true });
      console.log('Corp 5 selected programmatically – children should be checked');
    }
  }
}