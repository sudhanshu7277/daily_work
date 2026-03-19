import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColDef } from 'ag-grid-community';
import { LegalHoldDataService } from '../../services/legal-hold-data.service';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();

  private gridApi!: GridApi;
  rowData: any[] = [];
  private allData: any[] = [];
  private selectionInProgress = false;

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left'
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      cellStyle: (params: any) => ({
        'padding-left': `${(params.data?.level || 0) * 32}px !important`
      }),
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const chevron = params.data.isParent ? (params.data.isExpanded ? '▲' : '▼') : '';
        return `<span style="display:flex;align-items:center;font-weight:600;cursor:pointer;">${chevron} ${params.value}</span>`;
      }
    },
    { headerName: 'Proxy OCIF ID', field: 'ocifId', sortable: true },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      cellRenderer: (params: any) => params.value === 'LEGAL HOLD'
        ? '<span class="status-pill">LEGAL HOLD</span>'
        : (params.value || 'N/A')
    },
    { headerName: 'Legal Hold Name', field: 'holdName' },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle' },
    { headerName: 'Role Type', field: 'role' },
    { headerName: 'Address', field: 'address' }
  ];

  constructor(private legalHoldDataService: LegalHoldDataService) {}

  ngOnInit() {
    this.allData = this.legalHoldDataService.getMockData();
    this.assignLevels(this.allData);
    this.rowData = this.buildVisibleRows(this.allData);
  }

  private assignLevels(data: any[], level = 0) {
    data.forEach(item => {
      item.level = level;
      item.isSelected = false;
      item.isExpanded = false; // ← All start collapsed
      if (item.children?.length) this.assignLevels(item.children, level + 1);
    });
  }

  private buildVisibleRows(data: any[], visible: any[] = []) {
    data.forEach(item => {
      visible.push(item);
      if (item.isParent && item.isExpanded && item.children?.length) {
        this.buildVisibleRows(item.children, visible);
      }
    });
    return visible;
  }

  onGridReady(params: any) { this.gridApi = params.api; }

  onCellClicked(params: any) {
    if (params.colDef.field === 'profileName' && params.data?.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.rowData = this.buildVisibleRows(this.allData);
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  public getRowClass = (params: any) => params.data?.level > 0 ? 'indented-child-row' : '';

  onSelectionChanged() {
    if (this.selectionInProgress) return;
    this.selectionInProgress = true;

    this.syncAndPropagate();

    this.selectionInProgress = false;
    console.log('Cluster selected - selected rows:', this.gridApi.getSelectedRows());
    this.selectionChanged.emit(this.gridApi.getSelectedRows());
  }

  private syncAndPropagate() {
    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) item.isSelected = node.isSelected();
    });

    this.forceDown(this.allData);
    this.forceUp(this.allData);

    this.rowData = this.buildVisibleRows(this.allData);
    this.gridApi.setGridOption('rowData', this.rowData);

    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) node.setSelected(item.isSelected, false);
    });
  }

  private findItemByOcifId(data: any[], ocifId: string): any {
    for (const item of data) {
      if (item.ocifId === ocifId) return item;
      if (item.children) {
        const found = this.findItemByOcifId(item.children, ocifId);
        if (found) return found;
      }
    }
    return null;
  }

  private forceDown(data: any[]) {
    data.forEach(item => {
      if (item.isParent && item.isSelected) {
        this.propagateDown(item.children || [], true);
      }
    });
  }

  private propagateDown(children: any[], selected: boolean) {
    children.forEach(child => {
      child.isSelected = selected;
      if (child.isParent) this.propagateDown(child.children || [], selected);
    });
  }

  private forceUp(data: any[]) {
    data.forEach(item => {
      if (item.isParent) {
        item.isSelected = this.hasAnyDescendantSelected(item);
      }
    });
  }

  private hasAnyDescendantSelected(item: any): boolean {
    if (!item.children?.length) return item.isSelected;
    return item.children.some((child: any) =>
      child.isSelected || this.hasAnyDescendantSelected(child)
    );
  }

  onPaginationChanged() {}
}
// html//

<div class="grid-card-container grid-container-with-footer">
  <ag-grid-angular
    class="ag-theme-alpine bmo-grid"
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [rowSelection]="'multiple'"
    [pagination]="true"
    [paginationPageSize]="pageSize"
    [suppressPaginationPanel]="true"
    [suppressRowClickSelection]="true"
    [getRowClass]="getRowClass"
    (gridReady)="onGridReady($event)"
    (selectionChanged)="onSelectionChanged()"
    (paginationChanged)="onPaginationChanged()"
    (cellClicked)="onCellClicked($event)">
  </ag-grid-angular>
</div>
// end of html//

//scss code //
::ng-deep .ag-theme-alpine.bmo-grid {
  .status-pill {
    background-color: #1e1e1e !important;
    color: #ffffff !important;
    padding: 4px 12px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }

  /* Parent rows = light blue */
  .parent-row {
    background-color: #f0f7ff !important;
  }

.indented-child-row {
    background-color: #f0f7ff !important;
    border-bottom: 1px solid #e5e5e5 !important;
  }

  .indented-child-row .ag-cell {
    position: relative;
  }

  // .indented-child-row .ag-cell:not([col-id="0"]) {  /* all cells except checkbox */
  //   background-color: #f0f7ff !important;
  //   border: 1px solid #e5e5e5 !important;
  //   border-left: none !important;
  //   border-right: none !important;
  //   margin: 0 8px !important; /* slight inset to make it look like a card */
  //   border-radius: 4px !important;
  // }

 .ag-cell[col-id="profileName"] {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
}

.grid-card-container {
  width: 100%;
  height: calc(100vh - 250px);
  border: 1px solid #e2e2e2;
  background: #fff;
}
//enc of scss//