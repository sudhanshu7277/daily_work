import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
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
  imports: [CommonModule, AgGridAngular],  // CommonModule for *ngIf
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
})
export class EntityGridComponent implements OnInit, OnDestroy {
  @Output() selectionChanged = new EventEmitter<EntityNode[]>();

  private gridApi!: GridApi;
  rowData: any[] = [];
  private tree: any[] = [];

  isLoading = true;
  loadError  = false;

  private readonly destroy$ = new Subject<void>();
  private updating = false;

  readonly pageSize = 20;

  readonly getRowId = (p: GetRowIdParams) => (p.data as any)._uid;

  // ── Column Definitions ─────────────────────────────────────────────────────
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 260,
      flex: 2,
      /**
       * DYNAMIC INDENTATION
       * Formula: padding-left = 8px + (_level × 24px)
       *   Level 0 (root)  → 8px   (checkbox flush left)
       *   Level 1         → 32px  (Corp 5 in Figma)
       *   Level 2         → 56px  (Role Players in Figma)
       *   Level 3         → 80px  etc.
       *
       * This shifts the ENTIRE cell content — checkbox AND text — together,
       * because the checkbox lives inside the AG Grid cell wrapper which
       * receives the padding.
       */
      cellStyle: (p: any) => ({
        'padding-left': `${8 + ((p.data as any)?._level ?? 0) * 24}px`,
      }),
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const node = p.data as any;
        const name: string = p.value ?? '';

        if (node._isParent) {
          const chevronUp = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 5.5L5 1L9 5.5" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          const chevronDown = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 0.5L5 5L9 0.5" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          const icon = node._expanded ? chevronUp : chevronDown;
          return `<span class="pn-parent">${name}<span class="pn-chevron">${icon}</span></span>`;
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
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 190 },
    { headerName: 'Role Type',                 field: 'role',      width: 175 },
    { headerName: 'Address',                   field: 'address',   flex: 1, minWidth: 180 },
  ];

  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  constructor(private readonly svc: EntityGridService) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError  = false;

    this.svc.getEntityGrid()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.tree   = res.data;
          this.stampTree(this.tree, 0, '');
          this.rowData = this.buildFlat(this.tree);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('[EntityGrid] load error', err);
          this.loadError  = true;
          this.isLoading  = false;
        },
      });
  }

  /**
   * Stamps runtime metadata on every node (runs once after data loads).
   *
   * _uid      → stable string key, fed to getRowId so AG Grid never loses
   *             node references across applyTransaction calls
   * _level    → 0 for roots, increments per nesting depth;
   *             drives the padding-left formula in cellStyle
   * _isParent → true when node.children.length > 0
   * _expanded → initial open/closed (reads isExpanded, defaults true for parents)
   * _selected → our authoritative selection state
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
    this.syncModelToGrid();
  }

  /**
   * getRowClass drives row background colour.
   * Level 0       → row-root  (mint-teal)
   * Level 1       → row-child row-child-l1  (lightest blue-grey)
   * Level 2       → row-child row-child-l2  (slightly deeper)
   * …up to l5 cap
   */
  readonly getRowClass = (p: any): string => {
    const lvl: number = (p.data as any)?._level ?? 0;
    return lvl === 0
      ? 'row-root'
      : `row-child row-child-l${Math.min(lvl, 5)}`;
  };

  // ── Selection ──────────────────────────────────────────────────────────────
  onSelectionChanged(): void {
    if (this.updating) return;
    this.updating = true;

    try {
      // ① Snapshot before
      const prev = new Set<string>();
      this.collectSelected(this.tree, prev);

      // ② Read grid → model
      this.gridApi.forEachNode(node => {
        const n = this.findByUid(this.tree, (node.data as any)._uid);
        if (n) n._selected = node.isSelected();
      });

      // ③ Diff
      const now = new Set<string>();
      this.collectSelected(this.tree, now);
      const justSel   = [...now].filter(u => !prev.has(u));
      const justDesel = [...prev].filter(u => !now.has(u));

      // ④ Cascade selected parents down
      for (const uid of justSel) {
        const n = this.findByUid(this.tree, uid);
        if (n?._isParent) this.setAllDescendants(n.children, true);
      }

      // ⑤ Cascade deselected parents down
      for (const uid of justDesel) {
        const n = this.findByUid(this.tree, uid);
        if (n?._isParent) this.setAllDescendants(n.children, false);
      }

      // ⑥ Recompute parents bottom-up
      this.recomputeParents(this.tree);

      // ⑦ Push model → grid silently
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

  private setAllDescendants(nodes: any[], sel: boolean): void {
    for (const n of nodes) {
      n._selected = sel;
      if (n.children?.length) this.setAllDescendants(n.children, sel);
    }
  }

  /** Post-order: parent is selected iff ALL children selected */
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
      const all = this.flattenNode(root);
      console.groupCollapsed(`Cluster "${root.profileName}" — ${rows.length}/${all.length} selected`);
      console.log('Selected rows:', rows);
      console.log('Full cluster:', all);
      console.groupEnd();
    });
    if (standalone.length) console.log('Standalone:', standalone);
    console.log('All selected:', selected);
    console.groupEnd();

    this.selectionChanged.emit(selected as EntityNode[]);
  }

  // ── Tree Utilities ─────────────────────────────────────────────────────────
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
