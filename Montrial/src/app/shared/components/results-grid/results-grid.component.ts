import {
  Component,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  GetRowIdParams,
} from 'ag-grid-community';
import { LegalHoldDataService } from '../../services/legal-hold-data.service';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss'],
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();

  private gridApi!: GridApi;

  /** Flat visible rows shown in grid */
  rowData: any[] = [];

  /** Full tree – single source of truth */
  private tree: any[] = [];

  /**
   * TRUE while we are programmatically mutating selection.
   * Blocks onSelectionChanged re-entry.
   */
  private updating = false;

  readonly pageSize = 10;

  // ── Stable row identity so AG Grid never loses track of nodes ──────────────
  readonly getRowId = (p: GetRowIdParams) => p.data._uid;

  // ── Column Definitions ─────────────────────────────────────────────────────
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 300,
      flex: 2,
      // Indent the WHOLE cell (checkbox + content) via padding-left
      cellStyle: (p: any) => ({
        'padding-left': `${6 + (p.data?._level ?? 0) * 28}px`,
      }),
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const name: string = p.value ?? '';
        if (p.data._isParent) {
          const chevron = p.data._expanded
            ? `<svg width="11" height="7" viewBox="0 0 11 7" fill="none">
                <path d="M1 6L5.5 1.5L10 6" stroke="#1a4fa0" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
               </svg>`
            : `<svg width="11" height="7" viewBox="0 0 11 7" fill="none">
                <path d="M1 1.5L5.5 6L10 1.5" stroke="#1a4fa0" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
               </svg>`;
          return `<span class="pn-parent">${name}<span class="pn-chevron">${chevron}</span></span>`;
        }
        return `<span class="pn-child">${name}</span>`;
      },
    },
    { headerName: 'Proxy OCIF ID',             field: 'ocifId',           sortable: false, width: 148 },
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
    { headerName: 'Legal Hold Name',           field: 'holdName',         width: 168, cellRenderer: (p: any) => p.value || '' },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle',        width: 196 },
    { headerName: 'Role Type',                 field: 'role',             width: 148 },
    { headerName: 'Address',                   field: 'address',          flex: 1, minWidth: 180 },
  ];

  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    // All cells vertically centred via flex
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  constructor(private readonly svc: LegalHoldDataService) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const raw = this.svc.getMockData();
    this.tree = this.stampTree(raw, 0);
    this.rowData = this.buildFlat(this.tree);
  }

  /**
   * Recursively adds private control fields (prefixed _) to every node.
   * Works on the original objects so references stay stable.
   */
  private stampTree(nodes: any[], level: number, parentUid = ''): any[] {
    return nodes.map((n, i) => {
      const uid = parentUid ? `${parentUid}-${i}` : `r${i}`;
      n._uid      = uid;
      n._level    = level;
      n._expanded = n.isExpanded ?? false;
      n._isParent = !!(n.isParent && n.children?.length);
      n._selected = false;
      if (n.children?.length) this.stampTree(n.children, level + 1, uid);
      return n;
    });
  }

  /** Produce a flat array of visible nodes */
  private buildFlat(nodes: any[], out: any[] = []): any[] {
    for (const n of nodes) {
      out.push(n);
      if (n._isParent && n._expanded) this.buildFlat(n.children, out);
    }
    return out;
  }

  // ── Grid events ────────────────────────────────────────────────────────────
  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  /** Toggle expand/collapse. Guard against checkbox clicks. */
  onCellClicked(e: CellClickedEvent): void {
    if (e.colDef.field !== 'profileName') return;
    if (!e.data?._isParent) return;

    const t = e.event?.target as HTMLElement | null;
    if (t?.closest('.ag-selection-checkbox') || t?.closest('.ag-checkbox-input-wrapper')) return;

    e.data._expanded = !e.data._expanded;

    // Rebuild visible rows
    const next = this.buildFlat(this.tree);

    // Use applyTransaction: add new rows / remove hidden ones, keep existing
    const current = new Set<string>(this.rowData.map(r => r._uid));
    const incoming = new Set<string>(next.map(r => r._uid));

    const add    = next.filter(r => !current.has(r._uid));
    const remove = this.rowData.filter(r => !incoming.has(r._uid));

    this.rowData = next;

    this.gridApi.applyTransaction({ add, remove });

    // Re-stamp selection silently (rows are stable objects so nodes exist)
    this.syncSelectionToGrid();
  }

  /** Row CSS class drives background colour */
  readonly getRowClass = (p: any): string => {
    const lvl: number = p.data?._level ?? 0;
    return lvl === 0
      ? 'row-root'
      : `row-child row-child-l${Math.min(lvl, 4)}`;
  };

  // ── Selection ──────────────────────────────────────────────────────────────

  onSelectionChanged(): void {
    if (this.updating) return;
    this.updating = true;

    // 1. Read grid → model
    this.gridApi.forEachNode(node => {
      const n = this.findByUid(this.tree, node.data._uid);
      if (n) n._selected = node.isSelected();
    });

    // 2. Cascade down (parent checked → children checked)
    this.cascadeDown(this.tree);

    // 3. Bubble up (all children checked → parent checked)
    this.bubbleUp(this.tree);

    // 4. Model → grid (silent)
    this.syncSelectionToGrid();

    this.updating = false;

    // 5. Log & emit
    this.logAndEmit();
  }

  private cascadeDown(nodes: any[]): void {
    for (const n of nodes) {
      if (!n._isParent) continue;
      if (n._selected) {
        this.setAllDescendants(n.children, true);
      } else {
        this.cascadeDown(n.children ?? []);
      }
    }
  }

  private setAllDescendants(nodes: any[], sel: boolean): void {
    for (const n of nodes) {
      n._selected = sel;
      if (n.children?.length) this.setAllDescendants(n.children, sel);
    }
  }

  /**
   * Returns true when every node in this sibling array is selected.
   * Side-effect: marks a parent selected when all its children are.
   */
  private bubbleUp(nodes: any[]): boolean {
    if (!nodes.length) return true;
    let allSel = true;
    for (const n of nodes) {
      if (n._isParent && n.children?.length) {
        if (this.bubbleUp(n.children)) n._selected = true;
      }
      if (!n._selected) allSel = false;
    }
    return allSel;
  }

  /**
   * Push _selected from model → AG Grid nodes.
   * Passing source 'api' prevents AG Grid from firing selectionChanged.
   */
  private syncSelectionToGrid(): void {
    this.gridApi.forEachNode(node => {
      const n = this.findByUid(this.tree, node.data._uid);
      if (n) node.setSelected(n._selected, false, 'api');
    });
  }

  // ── Logging ────────────────────────────────────────────────────────────────
  private logAndEmit(): void {
    const selected: any[] = this.gridApi.getSelectedRows();

    if (!selected.length) {
      console.log('[Grid] Selection cleared');
      this.selectionChanged.emit([]);
      return;
    }

    const clusterMap = new Map<string, { root: any; rows: any[] }>();
    const standalone: any[] = [];

    for (const row of selected) {
      const root = this.findRootOf(this.tree, row._uid);
      if (root?._isParent) {
        if (!clusterMap.has(root._uid)) clusterMap.set(root._uid, { root, rows: [] });
        clusterMap.get(root._uid)!.rows.push(row);
      } else {
        standalone.push(row);
      }
    }

    console.groupCollapsed(`[Grid] ${selected.length} row(s) selected`);
    clusterMap.forEach(({ root, rows }) => {
      const all = this.flattenNode(root);
      console.groupCollapsed(`Cluster "${root.profileName}" — ${rows.length}/${all.length} selected`);
      console.log('Selected:', rows);
      console.log('Full cluster:', all);
      console.groupEnd();
    });
    if (standalone.length) console.log('Standalone:', standalone);
    console.groupEnd();

    this.selectionChanged.emit(selected);
  }

  // ── Tree helpers ───────────────────────────────────────────────────────────
  private findByUid(nodes: any[], uid: string): any | null {
    for (const n of nodes) {
      if (n._uid === uid) return n;
      if (n.children?.length) {
        const f = this.findByUid(n.children, uid);
        if (f) return f;
      }
    }
    return null;
  }

  /** Returns the root-level node that is, or contains, the given uid */
  private findRootOf(nodes: any[], uid: string): any | null {
    for (const n of nodes) {
      if (n._uid === uid) return n;
      if (n.children?.length && this.findByUid(n.children, uid)) return n;
    }
    return null;
  }

  private flattenNode(n: any): any[] {
    const out = [n];
    for (const c of n.children ?? []) out.push(...this.flattenNode(c));
    return out;
  }

  onPaginationChanged(): void {}
}