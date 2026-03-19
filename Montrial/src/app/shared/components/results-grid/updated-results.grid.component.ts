import { Component, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, SelectionChangedEvent, CellClickedEvent } from 'ag-grid-community';
import { LegalHoldDataService } from '../../services/legal-hold-data.service';
 
@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss'],
  // OnPush avoids unnecessary CD cycles that cause freezing
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();
 
  private gridApi!: GridApi;
 
  /** Flat list of currently visible rows fed to AG Grid */
  rowData: any[] = [];
 
  /** Full hierarchical source-of-truth */
  private tree: any[] = [];
 
  /** Guard flag – prevents the selectionChanged callback from calling itself */
  private updating = false;
 
  readonly pageSize = 10;
 
  // ─── Column Definitions ────────────────────────────────────────────────────
 
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 320,
      flex: 2,
      /**
       * Shift the ENTIRE cell (checkbox + renderer) right by (level * indent).
       * We use paddingLeft on the cell itself so the checkbox also moves.
       */
      cellStyle: (p: any) => ({
        'padding-left': `${6 + (p.data?.level ?? 0) * 28}px`,
      }),
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const name: string = p.value ?? '';
        if (p.data.isParent) {
          const icon = p.data.isExpanded
            ? `<svg width="11" height="7" viewBox="0 0 11 7" fill="none"><path d="M1 6L5.5 1.5L10 6" stroke="#1a4fa0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            : `<svg width="11" height="7" viewBox="0 0 11 7" fill="none"><path d="M1 1.5L5.5 6L10 1.5" stroke="#1a4fa0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          return `<span class="pn-cell pn-parent">${name}<span class="pn-chevron">${icon}</span></span>`;
        }
        return `<span class="pn-cell pn-child">${name}</span>`;
      },
    },
    {
      headerName: 'Proxy OCIF ID',
      field: 'ocifId',
      sortable: false,
      width: 148,
    },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      width: 172,
      cellRenderer: (p: any) =>
        p.value === 'LEGAL HOLD'
          ? `<span class="lh-pill">LEGAL HOLD</span>`
          : `<span class="lh-na">N/A</span>`,
    },
    {
      headerName: 'Legal Hold Name',
      field: 'holdName',
      width: 168,
      cellRenderer: (p: any) => p.value || '',
    },
    {
      headerName: 'Customer Lifecycle Status',
      field: 'lifecycle',
      width: 196,
    },
    {
      headerName: 'Role Type',
      field: 'role',
      width: 148,
    },
    {
      headerName: 'Address',
      field: 'address',
      flex: 1,
      minWidth: 180,
    },
  ];
 
  // ─── AG Grid options ────────────────────────────────────────────────────────
 
  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };
 
  constructor(
    private readonly dataService: LegalHoldDataService,
    private readonly cdr: ChangeDetectorRef,
  ) {}
 
  // ─── Lifecycle ──────────────────────────────────────────────────────────────
 
  ngOnInit(): void {
    this.tree = this.dataService.getMockData();
    this.initTree(this.tree, 0);
    this.rowData = this.flatten(this.tree);
  }
 
  /** Recursively stamp level, isSelected, and collapse everything initially */
  private initTree(nodes: any[], level: number): void {
    for (const n of nodes) {
      n.level = level;
      n.isSelected = false;
      n.isExpanded = n.isExpanded ?? false; // respect pre-set value, default collapse
      if (n.children?.length) this.initTree(n.children, level + 1);
    }
  }
 
  /** Build flat visible array from tree (only expand when isParent+isExpanded) */
  private flatten(nodes: any[], out: any[] = []): any[] {
    for (const n of nodes) {
      out.push(n);
      if (n.isParent && n.isExpanded && n.children?.length) {
        this.flatten(n.children, out);
      }
    }
    return out;
  }
 
  // ─── Grid Events ────────────────────────────────────────────────────────────
 
  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }
 
  /**
   * Expand / collapse on click of the profileName cell.
   * Important: ignore clicks that land on the checkbox itself.
   */
  onCellClicked(e: CellClickedEvent): void {
    if (e.colDef.field !== 'profileName') return;
    if (!e.data?.isParent) return;
 
    const target = e.event?.target as HTMLElement | null;
    if (target?.closest('.ag-checkbox-input-wrapper') || target?.closest('.ag-selection-checkbox')) return;
 
    e.data.isExpanded = !e.data.isExpanded;
    this.refreshRows();
  }
 
  /** Rebuild rowData and restore selection without triggering selectionChanged */
  private refreshRows(): void {
    this.rowData = this.flatten(this.tree);
    this.gridApi.setGridOption('rowData', this.rowData);
    // Restore checkboxes – use suppressFinishActions so no event fires
    this.applyModelToGrid(true);
    this.cdr.markForCheck();
  }
 
  /** Row-class callback – drives background colour per level */
  getRowClass = (p: any): string => {
    const level: number = p.data?.level ?? 0;
    return level === 0 ? 'row-root' : `row-child row-child-l${Math.min(level, 4)}`;
  };
 
  // ─── Selection Logic ────────────────────────────────────────────────────────
 
  /**
   * Called by AG Grid whenever the user checks/unchecks a row.
   * We guard with `updating` to prevent infinite loops.
   */
  onSelectionChanged(_e: SelectionChangedEvent): void {
    if (this.updating) return;
    this.updating = true;
 
    try {
      // 1. Read current UI state into the tree
      this.gridApi.forEachNode((node) => {
        const item = this.findById(this.tree, node.data.ocifId);
        if (item) item.isSelected = node.isSelected();
      });
 
      // 2. Cascade downward: selected parent → select all descendants
      this.cascadeDown(this.tree);
 
      // 3. Bubble upward: all children selected → select parent
      this.bubbleUp(this.tree);
 
      // 4. Push model back to grid (silent – no event)
      this.applyModelToGrid(true);
    } finally {
      this.updating = false;
    }
 
    this.emitAndLog();
  }
 
  /**
   * If a parent is selected, force-select all its descendants.
   * If not selected, recurse into children to let nested parents cascade too.
   */
  private cascadeDown(nodes: any[]): void {
    for (const n of nodes) {
      if (!n.isParent || !n.children?.length) continue;
      if (n.isSelected) {
        this.setDescendants(n.children, true);
      } else {
        this.cascadeDown(n.children);
      }
    }
  }
 
  private setDescendants(nodes: any[], selected: boolean): void {
    for (const n of nodes) {
      n.isSelected = selected;
      if (n.children?.length) this.setDescendants(n.children, selected);
    }
  }
 
  /**
   * Post-order: returns true when every node in `nodes` is selected.
   * If all children of a parent are selected, the parent becomes selected.
   */
  private bubbleUp(nodes: any[]): boolean {
    if (!nodes.length) return true; // vacuous – caller may set parent
    let allSelected = true;
    for (const n of nodes) {
      if (n.isParent && n.children?.length) {
        const childrenAll = this.bubbleUp(n.children);
        if (childrenAll) n.isSelected = true;
      }
      if (!n.isSelected) allSelected = false;
    }
    return allSelected;
  }
 
  /**
   * Write isSelected from data model back to AG Grid row nodes.
   * @param silent – when true uses suppressFinishActions to avoid re-triggering selectionChanged
   */
  private applyModelToGrid(silent: boolean): void {
    this.gridApi.forEachNode((node) => {
      const item = this.findById(this.tree, node.data.ocifId);
      if (!item) return;
      // setSelected(newValue, clearSelection, suppressFinishActions)
      node.setSelected(item.isSelected, false, silent);
    });
  }
 
  // ─── Logging & Emit ─────────────────────────────────────────────────────────
 
  private emitAndLog(): void {
    const selected: any[] = this.gridApi.getSelectedRows();
 
    if (!selected.length) {
      console.log('[Grid] Selection cleared');
      this.selectionChanged.emit([]);
      return;
    }
 
    // Map each selected row back to its root cluster
    const clusterMap = new Map<string, { root: any; rows: any[] }>();
    const standalone: any[] = [];
 
    for (const row of selected) {
      const root = this.findRoot(this.tree, row.ocifId);
      if (root?.children?.length) {
        if (!clusterMap.has(root.ocifId)) {
          clusterMap.set(root.ocifId, { root, rows: [] });
        }
        clusterMap.get(root.ocifId)!.rows.push(row);
      } else {
        standalone.push(row);
      }
    }
 
    console.groupCollapsed(`[Grid] ${selected.length} row(s) selected`);
 
    clusterMap.forEach(({ root, rows }) => {
      const all = this.collectAll(root);
      console.groupCollapsed(
        `Cluster "${root.profileName}" (${root.ocifId}) — ${rows.length}/${all.length} selected`,
      );
      console.log('Selected in cluster:', rows);
      console.log('Full cluster:', all);
      console.groupEnd();
    });
 
    if (standalone.length) {
      console.log('Standalone rows:', standalone);
    }
 
    console.groupEnd();
 
    this.selectionChanged.emit(selected);
  }
 
  // ─── Tree Utilities ──────────────────────────────────────────────────────────
 
  private findById(nodes: any[], ocifId: string): any | null {
    for (const n of nodes) {
      if (n.ocifId === ocifId) return n;
      if (n.children?.length) {
        const found = this.findById(n.children, ocifId);
        if (found) return found;
      }
    }
    return null;
  }
 
  /** Returns the top-level node that IS or CONTAINS the given ocifId */
  private findRoot(nodes: any[], ocifId: string): any | null {
    for (const n of nodes) {
      if (n.ocifId === ocifId) return n;
      if (n.children?.length && this.findById(n.children, ocifId)) return n;
    }
    return null;
  }
 
  private collectAll(node: any): any[] {
    const result = [node];
    for (const c of node.children ?? []) result.push(...this.collectAll(c));
    return result;
  }
 
  onPaginationChanged(): void {}
}
// html//

