import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  GetRowIdParams,
} from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EntityGridService } from './entity-grid.service';
import { EntityNode } from './entity-grid.model';

@Component({
  selector: 'app-entity-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
})
export class EntityGridComponent implements OnInit, OnDestroy {
  @Output() selectionChanged = new EventEmitter<EntityNode[]>();

  private gridApi!: GridApi;
  rowData: EntityNode[] = [];
  private tree: EntityNode[] = [];

  isLoading = true;
  loadError = false;

  private readonly destroy$ = new Subject<void>();

  /**
   * Guard: set TRUE while we push state programmatically to the grid,
   * so the resulting selectionChanged AG Grid event is ignored.
   */
  private updating = false;

  readonly pageSize = 15;

  // ── Stable row identity ────────────────────────────────────────────────────
  readonly getRowId = (p: GetRowIdParams) => (p.data as any)._uid;

  // ── Column Definitions ─────────────────────────────────────────────────────
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 280,
      flex: 2,
      /**
       * DYNAMIC INDENTATION — works for any nesting depth.
       * padding-left = 8px + (_level × 28px)
       * Shifts the whole cell: checkbox + renderer text together.
       */
      cellStyle: (p: any) => ({
        'padding-left': `${8 + ((p.data as any)?._level ?? 0) * 28}px`,
      }),
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const node = p.data as any;
        const name: string = p.value ?? '';
        if (node._isParent) {
          const chevronUp = `<svg width="11" height="7" viewBox="0 0 11 7" fill="none">
            <path d="M1 6L5.5 1.5L10 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          const chevronDown = `<svg width="11" height="7" viewBox="0 0 11 7" fill="none">
            <path d="M1 1.5L5.5 6L10 1.5" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          const icon = node._expanded ? chevronUp : chevronDown;
          return `<span class="pn-parent">${name}<span class="pn-chevron">${icon}</span></span>`;
        }
        return `<span class="pn-child">${name}</span>`;
      },
    },
    { headerName: 'Proxy OCIF ID',             field: 'ocifId',    sortable: false, width: 148 },
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
    { headerName: 'Legal Hold Name',           field: 'holdName',  width: 168, cellRenderer: (p: any) => p.value || '' },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 196 },
    { headerName: 'Role Type',                 field: 'role',      width: 148 },
    { headerName: 'Address',                   field: 'address',   flex: 1, minWidth: 180 },
  ];

  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  constructor(private readonly entityGridSvc: EntityGridService) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Calls the service GET method. Stamps tree metadata on response,
   * then builds the initial flat visible row list.
   */
  private loadData(): void {
    this.isLoading = true;
    this.loadError = false;

    this.entityGridSvc.getEntityGrid()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tree = response.data;
          this.stampTree(this.tree, 0, '');
          this.rowData = this.buildFlat(this.tree);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('[EntityGrid] Failed to load data', err);
          this.loadError = true;
          this.isLoading = false;
        }
      });
  }

  /**
   * Stamps private runtime fields (_uid, _level, _isParent, _expanded, _selected)
   * on every node recursively. These are prefixed _ to avoid collisions with
   * the real data fields. Called once after data loads.
   *
   * _level    drives the dynamic padding-left indentation formula
   * _uid      is the stable key used by getRowId (AG Grid identity)
   * _isParent is true when node.children.length > 0
   * _expanded tracks current open/closed state (seed from isExpanded flag)
   * _selected is our selection model — we never trust AG Grid's checkbox directly
   */
  private stampTree(nodes: any[], level: number, parentUid: string): void {
    nodes.forEach((n, i) => {
      const uid   = parentUid ? `${parentUid}-${i}` : `r${i}`;
      n._uid      = uid;
      n._level    = level;
      n._isParent = !!(n.children?.length);
      n._expanded = n._isParent ? (n.isExpanded ?? true) : false;
      n._selected = false;
      if (n.children?.length) this.stampTree(n.children, level + 1, uid);
    });
  }

  private buildFlat(nodes: any[], out: any[] = []): any[] {
    for (const n of nodes) {
      out.push(n);
      if (n._isParent && n._expanded) this.buildFlat(n.children, out);
    }
    return out;
  }

  // ── Grid Events ────────────────────────────────────────────────────────────

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  /** Toggle expand / collapse on Profile Name cell click. Guards checkbox clicks. */
  onCellClicked(e: CellClickedEvent): void {
    if (e.colDef.field !== 'profileName' || !(e.data as any)?._isParent) return;

    const t = e.event?.target as HTMLElement | null;
    if (t?.closest('.ag-selection-checkbox') || t?.closest('.ag-checkbox-input-wrapper')) return;

    (e.data as any)._expanded = !(e.data as any)._expanded;

    const next    = this.buildFlat(this.tree);
    const curSet  = new Set(this.rowData.map((r: any) => r._uid));
    const nextSet = new Set(next.map((r: any) => r._uid));

    const add    = next.filter((r: any) => !curSet.has(r._uid));
    const remove = this.rowData.filter((r: any) => !nextSet.has(r._uid));

    this.rowData = next;
    this.gridApi.applyTransaction({ add, remove });
    this.syncModelToGrid(); // restore checkboxes silently
  }

  readonly getRowClass = (p: any): string => {
    const lvl: number = (p.data as any)?._level ?? 0;
    return lvl === 0
      ? 'row-root'
      : `row-child row-child-l${Math.min(lvl, 5)}`;
  };

  // ── Selection Logic ────────────────────────────────────────────────────────

  onSelectionChanged(): void {
    if (this.updating) return;
    this.updating = true;

    try {
      // ① Snapshot previous selection state (UIDs of selected nodes)
      const prevSelected = new Set<string>();
      this.collectSelected(this.tree, prevSelected);

      // ② Read current UI state into model
      this.gridApi.forEachNode(node => {
        const n = this.findByUid(this.tree, (node.data as any)._uid);
        if (n) n._selected = node.isSelected();
      });

      // ③ Diff: which nodes changed state this event?
      const nowSelected = new Set<string>();
      this.collectSelected(this.tree, nowSelected);

      const justSelected   = [...nowSelected].filter(uid => !prevSelected.has(uid));
      const justDeselected = [...prevSelected].filter(uid => !nowSelected.has(uid));

      // ④ Cascade TRUE down for each newly selected parent
      for (const uid of justSelected) {
        const node = this.findByUid(this.tree, uid);
        if (node?._isParent) this.setAllDescendants(node.children, true);
      }

      // ⑤ Cascade FALSE down for each newly deselected parent
      for (const uid of justDeselected) {
        const node = this.findByUid(this.tree, uid);
        if (node?._isParent) this.setAllDescendants(node.children, false);
      }

      // ⑥ Recompute all parents bottom-up
      //    parent = selected only when EVERY child is selected
      this.recomputeParents(this.tree);

      // ⑦ Push model → grid (silent, no event)
      this.syncModelToGrid();

    } finally {
      this.updating = false;
    }

    // ⑧ Emit and log
    this.logAndEmit();
  }

  private collectSelected(nodes: any[], out: Set<string>): void {
    for (const n of nodes) {
      if (n._selected) out.add(n._uid);
      if (n.children?.length) this.collectSelected(n.children, out);
    }
  }

  private setAllDescendants(nodes: any[], selected: boolean): void {
    for (const n of nodes) {
      n._selected = selected;
      if (n.children?.length) this.setAllDescendants(n.children, selected);
    }
  }

  private recomputeParents(nodes: any[]): boolean {
    if (!nodes.length) return true;
    let allSel = true;
    for (const n of nodes) {
      if (n._isParent && n.children?.length) {
        n._selected = this.recomputeParents(n.children);
      }
      if (!n._selected) allSel = false;
    }
    return allSel;
  }

  private syncModelToGrid(): void {
    this.gridApi.forEachNode(node => {
      const n = this.findByUid(this.tree, (node.data as any)._uid);
      if (n) node.setSelected(n._selected, false, 'api');
    });
  }

  // ── Logging & Emit ─────────────────────────────────────────────────────────

  private logAndEmit(): void {
    const selected: any[] = this.gridApi.getSelectedRows();

    if (!selected.length) {
      console.log('[EntityGrid] Selection cleared');
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

    console.groupCollapsed(`[EntityGrid] ${selected.length} row(s) selected`);
    clusterMap.forEach(({ root, rows }) => {
      const allInCluster = this.flattenNode(root);
      console.groupCollapsed(
        `Cluster "${root.profileName}" (${root.ocifId}) — ${rows.length}/${allInCluster.length} selected`
      );
      console.log('Selected rows:', rows);
      console.log('Full cluster:', allInCluster);
      console.groupEnd();
    });
    if (standalone.length) console.log('Standalone (no cluster):', standalone);
    console.log('All selected (flat):', selected);
    console.groupEnd();

    this.selectionChanged.emit(selected as EntityNode[]);
  }

  // ── Tree Utilities ─────────────────────────────────────────────────────────

  private findByUid(nodes: any[], uid: string): any | null {
    for (const n of nodes) {
      if (n._uid === uid) return n;
      if (n.children?.length) {
        const found = this.findByUid(n.children, uid);
        if (found) return found;
      }
    }
    return null;
  }

  private findRootOf(nodes: any[], uid: string): any | null {
    for (const n of nodes) {
      if (n._uid === uid) return n;
      if (n.children?.length && this.findByUid(n.children, uid)) return n;
    }
    return null;
  }

  private flattenNode(n: any): any[] {
    const out: any[] = [n];
    for (const c of n.children ?? []) out.push(...this.flattenNode(c));
    return out;
  }

  onPaginationChanged(): void {}
}
