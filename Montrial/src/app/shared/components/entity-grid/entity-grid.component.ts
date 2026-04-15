import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, AgGridAngular],
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  // Default change detection — NOT OnPush, so rowData binding updates reliably
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EntityGridComponent implements OnInit, OnDestroy {
  @Input() searchTerm = '';
  @Output() selectionChanged = new EventEmitter<EntityNode[]>();

  private gridApi!: GridApi;

  // AG Grid reads this array. Always assign a NEW array reference
  // (never push/splice in place) so Angular detects the change.
  rowData: any[] = [];

  private tree: any[] = [];
  isLoading = true;
  loadError = false;

  private readonly destroy$ = new Subject<void>();
  private updating = false;

  readonly pageSize = 25;

  // Stable row identity — AG Grid uses this to track nodes across updates
  readonly getRowId = (p: GetRowIdParams) => String((p.data as any)._uid);

  // ── Column definitions ─────────────────────────────────────────────────────
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 240,
      flex: 2,
      // Dynamic indentation: 8px base + (level × 20px) per nesting depth
      // Shifts the ENTIRE cell including the checkbox
      cellStyle: (p: any) => ({
        'padding-left': `${8 + ((p.data as any)?._level ?? 0) * 20}px`,
      }),
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const node = p.data as any;
        const name = String(p.value ?? '');
        if (node._isParent) {
          const up   = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 5L5 1L9 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          const down = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          return `<span class="pn-parent">${name}<span class="pn-chevron">${node._expanded ? up : down}</span></span>`;
        }
        return `<span class="pn-child">${name}</span>`;
      },
    },
    { headerName: 'Proxy OCIF ID',             field: 'ocifId',    sortable: false, width: 140 },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      width: 160,
      cellRenderer: (p: any) =>
        p.value === 'LEGAL HOLD'
          ? `<span class="lh-pill">LEGAL HOLD</span>`
          : `<span class="lh-na">N/A</span>`,
    },
    { headerName: 'Legal Hold Name',           field: 'holdName',  width: 160, cellRenderer: (p: any) => p.value || '' },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 180 },
    { headerName: 'Role Type',                 field: 'role',      width: 175 },
    { headerName: 'Address',                   field: 'address',   flex: 1, minWidth: 180 },
  ];

  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  constructor(
    private readonly svc: EntityGridService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Input ──────────────────────────────────────────────────────────────────
@Input() searchTerm = '';

// ── Search ─────────────────────────────────────────────────────────────────
search(): void {
  if (!this.searchTerm?.trim()) {
    this.loadData();
    return;
  }
  this.isLoading = true;
  this.svc.searchByProfileName(this.searchTerm)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.tree    = res.data;
        this.stampTree(this.tree, 0, '');
        this.rowData = this.buildFlat(this.tree);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[EntityGrid] search error', err);
        this.loadError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
}

  loadData(): void {
    this.isLoading = true;
    this.loadError = false;

    this.svc.getEntityGrid()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // 1. Build the tree with metadata
          this.tree = res.data;
          this.stampTree(this.tree, 0, '');

          // 2. Build a NEW flat array (new reference triggers AG Grid update)
          this.rowData = this.buildFlat(this.tree);

          // 3. Clear loading state
          this.isLoading = false;

          // 4. Force change detection — critical when service is synchronous
          this.cdr.detectChanges();

          console.log('[EntityGrid] Loaded', this.rowData.length, 'visible rows');
          console.log('[EntityGrid] rowData:', this.rowData.map((r: any) => `${r.profileName} (L${r._level})`));
        },
        error: (err) => {
          console.error('[EntityGrid] load error', err);
          this.loadError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ── Tree helpers ───────────────────────────────────────────────────────────

  /**
   * Stamps private runtime fields onto every node recursively.
   * Called once after data loads — never modifies original data shape.
   *
   * _uid         unique stable key (parentUid-index, e.g. "r2-0-1")
   * _level       nesting depth: 0 = root, 1 = child, 2 = grandchild …
   * _isParent    true when node has children
   * _expanded    starts true so all rows visible on load
   * _selected    our selection model — never read AG Grid directly
   * _isClusterEnd set by buildFlat — true on last row of each cluster
   */
  private stampTree(nodes: any[], level: number, parentUid: string): void {
    nodes.forEach((n, i) => {
      const uid    = parentUid ? `${parentUid}-${i}` : `r${i}`;
      n._uid       = uid;
      n._level     = level;
      n._isParent  = Array.isArray(n.children) && n.children.length > 0;
      n._expanded  = n._isParent; // all parents start expanded
      n._selected  = false;
      n._isClusterEnd = false;
      if (n._isParent) this.stampTree(n.children, level + 1, uid);
    });
  }

  /**
   * Build a flat array of currently visible rows.
   * Only call this at the TOP level (isRoot=true) — recursive calls
   * pass isRoot=false so cluster-end marking only runs once at the end.
   */
  private buildFlat(nodes: any[], out: any[] = [], isRoot = true): any[] {
    for (const n of nodes) {
      n._isClusterEnd = false;
      out.push(n);
      if (n._isParent && n._expanded) {
        this.buildFlat(n.children, out, false);
      }
    }

    // After the full tree is flattened, mark the last row of each cluster.
    // A cluster ends where the next row is a level-0 root, or at the grid end.
    if (isRoot) {
      for (let i = 0; i < out.length; i++) {
        const next       = out[i + 1] as any | undefined;
        const nextIsRoot = next && next._level === 0;
        const isLast     = i === out.length - 1;
        if (nextIsRoot || isLast) {
          (out[i] as any)._isClusterEnd = true;
        }
      }
    }

    return out;
  }

  // ── Grid events ────────────────────────────────────────────────────────────

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
    console.log('[EntityGrid] Grid ready');
  }

  /**
   * Toggle expand/collapse on profileName cell click.
   * Guards against checkbox clicks landing here.
   */
  onCellClicked(e: CellClickedEvent): void {
    if (e.colDef.field !== 'profileName') return;
    const node = e.data as any;
    if (!node?._isParent) return;

    const target = e.event?.target as HTMLElement | null;
    if (target?.closest('.ag-selection-checkbox') || target?.closest('.ag-checkbox-input-wrapper')) return;

    // Toggle
    node._expanded = !node._expanded;

    // Diff: which rows need to be added or removed?
    const next    = this.buildFlat(this.tree);
    const curSet  = new Set(this.rowData.map((r: any) => r._uid));
    const nextSet = new Set(next.map((r: any) => r._uid));
    const add     = next.filter((r: any) => !curSet.has(r._uid));
    const remove  = this.rowData.filter((r: any) => !nextSet.has(r._uid));

    this.rowData = next; // new reference
    this.gridApi.applyTransaction({ add, remove });
    this.syncModelToGrid();
  }

  readonly getRowClass = (p: any): string => {
    const node    = p.data as any;
    const lvl     = node?._level ?? 0;
    const end     = node?._isClusterEnd ? ' row-cluster-end' : '';
    const isParent = node?._isParent ? ' row-is-parent' : ' row-is-leaf';
    // Level 0 roots always use row-root (pale teal)
    if (lvl === 0) return `row-root${end}`;
    // Deeper parent rows (Corp 5, Corp 6 etc): same pale teal as root
    // Leaf rows (Role Players): light blue
    return `row-child row-child-l${Math.min(lvl, 10)}${isParent}${end}`;
  };

  // ── Selection logic ────────────────────────────────────────────────────────

  onSelectionChanged(): void {
    if (this.updating) return;
    this.updating = true;
    try {
      // Snapshot previous
      const prev = new Set<string>();
      this.collectSelected(this.tree, prev);

      // Read grid → model
      this.gridApi.forEachNode(gn => {
        const n = this.findByUid(this.tree, (gn.data as any)._uid);
        if (n) n._selected = gn.isSelected();
      });

      // Diff
      const now = new Set<string>();
      this.collectSelected(this.tree, now);

      // Cascade down for newly selected parents
      [...now].filter(u => !prev.has(u)).forEach(uid => {
        const n = this.findByUid(this.tree, uid);
        if (n?._isParent) this.setAllDesc(n.children, true);
      });

      // Cascade down for newly deselected parents
      [...prev].filter(u => !now.has(u)).forEach(uid => {
        const n = this.findByUid(this.tree, uid);
        if (n?._isParent) this.setAllDesc(n.children, false);
      });

      // Recompute parents bottom-up
      this.recomputeParents(this.tree);

      // Push model → grid silently
      this.syncModelToGrid();
    } finally {
      this.updating = false;
    }
    this.logAndEmit();
  }

  private collectSelected(nodes: any[], out: Set<string>): void {
    for (const n of nodes) {
      if (n._selected) out.add(n._uid);
      if (n.children?.length) this.collectSelected(n.children, out);
    }
  }

  private setAllDesc(nodes: any[], sel: boolean): void {
    for (const n of nodes) {
      n._selected = sel;
      if (n.children?.length) this.setAllDesc(n.children, sel);
    }
  }

  private recomputeParents(nodes: any[]): boolean {
    if (!nodes.length) return true;
    let all = true;
    for (const n of nodes) {
      if (n._isParent && n.children?.length) {
        n._selected = this.recomputeParents(n.children);
      }
      if (!n._selected) all = false;
    }
    return all;
  }

  private syncModelToGrid(): void {
    this.gridApi.forEachNode(gn => {
      const n = this.findByUid(this.tree, (gn.data as any)._uid);
      if (n) gn.setSelected(n._selected, false, 'api');
    });
  }

  // ── Logging & emit ─────────────────────────────────────────────────────────

  private logAndEmit(): void {
    const selected: any[] = this.gridApi.getSelectedRows();
  
    if (!selected.length) {
      console.log('[EntityGrid] Selection cleared');
      this.selectionChanged.emit([]);
      return;
    }
  
    for (const row of selected) {
      const root = this.findRootOf(this.tree, row._uid);
  
      if (root?._uid === row._uid) {
        // Whole cluster selected — log full array
        const cluster = this.flattenNode(root);
        console.log('[EntityGrid] Cluster selected:', cluster);
      } else {
        // Individual row — log record + its cluster reference
        console.log('[EntityGrid] Individual row selected:', {
          record: row,
          cluster: root?.profileName ?? null,
        });
      }
    }
  
    this.selectionChanged.emit(selected as EntityNode[]);
  }

  // ── Tree utilities ─────────────────────────────────────────────────────────

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


// NEW UPDATED TS FILE WITH PAGNIATION LOGIC ADDED BELOW

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, AgGridAngular],
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EntityGridComponent implements OnInit, OnDestroy {

  // ── Inputs & Outputs ───────────────────────────────────────────────────────
  @Input() searchTerm = '';
  @Output() selectionChanged = new EventEmitter<EntityNode[]>();

  // ── State ──────────────────────────────────────────────────────────────────
  private gridApi!: GridApi;
  rowData: any[] = [];
  private tree: any[] = [];
  isLoading = true;
  loadError = false;

  private readonly destroy$ = new Subject<void>();
  private updating = false;

  pageSize    = 10;
  currentPage = 1;
  totalPages  = 1;
  totalRows   = 0;

  readonly getRowId = (p: GetRowIdParams) => String((p.data as any)._uid);

  // ── Column definitions ─────────────────────────────────────────────────────
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 240,
      flex: 2,
      cellStyle: (p: any) => ({
        'padding-left': `${8 + ((p.data as any)?._level ?? 0) * 20}px`,
      }),
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const node = p.data as any;
        const name = String(p.value ?? '');
        if (node._isParent) {
          const up   = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 5L5 1L9 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          const down = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          return `<span class="pn-parent">${name}<span class="pn-chevron">${node._expanded ? up : down}</span></span>`;
        }
        return `<span class="pn-child">${name}</span>`;
      },
    },
    { headerName: 'Proxy OCIF ID',             field: 'ocifId',    sortable: false, width: 140 },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      width: 160,
      cellRenderer: (p: any) =>
        p.value === 'LEGAL HOLD'
          ? `<span class="lh-pill">LEGAL HOLD</span>`
          : `<span class="lh-na">N/A</span>`,
    },
    { headerName: 'Legal Hold Name',           field: 'holdName',  width: 160, cellRenderer: (p: any) => p.value || '' },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 180 },
    { headerName: 'Role Type',                 field: 'role',      width: 175 },
    { headerName: 'Address',                   field: 'address',   flex: 1, minWidth: 180 },
  ];

  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  constructor(
    private readonly svc: EntityGridService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  /**
   * GET — loads the full grid data on init or when search is cleared.
   */
  loadData(): void {
    this.isLoading = true;
    this.loadError = false;

    this.svc.getEntityGrid()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.tree    = res.data;
          this.stampTree(this.tree, 0, '');
          this.rowData = this.buildFlat(this.tree);
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('[EntityGrid] Loaded', this.rowData.length, 'visible rows');
        },
        error: (err) => {
          console.error('[EntityGrid] load error', err);
          this.loadError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * POST — queries by profileName using the value in searchTerm.
   * Falls back to loadData() if searchTerm is empty.
   * Data is stamped and flattened exactly the same way as loadData()
   * so all styling, indentation and cluster borders work identically.
   */
  search(): void {
    if (!this.searchTerm?.trim()) {
      this.loadData();
      return;
    }

    this.isLoading = true;
    this.loadError = false;

    this.svc.searchByProfileName(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.tree    = res.data;
          this.stampTree(this.tree, 0, '');       // same stamp as loadData
          this.rowData = this.buildFlat(this.tree); // same flat as loadData
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('[EntityGrid] Search returned', this.rowData.length, 'visible rows');
        },
        error: (err) => {
          console.error('[EntityGrid] search error', err);
          this.loadError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ── Tree helpers ───────────────────────────────────────────────────────────

  private stampTree(nodes: any[], level: number, parentUid: string): void {
    nodes.forEach((n, i) => {
      const uid       = parentUid ? `${parentUid}-${i}` : `r${i}`;
      n._uid          = uid;
      n._level        = level;
      n._isParent     = Array.isArray(n.children) && n.children.length > 0;
      n._expanded     = n._isParent;
      n._selected     = false;
      n._isClusterEnd = false;
      if (n._isParent) this.stampTree(n.children, level + 1, uid);
    });
  }

  private buildFlat(nodes: any[], out: any[] = [], isRoot = true): any[] {
    for (const n of nodes) {
      n._isClusterEnd = false;
      out.push(n);
      if (n._isParent && n._expanded) {
        this.buildFlat(n.children, out, false);
      }
    }

    if (isRoot) {
      for (let i = 0; i < out.length; i++) {
        const next       = out[i + 1] as any | undefined;
        const nextIsRoot = next && next._level === 0;
        const isLast     = i === out.length - 1;
        if (nextIsRoot || isLast) {
          (out[i] as any)._isClusterEnd = true;
        }
      }
    }

    return out;
  }

  // ── Grid events ────────────────────────────────────────────────────────────

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  onCellClicked(e: CellClickedEvent): void {
    if (e.colDef.field !== 'profileName') return;
    const node = e.data as any;
    if (!node?._isParent) return;

    const target = e.event?.target as HTMLElement | null;
    if (target?.closest('.ag-selection-checkbox') || target?.closest('.ag-checkbox-input-wrapper')) return;

    node._expanded = !node._expanded;

    const next    = this.buildFlat(this.tree);
    const curSet  = new Set(this.rowData.map((r: any) => r._uid));
    const nextSet = new Set(next.map((r: any) => r._uid));
    const add     = next.filter((r: any) => !curSet.has(r._uid));
    const remove  = this.rowData.filter((r: any) => !nextSet.has(r._uid));

    this.rowData = next;
    this.gridApi.applyTransaction({ add, remove });
    this.gridApi.redrawRows();
    this.syncModelToGrid();
  }

  readonly getRowClass = (p: any): string => {
    const node     = p.data as any;
    const lvl      = node?._level ?? 0;
    const end      = node?._isClusterEnd ? ' row-cluster-end' : '';
    const expanded = node?._isParent && node?._expanded ? ' row-expanded' : '';

    if (lvl === 0) return `row-root${expanded}${end}`;

    const type = node?._isParent ? 'row-is-parent' : 'row-is-leaf';
    return `row-child row-child-l${Math.min(lvl, 10)} ${type}${expanded}${end}`;
  };

  // ── Selection logic ────────────────────────────────────────────────────────

  onSelectionChanged(): void {
    if (this.updating) return;
    this.updating = true;
    try {
      const prev = new Set<string>();
      this.collectSelected(this.tree, prev);

      this.gridApi.forEachNode(gn => {
        const n = this.findByUid(this.tree, (gn.data as any)._uid);
        if (n) n._selected = gn.isSelected();
      });

      const now = new Set<string>();
      this.collectSelected(this.tree, now);

      [...now].filter(u => !prev.has(u)).forEach(uid => {
        const n = this.findByUid(this.tree, uid);
        if (n?._isParent) this.setAllDesc(n.children, true);
      });

      [...prev].filter(u => !now.has(u)).forEach(uid => {
        const n = this.findByUid(this.tree, uid);
        if (n?._isParent) this.setAllDesc(n.children, false);
      });

      this.recomputeParents(this.tree);
      this.syncModelToGrid();
    } finally {
      this.updating = false;
    }
    this.logAndEmit();
  }

  private collectSelected(nodes: any[], out: Set<string>): void {
    for (const n of nodes) {
      if (n._selected) out.add(n._uid);
      if (n.children?.length) this.collectSelected(n.children, out);
    }
  }

  private setAllDesc(nodes: any[], sel: boolean): void {
    for (const n of nodes) {
      n._selected = sel;
      if (n.children?.length) this.setAllDesc(n.children, sel);
    }
  }

  private recomputeParents(nodes: any[]): boolean {
    if (!nodes.length) return true;
    let all = true;
    for (const n of nodes) {
      if (n._isParent && n.children?.length) {
        n._selected = this.recomputeParents(n.children);
      }
      if (!n._selected) all = false;
    }
    return all;
  }

  private syncModelToGrid(): void {
    this.gridApi.forEachNode(gn => {
      const n = this.findByUid(this.tree, (gn.data as any)._uid);
      if (n) gn.setSelected(n._selected, false, 'api');
    });
  }

  // ── Logging & emit ─────────────────────────────────────────────────────────

  private logAndEmit(): void {
    const selected: any[] = this.gridApi.getSelectedRows();

    if (!selected.length) {
      console.log('[EntityGrid] Selection cleared');
      this.selectionChanged.emit([]);
      return;
    }

    for (const row of selected) {
      const root = this.findRootOf(this.tree, row._uid);

      if (root?._uid === row._uid) {
        const cluster = this.flattenNode(root);
        console.log('[EntityGrid] Cluster selected:', cluster);
      } else {
        console.log('[EntityGrid] Individual row selected:', {
          record: row,
          cluster: root?.profileName ?? null,
        });
      }
    }

    this.selectionChanged.emit(selected as EntityNode[]);
  }

  // ── Tree utilities ─────────────────────────────────────────────────────────

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

  onPaginationChanged(): void {
    if (!this.gridApi) return;
    this.currentPage = this.gridApi.paginationGetCurrentPage() + 1;
    this.totalPages  = this.gridApi.paginationGetTotalPages() || 1;
    this.totalRows   = this.gridApi.paginationGetRowCount();
  }

  // ── Pagination helpers ─────────────────────────────────────────────────────

  get rangeLabel(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end   = Math.min(this.currentPage * this.pageSize, this.totalRows);
    return `${start}-${end} of ${this.totalRows}`;
  }

  /** Pages to display: always first, last, current ±1, with -1 as ellipsis */
  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set<number>([1, total, cur]);
    if (cur - 1 > 1) pages.add(cur - 1);
    if (cur + 1 < total) pages.add(cur + 1);
    // always show a few neighbours of page 1 and last
    [2, 3, 4, 5].forEach(p => { if (p < total) pages.add(p); });

    const sorted = [...pages].sort((a, b) => a - b);
    const result: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1); // ellipsis
      result.push(sorted[i]);
    }
    return result;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.gridApi.paginationGoToPage(page - 1);
  }

  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize = size;
    this.gridApi.paginationSetPageSize(size);
  }

  // ENTITY GRID PAGINATION CHANGES


  onPaginationChanged(): void {
    if (!this.gridApi) return;
    this.currentPage = this.gridApi.paginationGetCurrentPage() + 1;
    this.totalPages  = this.gridApi.paginationGetTotalPages() || 1;
    this.totalRows   = this.gridApi.paginationGetRowCount();
    this.cdr.detectChanges();
  }
  
  get rangeLabel(): string {
    if (this.totalRows === 0) return '0 of 0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end   = Math.min(this.currentPage * this.pageSize, this.totalRows);
    return `${start}-${end} of ${this.totalRows}`;
  }
  
  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  
    const show = new Set<number>();
    show.add(1);
    show.add(total);
    show.add(cur);
    if (cur - 1 >= 1)     show.add(cur - 1);
    if (cur + 1 <= total) show.add(cur + 1);
    if (cur <= 4)         [2, 3, 4, 5].forEach(p => { if (p <= total) show.add(p); });
    if (cur >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach(p => { if (p >= 1) show.add(p); });
  
    const sorted = [...show].sort((a, b) => a - b);
    const result: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1);
      result.push(sorted[i]);
    }
    return result;
  }
  
  goToPage(page: number): void {
    if (!this.gridApi || page < 1 || page > this.totalPages) return;
    this.gridApi.paginationGoToPage(page - 1);
  }
  
  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize = size;
    this.gridApi.updateGridOptions({ paginationPageSize: size });
  }
}
