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
  pageSize = 10;
  private allData: any[] = [];
  private selectionInProgress = false;

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 200,
      pinned: 'left',
      cellStyle: (params: any) => ({
        'padding-left': `${(params.data?.level || 0) * 32}px !important`
      })
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const level = params.data.level ?? 0;
        const chevron = params.data.isParent 
          ? (params.data.isExpanded ? '▲' : '▼') 
          : '';
        return `<span style="padding-left: ${level * 32}px; display: flex; align-items: center; font-weight: 600; cursor: pointer;">${chevron} ${params.value}</span>`;
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
      item.isExpanded = item.isExpanded ?? false;
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

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onCellClicked(params: any) {
    if (params.colDef.field === 'profileName' && params.data?.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.rowData = this.buildVisibleRows(this.allData);
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  public getRowClass = (params: any) => params.data?.level > 0 ? 'indented-child-row' : '';

  // ==================== HIERARCHICAL SELECTION ====================
  onSelectionChanged() {
    if (this.selectionInProgress) return;
    this.selectionInProgress = true;
    this.syncAndPropagate();
    this.selectionInProgress = false;
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

  // ==================== PAGINATION (added to fix your error) ====================
  onPaginationChanged() {
    // Add your existing pagination logic here if you need total pages, current page, etc.
    // For now it's just a stub so the HTML event binds cleanly
  }
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

/* ============================================= */
/* RESULTS GRID - Figma-Perfect Styling          */
/* ============================================= */

::ng-deep .ag-theme-alpine.bmo-grid {
  
  /* LEGAL HOLD Pill */
  .status-pill {
    background-color: #1e1e1e !important;
    color: #ffffff !important;
    padding: 4px 12px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px !important;
    display: inline-block !important;
  }

  /* Indented child rows - light blue + light grey border */
  .indented-child-row {
    background-color: #f0f7ff !important;
    border-bottom: 1px solid #e5e5e5 !important;
  }

  .indented-child-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #d0e6ff;
  }

  .ag-cell[col-id="profileName"] {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .ag-cell[col-id="profileName"] span {
    font-size: 14px;
    line-height: 1.2;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ag-row[role="row"].ag-row-level-0.ag-row-expanded {
    background-color: #f8fbff !important;
  }

  .ag-header-cell {
    font-weight: 600;
    color: #333333;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e5e5;
  }
}

.grid-card-container {
  width: 100%;
  height: calc(100vh - 250px);
  border: 1px solid #e2e2e2;
  background: #fff;
}

.grid-container-with-footer {
  display: flex;
  flex-direction: column;
}
//enc of scss//