<div class="grid-card-container">
  <ag-grid-angular
    class="ag-theme-alpine bmo-grid"
    style="width: 100%; height: 100%;"
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [defaultColDef]="defaultColDef"
    rowSelection="multiple"
    [pagination]="true"
    [paginationPageSize]="pageSize"
    [suppressPaginationPanel]="true"
    [suppressRowClickSelection]="true"
    [rowHeight]="52"
    [headerHeight]="44"
    [suppressCellFocus]="true"
    [animateRows]="false"
    [getRowClass]="getRowClass"
    (gridReady)="onGridReady($event)"
    (selectionChanged)="onSelectionChanged($event)"
    (cellClicked)="onCellClicked($event)"
    (paginationChanged)="onPaginationChanged()">
  </ag-grid-angular>
</div>
// end of html//

//scss code //
 
 // ─── Grid Container ──────────────────────────────────────────────────────────
 
// ─────────────────────────────────────────────────────────────────────────────
// Grid container
// ─────────────────────────────────────────────────────────────────────────────
 
.grid-card-container {
  width: 100%;
  height: calc(100vh - 250px);
  background: #ffffff;
  border: 1px solid #d8dde6;
  border-radius: 4px;
  overflow: hidden;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// AG Grid alpine overrides  (all scoped to .bmo-grid to avoid leaking)
// ─────────────────────────────────────────────────────────────────────────────
 
::ng-deep .ag-theme-alpine.bmo-grid {
 
  // ── Reset noisy AG Grid defaults ───────────────────────────────────────────
  .ag-root-wrapper         { border: none !important; }
  .ag-cell-focus           { outline: none !important; border: none !important; }
  .ag-row-even,
  .ag-row-odd              { background-color: inherit !important; } // kill zebra
  .ag-cell                 { border-right: none !important; }        // no vertical dividers
 
  // ── Header ─────────────────────────────────────────────────────────────────
  .ag-header {
    background-color: #f5f6f8 !important;
    border-bottom: 2px solid #1a2e5a !important; // dark navy – matches Figma divider
    min-height: 44px !important;
  }
 
  .ag-header-row {
    height: 44px !important;
  }
 
  .ag-header-cell {
    background-color: #f5f6f8 !important;
    border-right: none !important;
    padding: 0 12px !important;
 
    &-text {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #1a1a2e !important;
      letter-spacing: 0.01em;
    }
  }
 
  // Sort arrow colour
  .ag-icon-asc::before,
  .ag-icon-desc::before {
    color: #1a4fa0 !important;
  }
 
  // Header checkbox – same square style
  .ag-header-select-all .ag-checkbox-input-wrapper {
    width: 20px !important;
    height: 20px !important;
  }
 
  // ── All rows base ──────────────────────────────────────────────────────────
  .ag-row {
    border-bottom: 1px solid #dde3ed !important;
    border-top: none !important;
 
    // Cells vertically centred
    .ag-cell {
      display: flex !important;
      align-items: center !important;
      font-size: 13px;
      color: #2c3049;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      line-height: 1.4;
    }
  }
 
  // ── Root rows (level 0) – mint/teal tint as per Figma ─────────────────────
  //  Corp 2, 3, 4, 5 all have that light teal-grey wash
  .row-root {
    background-color: #e9f3f1 !important; // Figma mint-teal
    min-height: 56px !important;
 
    .ag-cell {
      font-weight: 600;
    }
  }
 
  .row-root:hover {
    background-color: #dceee9 !important;
  }
 
  // ── Child rows (level 1+) – light periwinkle-blue bg + thin light grey border
  // Figma clearly shows Role Player rows with a blue-tinted wash & grey separator
  .row-child {
    background-color: #e8f0fb !important; // light periwinkle-blue from Figma
    border-bottom: 1px solid #d0d9e8 !important; // thin light grey border
    min-height: 50px !important;
 
    .ag-cell {
      font-weight: 400;
    }
  }
 
  .row-child:hover {
    background-color: #dce8f9 !important;
  }
 
  // Deeper nesting – progressively slightly deeper blue
  .row-child-l2 { background-color: #e2ecf9 !important; border-bottom: 1px solid #ccd5e6 !important; }
  .row-child-l3 { background-color: #dce8f8 !important; border-bottom: 1px solid #c8d2e4 !important; }
  .row-child-l4 { background-color: #d6e4f7 !important; border-bottom: 1px solid #c4cedf !important; }
 
  // ── Selected state ─────────────────────────────────────────────────────────
  .ag-row-selected.row-root  { background-color: #c9e4de !important; }
  .ag-row-selected.row-child { background-color: #bed5f5 !important; border-bottom: 1px solid #a8c2e8 !important; }
 
  // ── Thick cluster divider ──────────────────────────────────────────────────
  // AG Grid doesn't have native group dividers, so we add a thicker bottom
  // border on the LAST child before a new root row via CSS adjacency trick.
  // We add class "last-in-cluster" from TS via getRowClass if needed,
  // but the simplest approach: root rows always have a strong top border.
  .row-root {
    border-top: 2px solid #b0bfd4 !important;
  }
 
  // Very first root row should not have a top border gap
  .ag-row-first.row-root {
    border-top: none !important;
  }
 
  // ── Profile name cell ──────────────────────────────────────────────────────
  .ag-cell[col-id="profileName"] {
    // The cellStyle already sets padding-left for indentation.
    // We just ensure the inner wrapper is flex so checkbox + renderer align.
    .ag-cell-wrapper {
      display: flex !important;
      align-items: center !important;
      width: 100%;
      gap: 0;
      overflow: hidden;
    }
 
    .ag-selection-checkbox {
      flex-shrink: 0;
      margin-right: 6px;
    }
  }
 
  // Profile name renderer spans
  .pn-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: default;
    max-width: 100%;
  }
 
  .pn-parent {
    color: #1a4fa0;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer; // whole cell is clickable for expand
  }
 
  .pn-child {
    color: #1a4fa0;
    font-weight: 400;
    font-size: 13px;
  }
 
  .pn-chevron {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 4px;
  }
 
  // ── Checkbox ───────────────────────────────────────────────────────────────
  // Figma shows a plain square ~20×20 with visible border, no fill when empty
  .ag-checkbox-input-wrapper {
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    border-radius: 3px !important;
    border: 1.5px solid #8a95ab !important;
    background: #ffffff !important;
    flex-shrink: 0;
 
    &.ag-checked {
      background: #1a4fa0 !important;
      border-color: #1a4fa0 !important;
 
      &::after {
        color: #ffffff !important;
        font-size: 12px !important;
      }
    }
 
    &:hover {
      border-color: #1a4fa0 !important;
    }
 
    // Remove AG Grid's default inner shadow/focus ring
    input[type="checkbox"] {
      width: 20px !important;
      height: 20px !important;
      opacity: 0;
      cursor: pointer;
    }
  }
 
  // ── Legal Hold Status pill ─────────────────────────────────────────────────
  // Figma: near-black bg, white bold text, small radius
  .lh-pill {
    display: inline-block;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 4px;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
 
  .lh-na {
    color: #6b7280;
    font-size: 13px;
  }
 
  // ── Pagination ──────────────────────────────────────────────────────────────
  .ag-paging-panel {
    border-top: 1px solid #d8dde6 !important;
    background: #f5f6f8 !important;
    height: 42px !important;
    font-size: 12px !important;
    color: #3a3f51 !important;
    padding: 0 16px !important;
  }
 
  // ── Scrollbars ──────────────────────────────────────────────────────────────
  ::-webkit-scrollbar       { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #f1f3f7; }
  ::-webkit-scrollbar-thumb { background: #bcc5d6; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #9aa5b8; }
}
 

//enc of scss//