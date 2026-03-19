import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColDef, GridOptions } from 'ag-grid-community';
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
      width: 340,
      cellStyle: (params: any) => {
        const level = params.data?.level || 0;
        // Indent the whole cell (checkbox + renderer) per nesting level
        return { 'padding-left': `${8 + level * 28}px` };
      },
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const isParent = params.data.isParent;
        const isExpanded = params.data.isExpanded;
 
        if (isParent) {
          const chevron = isExpanded
            ? `<svg class="chevron" width="12" height="8" viewBox="0 0 12 8"><path d="M1 7L6 2L11 7" stroke="#1a56db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
            : `<svg class="chevron" width="12" height="8" viewBox="0 0 12 8"><path d="M1 1L6 6L11 1" stroke="#1a56db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
          return `<span class="profile-cell parent-cell">${chevron}<span class="profile-name parent-name">${params.value}</span></span>`;
        }
 
        // Child / leaf row — show a small connector line for visual hierarchy
        return `<span class="profile-cell child-cell"><span class="child-connector"></span><span class="profile-name child-name">${params.value}</span></span>`;
      }
    },
    {
      headerName: 'Proxy OCIF ID',
      field: 'ocifId',
      sortable: false,
      width: 150
    },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      width: 175,
      cellRenderer: (params: any) =>
        params.value === 'LEGAL HOLD'
          ? `<span class="status-pill">LEGAL HOLD</span>`
          : `<span class="status-na">N/A</span>`
    },
    {
      headerName: 'Legal Hold Name',
      field: 'holdName',
      width: 175,
      cellRenderer: (params: any) => params.value || ''
    },
    {
      headerName: 'Customer Lifecycle Status',
      field: 'lifecycle',
      width: 195
    },
    {
      headerName: 'Role Type',
      field: 'role',
      width: 155
    },
    {
      headerName: 'Address',
      field: 'address',
      flex: 1,
      minWidth: 200
    }
  ];
 
  gridOptions: GridOptions = {
    rowHeight: 52,
    headerHeight: 44,
    suppressCellFocus: true,
    suppressMovableColumns: true,
    animateRows: false,
  };
 
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
    if (params.colDef.field !== 'profileName') return;
    if (!params.data?.isParent) return;
 
    // Guard: don't toggle expand when user clicked the checkbox
    const target = params.event?.target as HTMLElement;
    if (target?.closest('.ag-selection-checkbox') || target?.closest('.ag-checkbox-input-wrapper')) return;
 
    params.data.isExpanded = !params.data.isExpanded;
    this.rowData = this.buildVisibleRows(this.allData);
    this.gridApi.setGridOption('rowData', this.rowData);
 
    // Re-apply selection state after rowData refresh
    setTimeout(() => this.applyModelToGrid(), 0);
  }
 
  public getRowClass = (params: any): string => {
    const level = params.data?.level || 0;
    if (level === 0) return 'root-row';
    return `child-row level-${level}`;
  };
 
  // ─── SELECTION LOGIC ─────────────────────────────────────────────────────────
 
  onSelectionChanged() {
    if (this.selectionInProgress) return;
    this.selectionInProgress = true;
 
    try {
      // Step 1 — sync grid UI state → data model
      this.gridApi.forEachNode((node: any) => {
        const item = this.findByOcifId(this.allData, node.data.ocifId);
        if (item) item.isSelected = node.isSelected();
      });
 
      // Step 2 — cascade: checked parent → force-select all descendants
      this.cascadeDown(this.allData);
 
      // Step 3 — bubble: ALL children checked → auto-check parent
      this.bubbleUp(this.allData);
 
      // Step 4 — apply data model back to grid
      this.applyModelToGrid();
    } finally {
      this.selectionInProgress = false;
    }
 
    // Step 5 — log
    this.logSelection();
  }
 
  /**
   * If a parent node is selected, recursively select all its descendants.
   * If a parent is NOT selected, recurse into children to handle sub-parents.
   */
  private cascadeDown(nodes: any[]) {
    nodes.forEach(node => {
      if (node.isParent && node.children?.length) {
        if (node.isSelected) {
          this.selectAllDescendants(node.children, true);
        } else {
          this.cascadeDown(node.children);
        }
      }
    });
  }
 
  private selectAllDescendants(children: any[], selected: boolean) {
    children.forEach(child => {
      child.isSelected = selected;
      if (child.children?.length) {
        this.selectAllDescendants(child.children, selected);
      }
    });
  }
 
  /**
   * Post-order traversal.
   * Returns true if EVERY node in the given array (and their descendants) is selected.
   * Side-effect: if all children of a parent are selected, marks the parent selected.
   */
  private bubbleUp(nodes: any[]): boolean {
    if (!nodes.length) return true;
 
    let allSelected = true;
 
    nodes.forEach(node => {
      if (node.isParent && node.children?.length) {
        const childrenAllSelected = this.bubbleUp(node.children);
        if (childrenAllSelected) {
          node.isSelected = true;
        }
      }
      if (!node.isSelected) allSelected = false;
    });
 
    return allSelected;
  }
 
  /** Push data-model isSelected values back into the AG Grid row nodes */
  private applyModelToGrid() {
    this.gridApi.forEachNode((node: any) => {
      const item = this.findByOcifId(this.allData, node.data.ocifId);
      if (item) {
        // 3rd arg = suppressFinishActions prevents recursive selectionChanged
        node.setSelected(item.isSelected, false, true);
      }
    });
  }
 
  // ─── LOGGING ─────────────────────────────────────────────────────────────────
 
  private logSelection() {
    const selected = this.gridApi.getSelectedRows();
 
    if (selected.length === 0) {
      console.log('%c[Grid] All deselected', 'color:#888;font-style:italic');
      this.selectionChanged.emit([]);
      return;
    }
 
    // Map selected rows to their root clusters
    const clusterMap = new Map<string, { root: any; selectedRows: any[] }>();
    const standalone: any[] = [];
 
    selected.forEach(row => {
      const root = this.findRootOf(this.allData, row.ocifId);
      if (root && root.children?.length) {
        if (!clusterMap.has(root.ocifId)) {
          clusterMap.set(root.ocifId, { root, selectedRows: [] });
        }
        clusterMap.get(root.ocifId)!.selectedRows.push(row);
      } else {
        standalone.push(row);
      }
    });
 
    console.groupCollapsed(
      `%c[Grid Selection] ${selected.length} row(s) selected`,
      'color:#1a56db;font-weight:700;font-size:13px'
    );
 
    clusterMap.forEach(({ root, selectedRows }) => {
      const allInCluster = this.collectAll(root);
      console.groupCollapsed(
        `%c📁 Cluster: "${root.profileName}" (${root.ocifId})  —  ${selectedRows.length} / ${allInCluster.length} rows selected`,
        'color:#065f46;font-weight:600'
      );
      console.table(selectedRows.map(r => ({
        ocifId: r.ocifId,
        profileName: r.profileName,
        level: r.level,
        role: r.role,
        legalHoldStatus: r.legalHoldStatus
      })));
      console.log('Full cluster (all rows):', allInCluster);
      console.groupEnd();
    });
 
    if (standalone.length) {
      console.groupCollapsed(
        `%c📄 Standalone rows (${standalone.length})`,
        'color:#7c3aed;font-weight:600'
      );
      console.table(standalone.map(r => ({
        ocifId: r.ocifId,
        profileName: r.profileName,
        legalHoldStatus: r.legalHoldStatus
      })));
      console.groupEnd();
    }
 
    console.log('► All selected rows:', selected);
    console.groupEnd();
 
    this.selectionChanged.emit(selected);
  }
 
  // ─── TREE UTILITIES ───────────────────────────────────────────────────────────
 
  private findByOcifId(nodes: any[], ocifId: string): any {
    for (const node of nodes) {
      if (node.ocifId === ocifId) return node;
      if (node.children?.length) {
        const found = this.findByOcifId(node.children, ocifId);
        if (found) return found;
      }
    }
    return null;
  }
 
  /** Returns the TOP-LEVEL root item that contains (or is) the given ocifId */
  private findRootOf(nodes: any[], ocifId: string): any {
    for (const node of nodes) {
      if (node.ocifId === ocifId) return node;
      if (node.children?.length && this.findByOcifId(node.children, ocifId)) {
        return node;
      }
    }
    return null;
  }
 
  /** Collect a node and every descendant into a flat array */
  private collectAll(node: any): any[] {
    const result: any[] = [node];
    (node.children || []).forEach((c: any) => result.push(...this.collectAll(c)));
    return result;
  }
 
  onPaginationChanged() {}
}

