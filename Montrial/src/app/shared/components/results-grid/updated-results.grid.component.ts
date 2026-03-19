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
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 380,
      cellStyle: (params: any) => {
        const level = params.data?.level || 0;
        // Indent the entire cell (including checkbox) by using paddingLeft on the cell
        // The checkbox itself is inline so this shifts both checkbox + text together
        return {
          'padding-left': `${8 + level * 32}px !important`
        };
      },
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const level = params.data.level || 0;
        const chevron = params.data.isParent
          ? `<span class="chevron-icon">${params.data.isExpanded ? '▲' : '▼'}</span>`
          : `<span class="chevron-placeholder"></span>`;
        return `<span style="display:flex;align-items:center;gap:4px;font-weight:600;cursor:${params.data.isParent ? 'pointer' : 'default'};">${chevron}${params.value}</span>`;
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
      // Only toggle expand when clicking the chevron / text area, not the checkbox
      const target = params.event?.target as HTMLElement;
      if (target?.closest('.ag-selection-checkbox')) return;
 
      params.data.isExpanded = !params.data.isExpanded;
      this.rowData = this.buildVisibleRows(this.allData);
      this.gridApi.setGridOption('rowData', this.rowData);
 
      // Re-apply selection state after row rebuild
      this.applySelectionStateToGrid();
    }
  }
 
  public getRowClass = (params: any) => {
    const level = params.data?.level || 0;
    if (level === 0) return '';
    return `indented-child-row level-${level}`;
  }
 
  onSelectionChanged() {
    if (this.selectionInProgress) return;
    this.selectionInProgress = true;
 
    // Step 1: Read current UI selection into data model
    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) item.isSelected = node.isSelected();
    });
 
    // Step 2: Cascade down — if parent selected, select all children
    this.cascadeDown(this.allData);
 
    // Step 3: Bubble up — if ALL children selected, select parent
    this.bubbleUp(this.allData);
 
    // Step 4: Re-apply selection state back to grid nodes
    this.applySelectionStateToGrid();
 
    this.selectionInProgress = false;
 
    // Step 5: Console log cluster-aware selection
    const selected = this.gridApi.getSelectedRows();
    this.logClusterSelection(selected);
    this.selectionChanged.emit(selected);
  }
 
  private applySelectionStateToGrid() {
    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) node.setSelected(item.isSelected, false, true);
    });
  }
 
  private cascadeDown(data: any[]) {
    data.forEach(item => {
      if (item.isParent && item.children?.length) {
        if (item.isSelected) {
          // Parent selected: force all descendants selected
          this.propagateDown(item.children, true);
        } else {
          // Parent not selected: recurse to handle sub-parents
          this.cascadeDown(item.children);
        }
      }
    });
  }
 
  private propagateDown(children: any[], selected: boolean) {
    children.forEach(child => {
      child.isSelected = selected;
      if (child.isParent && child.children?.length) {
        this.propagateDown(child.children, selected);
      }
    });
  }
 
  private bubbleUp(data: any[]): boolean {
    // Returns true if all items in this array are selected
    let allSelected = data.length > 0;
    data.forEach(item => {
      if (item.isParent && item.children?.length) {
        const childrenAllSelected = this.bubbleUp(item.children);
        if (childrenAllSelected) {
          item.isSelected = true;
        }
      }
      if (!item.isSelected) allSelected = false;
    });
    return allSelected;
  }
 
  /**
   * Finds the root-level cluster for a given item and logs it with all descendants.
   */
  private logClusterSelection(selected: any[]) {
    if (selected.length === 0) {
      console.log('Selection cleared');
      return;
    }
 
    // Find unique clusters (root-level parents) involved in the selection
    const involvedClusters = new Set<any>();
    const standaloneRows: any[] = [];
 
    selected.forEach(row => {
      const root = this.findRootCluster(this.allData, row.ocifId);
      if (root && root.isParent) {
        involvedClusters.add(root);
      } else {
        standaloneRows.push(row);
      }
    });
 
    if (involvedClusters.size > 0) {
      involvedClusters.forEach(cluster => {
        const clusterRows = this.collectAllDescendants(cluster);
        const selectedInCluster = clusterRows.filter(r => r.isSelected);
        console.log(`Cluster: "${cluster.profileName}" (${cluster.ocifId})`, {
          clusterRoot: cluster,
          allRowsInCluster: clusterRows,
          selectedRowsInCluster: selectedInCluster
        });
      });
    }
 
    if (standaloneRows.length > 0) {
      console.log('Standalone selected rows (no cluster):', standaloneRows);
    }
 
    console.log('All selected rows:', selected);
  }
 
  private findRootCluster(data: any[], ocifId: string): any {
    for (const item of data) {
      if (item.ocifId === ocifId) return item;
      if (item.children?.length) {
        const found = this.findRootCluster(item.children, ocifId);
        if (found) return item; // return root, not the found child
      }
    }
    return null;
  }
 
  private collectAllDescendants(item: any): any[] {
    const result: any[] = [item];
    (item.children || []).forEach((child: any) => {
      result.push(...this.collectAllDescendants(child));
    });
    return result;
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
 
  /* Child rows - light blue background */
  .indented-child-row {
    background-color: #f0f7ff !important;
    border-bottom: 1px solid #e5e5e5 !important;
  }
 
  /* Deeper nesting gets slightly deeper blue tint */
  .indented-child-row.level-2 {
    background-color: #e4f1fd !important;
  }
 
  .indented-child-row.level-3 {
    background-color: #d8ebfb !important;
  }
 
  .indented-child-row.level-4 {
    background-color: #cce4f9 !important;
  }
 
  .indented-child-row.level-5 {
    background-color: #c0ddf7 !important;
  }
 
  /* Profile name cell: shift the ENTIRE cell content (checkbox + text) by level */
  /* The cellStyle padding-left on the ColDef handles this, but we also need
     to ensure the checkbox renders inline with the text, not independently */
  .ag-cell[col-id="profileName"] {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: flex !important;
    align-items: center !important;
  }
 
  /* Make sure the checkbox and the cell content are in a single flex row */
  .ag-cell[col-id="profileName"] .ag-cell-wrapper {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    overflow: hidden !important;
  }
 
  .ag-cell[col-id="profileName"] .ag-selection-checkbox {
    /* Checkbox stays inline, indentation comes from the parent cell padding */
    flex-shrink: 0;
  }
 
  .chevron-icon {
    font-size: 10px;
    color: #0050c8;
    margin-right: 4px;
  }
 
  .chevron-placeholder {
    display: inline-block;
    width: 14px; /* Same width as chevron to keep text aligned */
  }
}
 
.grid-card-container {
  width: 100%;
  height: calc(100vh - 250px);
  border: 1px solid #e2e2e2;
  background: #fff;
}
//enc of scss//