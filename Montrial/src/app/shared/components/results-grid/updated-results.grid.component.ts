import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColDef, GridReadyEvent, CellClickedEvent, SelectionChangedEvent, RowStyle } from 'ag-grid-community';

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
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 380,
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

  constructor() { }

  ngOnInit() {
    this.allData = this.getMockData();
    this.assignLevels(this.allData);
    this.rowData = this.buildVisibleRows(this.allData);
  }

  private assignLevels(data: any[], level = 0) {
    data.forEach(item => {
      item.level = level;
      item.isSelected = false;
      // Set default expanded states here if needed
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

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onCellClicked(params: CellClickedEvent) {
    if (params.colDef.field === 'profileName' && params.data?.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.rowData = this.buildVisibleRows(this.allData);
      this.gridApi.setRowData(this.rowData);
    }
  }

  getRowClass = (params: any) => params.data?.level > 0 ? 'indented-child-row' : '';

  // This is the key to indent checkbox along with the row profile name
  getRowStyle = (params: any): RowStyle => {
    return {
      '--level': params.data?.level || 0
    };
  };

  onSelectionChanged(event: SelectionChangedEvent) {
    if (this.selectionInProgress) return;
    this.selectionInProgress = true;

    this.syncSelectionWithModel();

    this.selectionInProgress = false;

    const selectedRows = this.gridApi.getSelectedRows();
    const cluster = this.getClusterDetails(selectedRows);
    console.log('Cluster selected:', cluster);

    this.selectionChanged.emit(selectedRows);
  }

  private syncSelectionWithModel() {
    // Sync grid selection to data model
    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) item.isSelected = node.isSelected();
    });

    // Propagate selection down and up for parents and children
    this.propagateDown(this.allData);
    this.propagateUp(this.allData);

    // Refresh visible rows and update grid data
    this.rowData = this.buildVisibleRows(this.allData);
    this.gridApi.setRowData(this.rowData);

    // Reapply selection in grid according to model (no event firing)
    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) node.setSelected(item.isSelected, false);
    });
  }

  private propagateDown(data: any[]) {
    data.forEach(item => {
      if (item.isParent && item.isSelected) {
        this.setChildrenSelection(item.children, true);
      } else if (item.isParent) {
        this.setChildrenSelection(item.children, false);
      }
      if (item.children?.length) this.propagateDown(item.children);
    });
  }

  private setChildrenSelection(children: any[], selected: boolean) {
    children.forEach(child => {
      child.isSelected = selected;
      if (child.isParent) this.setChildrenSelection(child.children || [], selected);
    });
  }

  private propagateUp(data: any[]) {
    data.forEach(item => {
      if (item.isParent && item.children?.length) {
        // A parent is selected if all children are selected
        const allChildrenSelected = item.children.every((child: any) =>
          child.isSelected && (!child.isParent || this.allDescendantsSelected(child))
        );
        item.isSelected = allChildrenSelected;
        this.propagateUp(item.children);
      }
    });
  }

  private allDescendantsSelected(item: any): boolean {
    if (!item.children || item.children.length === 0) return item.isSelected;
    return item.children.every((child: any) =>
      child.isSelected && (!child.isParent || this.allDescendantsSelected(child))
    );
  }

  private findItemByOcifId(data: any[], ocifId: string): any | null {
    for (const item of data) {
      if (item.ocifId === ocifId) return item;
      if (item.children?.length) {
        const found = this.findItemByOcifId(item.children, ocifId);
        if (found) return found;
      }
    }
    return null;
  }

  private findParentOfItem(data: any[], childOcifId: string, parent: any = null): any | null {
    for (const item of data) {
      if (item.ocifId === childOcifId) {
        return parent;
      }
      if (item.children?.length) {
        const found = this.findParentOfItem(item.children, childOcifId, item);
        if (found) return found;
      }
    }
    return null;
  }

  private getClusterDetails(selectedRows: any[]): any[] {
    const clusterMap = new Map<string, any>();

    const addItemAndChildren = (item: any) => {
      if (!clusterMap.has(item.ocifId)) {
        clusterMap.set(item.ocifId, item);
        if (item.children) item.children.forEach(addItemAndChildren);
      }
    };

    selectedRows.forEach(row => {
      // Add parent chain and children
      let current = this.findItemByOcifId(this.allData, row.ocifId);
      while (current) {
        addItemAndChildren(current);
        current = this.findParentOfItem(this.allData, current.ocifId);
      }
    });

    return Array.from(clusterMap.values());
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
    [getRowStyle]="getRowStyle"
    (gridReady)="onGridReady($event)"
    (selectionChanged)="onSelectionChanged($event)"
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

  /* Indented rows - light blue background + thin grey line */
  .indented-child-row {
    background-color: #f0f7ff !important;
    border-bottom: 1px solid #e5e5e5 !important;
  }

  /* Profile Name column styles for checkbox + text indentation */
  .ag-cell[col-id="profileName"] {
    display: flex;
    align-items: center;
    padding-left: 0 !important;
  }

  /* Indent checkboxes by level */
  .ag-cell[col-id="profileName"] .ag-checkbox-input {
    margin-left: calc(var(--level) * 32px + 8px) !important;
  }

  /* Indent profile name text by level */
  .ag-cell[col-id="profileName"] span {
    margin-left: calc(var(--level) * 32px) !important;
  }

  /* Prevent horizontal scrollbar caused by padding */
  .ag-center-cols-container {
    padding-right: 0 !important;
  }
}

/* Container styling */
.grid-card-container {
  width: 100%;
  height: calc(100vh - 250px);
  border: 1px solid #e2e2e2;
  background: #fff;
}

//enc of scss//