// html//

<div class="grid-card-container grid-container-with-footer">
  <ag-grid-angular
    class="ag-theme-alpine bmo-grid"
    style="width: 100%; height: 100%;"
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [gridOptions]="gridOptions"
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
 
.grid-card-container {
  width: 100%;
  height: calc(100vh - 250px);
  border: 1px solid #dde1e8;
  border-radius: 6px;
  background: #ffffff;
  overflow: hidden;
}
 
// ─── AG Grid Theme Overrides ─────────────────────────────────────────────────
 
::ng-deep .ag-theme-alpine.bmo-grid {
 
  // ── Base font & colours ────────────────────────────────────────────────────
  font-family: 'BMO Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1a1a2e;
 
  .ag-root-wrapper {
    border: none !important;
    border-radius: 0 !important;
  }
 
  // ── Header ──────────────────────────────────────────────────────────────────
  .ag-header {
    background-color: #f4f5f7 !important;
    border-bottom: 2px solid #dde1e8 !important;
    height: 44px !important;
  }
 
  .ag-header-cell {
    font-size: 12px !important;
    font-weight: 700 !important;
    color: #3a3f51 !important;
    text-transform: none;
    padding: 0 12px !important;
    background-color: #f4f5f7 !important;
    border-right: none !important;
  }
 
  .ag-header-cell-text {
    font-weight: 700;
    letter-spacing: 0.01em;
  }
 
  // Header checkbox
  .ag-header-select-all {
    margin-right: 8px;
  }
 
  // ── Row defaults ────────────────────────────────────────────────────────────
  .ag-row {
    border-bottom: 1px solid #eaedf2 !important;
    border-top: none !important;
    transition: background-color 0.1s ease;
  }
 
  .ag-row:hover {
    background-color: #f0f4ff !important;
  }
 
  // No vertical cell borders
  .ag-cell {
    border-right: none !important;
    border-left: none !important;
    display: flex !important;
    align-items: center !important;
    font-size: 13px;
    color: #2c2f3f;
    line-height: 1.35;
  }
 
  // ── Root (Level 0) rows — white background, bolder text ────────────────────
  .root-row {
    background-color: #ffffff !important;
    border-bottom: 1px solid #dde1e8 !important;
  }
 
  .root-row:hover {
    background-color: #f5f8ff !important;
  }
 
  .root-row .ag-cell {
    font-weight: 500;
  }
 
  // ── Child rows — subtle blue tint per level ─────────────────────────────────
  .child-row {
    background-color: #f7faff !important;
    border-bottom: 1px solid #e8eef8 !important;
  }
 
  .child-row:hover {
    background-color: #edf3ff !important;
  }
 
  .child-row.level-1 { background-color: #f5f8ff !important; }
  .child-row.level-2 { background-color: #eef4ff !important; }
  .child-row.level-3 { background-color: #e6eefd !important; }
  .child-row.level-4 { background-color: #dde8fc !important; }
  .child-row.level-5 { background-color: #d4e2fb !important; }
 
  // Stronger separator after each cluster group (root row bottom border)
  .root-row + .root-row,
  .ag-row-last {
    border-bottom: 2px solid #c8d0df !important;
  }
 
  // ── Selected row ────────────────────────────────────────────────────────────
  .ag-row-selected {
    background-color: #e8f0fe !important;
  }
 
  .ag-row-selected:hover {
    background-color: #dde7fd !important;
  }
 
  .ag-row-selected.child-row {
    background-color: #dde9fe !important;
  }
 
  // ── Profile Name cell ────────────────────────────────────────────────────────
  .ag-cell[col-id="profileName"] {
    padding-right: 8px !important;
 
    .ag-cell-wrapper {
      display: flex !important;
      align-items: center !important;
      width: 100%;
      overflow: hidden;
    }
 
    // Checkbox stays inline
    .ag-selection-checkbox {
      flex-shrink: 0;
      margin-right: 8px;
    }
  }
 
  // Profile name text renderer
  .profile-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    white-space: nowrap;
  }
 
  .parent-cell {
    cursor: pointer;
 
    .chevron {
      flex-shrink: 0;
      margin-right: 2px;
    }
  }
 
  .parent-name {
    font-weight: 600;
    font-size: 13px;
    color: #1a56db;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
 
  .child-cell {
    cursor: default;
  }
 
  .child-name {
    font-weight: 400;
    font-size: 13px;
    color: #1a56db;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
 
  // Small vertical connector line to visualise tree depth
  .child-connector {
    display: inline-block;
    width: 2px;
    height: 18px;
    background: #c3d4f5;
    border-radius: 1px;
    flex-shrink: 0;
    margin-right: 4px;
  }
 
  // ── Checkbox styling ─────────────────────────────────────────────────────────
  .ag-checkbox-input-wrapper {
    width: 18px !important;
    height: 18px !important;
    border-radius: 4px !important;
    border: 2px solid #9ba6bf !important;
    background: #fff !important;
    transition: border-color 0.15s, background 0.15s;
  }
 
  .ag-checkbox-input-wrapper.ag-checked {
    background-color: #1a56db !important;
    border-color: #1a56db !important;
  }
 
  .ag-checkbox-input-wrapper.ag-checked::after {
    color: #ffffff !important;
    font-size: 11px !important;
  }
 
  .ag-checkbox-input-wrapper:hover {
    border-color: #1a56db !important;
  }
 
  // ── Legal Hold Status pill ────────────────────────────────────────────────────
  .status-pill {
    display: inline-block;
    background-color: #1a1a2e !important;
    color: #ffffff !important;
    padding: 3px 10px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
 
  .status-na {
    color: #7a8096;
    font-size: 13px;
  }
 
  // ── Pagination ──────────────────────────────────────────────────────────────
  .ag-paging-panel {
    border-top: 1px solid #dde1e8 !important;
    background: #f9fafc !important;
    height: 44px !important;
    font-size: 12px !important;
    color: #3a3f51 !important;
  }
 
  // ── Sort icons ───────────────────────────────────────────────────────────────
  .ag-sort-indicator-icon {
    color: #1a56db;
  }
 
  // ── Scrollbar ────────────────────────────────────────────────────────────────
  .ag-body-horizontal-scroll-viewport::-webkit-scrollbar,
  .ag-body-viewport::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
 
  .ag-body-horizontal-scroll-viewport::-webkit-scrollbar-track,
  .ag-body-viewport::-webkit-scrollbar-track {
    background: #f1f3f7;
  }
 
  .ag-body-horizontal-scroll-viewport::-webkit-scrollbar-thumb,
  .ag-body-viewport::-webkit-scrollbar-thumb {
    background: #c0c8d8;
    border-radius: 3px;
  }
 
  // ── Remove default AG Grid zebra / selection blue ────────────────────────────
  .ag-row-even,
  .ag-row-odd {
    background-color: inherit;
  }
 
  // Focus ring on cells
  .ag-cell-focus {
    border: none !important;
    outline: none !important;
  }
}
//enc of scss//