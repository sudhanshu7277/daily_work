import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  DestroyRef,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  GetRowIdParams,
  RowClassParams,
  ICellRendererParams,
  CellClassParams,
} from 'ag-grid-community';

import { EntityNode, EntityRowNode, EntitySelectionEvent } from './entity-grid.model';

@Component({
  selector: 'app-entity-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityGridComponent implements OnInit, OnChanges {

  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs ─────────────────────────────────────────────────────────────────

  /** Raw tree data passed in from the parent (legal-hold-shell) */
  @Input() entityGridData: EntityNode[] = [];

  /** Search term used to build the search summary label */
  @Input() searchTerm = '';

  /** Summary string shown above the grid e.g. 'Showing 21 results for: "Corp 4"' */
  @Input() searchSummary = '';

  // ── Output ─────────────────────────────────────────────────────────────────

  @Output() selectionChanged = new EventEmitter<EntitySelectionEvent | []>();

  // ── Private state ──────────────────────────────────────────────────────────

  private gridApi!: GridApi;
  private tree: EntityRowNode[] = [];
  private uidMap = new Map<string, EntityRowNode>();
  private updating = false;

  // ── Signals ────────────────────────────────────────────────────────────────

  showChipsSection = signal(false);
  rowData         = signal<EntityRowNode[]>([]);
  isLoading       = signal(true);
  loadError       = signal(false);
  pageSize        = signal(20);
  currentPage     = signal(1);
  totalPages      = signal(1);
  totalRows       = signal(0);

  readonly pageSizeOpts = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];

  // ── Filter options ─────────────────────────────────────────────────────────

  readonly filterOptions = [
    { id: 'ocifId',          label: 'Proxy OCIF ID' },
    { id: 'legalHoldStatus', label: 'Legal Hold Status' },
    { id: 'holdName',        label: 'Legal Hold Name' },
    { id: 'lifecycle',       label: 'Customer Lifecycle Status' },
    { id: 'role',            label: 'Role Type' },
    { id: 'address',         label: 'Address' },
  ];

  selectedFilterIds: string[] = this.filterOptions.map(opt => opt.id);

  get activeFilters() {
    return this.filterOptions.filter(opt => this.selectedFilterIds.includes(opt.id));
  }

  // ── Computed signals ────────────────────────────────────────────────────────

  rangeLabel = computed(() => {
    const total = this.totalRows();
    if (total === 0) return '0 of 0';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end   = Math.min(this.currentPage() * this.pageSize(), total);
    return `${start}-${end} of ${total}`;
  });

  visiblePages = computed<number[]>(() => {
    const total = this.totalPages();
    const cur   = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const show = new Set<number>();
    show.add(1);
    show.add(total);
    show.add(cur);
    if (cur - 1 >= 1)     show.add(cur - 1);
    if (cur + 1 <= total) show.add(cur + 1);
    if (cur <= 4)         [2, 3, 4, 5].forEach(p => { if (p <= total) show.add(p); });
    if (cur >= total - 3) [total - 4, total - 3, total - 2, total - 1]
                            .forEach(p => { if (p >= 1) show.add(p); });

    const sorted = [...show].sort((a, b) => a - b);
    const result: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1);
      result.push(sorted[i]);
    }
    return result;
  });

  // ── Column definitions ─────────────────────────────────────────────────────

  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      filter: 'agTextColumnFilter',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 240,
      flex: 2,
      cellStyle: (p: CellClassParams) => ({
        'padding-left': `${8 + ((p.data as EntityRowNode)?._level ?? 0) * 20}px`,
      }),
      cellRenderer: (p: ICellRendererParams) => {
        if (!p.data) return '';
        const node        = p.data as EntityRowNode;
        const name        = String(p.value ?? '');
        const suspectHtml = node.isSuspect
          ? `<span class="suspect-icon" title="Suspect profile(s) found for this profile&#10;Search for the profile separately">!</span>`
          : '';

        if (node._isParent) {
          const up   = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          const down = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          return `<span class="pn-parent">${name}${suspectHtml}<span class="pn-chevron">${node._expanded ? up : down}</span></span>`;
        }
        return `<span class="pn-child">${name}${suspectHtml}</span>`;
      },
    },
    { headerName: 'Proxy OCIF ID',             field: 'ocifId',          sortable: false, width: 140 },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      width: 160,
      cellRenderer: (p: ICellRendererParams) =>
        p.value === 'LEGAL HOLD'
          ? `<span class="lh-pill">LEGAL HOLD</span>`
          : `<span class="lh-na">N/A</span>`,
    },
    { headerName: 'Legal Hold Name',           field: 'holdName',  width: 160, cellRenderer: (p: ICellRendererParams) => p.value || '' },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 180 },
    { headerName: 'Role Type',                 field: 'role',      width: 175 },
    { headerName: 'Address',                   field: 'address',   flex: 1, minWidth: 180 },
  ];

  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  readonly getRowId = (p: GetRowIdParams) => String((p.data as EntityRowNode)._uid);

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.processData(this.entityGridData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entityGridData'] && !changes['entityGridData'].firstChange) {
      this.processData(this.entityGridData);
    }
  }

  // ── Data processing (replaces loadData / service call) ─────────────────────

  private processData(data: EntityNode[]): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    try {
      if (!data || !data.length) {
        this.tree = [];
        this.rowData.set([]);
        this.isLoading.set(false);
        this.showChipsSection.set(false);
        return;
      }

      this.uidMap.clear();
      this.tree = this.stampTree(data, 0, '');
      this.rowData.set(this.buildFlat(this.tree));
      this.isLoading.set(false);
      this.showChipsSection.set(true);
    } catch {
      this.loadError.set(true);
      this.isLoading.set(false);
    }
  }

  // ── Tree helpers ────────────────────────────────────────────────────────────

  private stampTree(nodes: EntityNode[], level: number, parentUid: string): EntityRowNode[] {
    return nodes.map((n, i) => {
      const uid         = parentUid ? `${parentUid}-${i}` : `r${i}`;
      const hasChildren = Array.isArray(n.children) && n.children.length > 0;
      const row: EntityRowNode = {
        ...n,
        _uid:          uid,
        _level:        level,
        _isParent:     hasChildren,
        _expanded:     hasChildren,
        _selected:     false,
        _isClusterEnd: false,
        children:      hasChildren ? this.stampTree(n.children, level + 1, uid) : [],
      };
      this.uidMap.set(uid, row);
      return row;
    });
  }

  private buildFlat(nodes: EntityRowNode[], out: EntityRowNode[] = [], isRoot = true): EntityRowNode[] {
    for (const n of nodes) {
      n._isClusterEnd = false;
      out.push(n);
      if (n._isParent && n._expanded) {
        this.buildFlat(n.children, out, false);
      }
    }

    if (isRoot) {
      for (let i = 0; i < out.length; i++) {
        const next          = out[i + 1];
        const nextIsRoot    = next && next._level === 0;
        const isLastInArray = i === out.length - 1;
        if (nextIsRoot || isLastInArray) out[i]._isClusterEnd = true;
      }
    }

    return out;
  }

  // ── Filter methods ──────────────────────────────────────────────────────────

  removeFilter(id: string): void {
    this.selectedFilterIds = this.selectedFilterIds.filter(fId => fId !== id);
    this.syncColumns();
  }

  resetFilters(): void {
    this.selectedFilterIds = this.filterOptions.map(opt => opt.id);
    this.syncColumns();
  }

  onFilterChange(): void {
    this.selectedFilterIds = this.selectedFilterIds.filter(id => id !== 'SELECT_ALL');
    this.syncColumns();
  }

  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
    const allSelected = this.selectedFilterIds.length === this.filterOptions.length;
    this.selectedFilterIds = allSelected ? [] : this.filterOptions.map(opt => opt.id);
    this.onFilterChange();
  }

  private syncColumns(): void {
    if (!this.gridApi) return;
    this.filterOptions.forEach(opt => {
      this.gridApi.setColumnVisible(opt.id, this.selectedFilterIds.includes(opt.id));
    });
    this.gridApi.sizeColumnsToFit();
  }

  // ── Grid events ─────────────────────────────────────────────────────────────

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  onCellClicked(e: CellClickedEvent): void {
    if (e.colDef.field !== 'profileName') return;
    const node = e.data as EntityRowNode;
    if (!node?._isParent) return;

    const target = e.event?.target as HTMLElement | null;
    if (target?.closest('.ag-selection-checkbox') || target?.closest('.ag-checkbox-input-wrapper')) return;

    node._expanded = !node._expanded;

    const next    = this.buildFlat(this.tree);
    const curSet  = new Set(this.rowData().map(r => r._uid));
    const nextSet = new Set(next.map(r => r._uid));
    const add     = next.filter(r => !curSet.has(r._uid));
    const remove  = this.rowData().filter(r => !nextSet.has(r._uid));

    this.rowData.set(next);
    this.gridApi.applyTransaction({ add, remove });
    this.gridApi.redrawRows();
    this.syncModelToGrid();
  }

  readonly getRowClass = (p: RowClassParams): string => {
    const node     = p.data as EntityRowNode;
    const lvl      = node?._level ?? 0;
    const end      = node?._isClusterEnd ? ' row-cluster-end' : '';
    const expanded = node?._isParent && node?._expanded ? ' row-expanded' : '';

    if (lvl === 0) return `row-root row-is-parent${expanded}${end}`;
    const type = node?._isParent ? 'row-is-parent' : 'row-is-leaf';
    return `row-child row-child-l${Math.min(lvl, 10)} ${type}${expanded}${end}`;
  };

  // ── Selection ────────────────────────────────────────────────────────────────

  onSelectionChanged(): void {
    if (this.updating) return;
    this.updating = true;

    try {
      const prev = new Set<string>();
      this.collectSelected(this.tree, prev);

      this.gridApi.forEachNode(gn => {
        const n = this.uidMap.get((gn.data as EntityRowNode)._uid);
        if (n) n._selected = gn.isSelected() ?? false;
      });

      const now = new Set<string>();
      this.collectSelected(this.tree, now);

      for (const uid of now) {
        if (!prev.has(uid)) {
          const n = this.uidMap.get(uid);
          if (n?._isParent) this.setAllDesc(n.children, true);
        }
      }

      for (const uid of prev) {
        if (!now.has(uid)) {
          const n = this.uidMap.get(uid);
          if (n?._isParent) this.setAllDesc(n.children, false);
        }
      }

      this.recomputeParents(this.tree);
      this.syncModelToGrid();
    } finally {
      this.updating = false;
    }

    this.emitSelection();
  }

  private collectSelected(nodes: EntityRowNode[], out: Set<string>): void {
    for (const n of nodes) {
      if (n._selected) out.add(n._uid);
      if (n.children.length) this.collectSelected(n.children, out);
    }
  }

  private setAllDesc(nodes: EntityRowNode[], sel: boolean): void {
    for (const n of nodes) {
      n._selected = sel;
      if (n.children.length) this.setAllDesc(n.children, sel);
    }
  }

  private recomputeParents(nodes: EntityRowNode[]): boolean {
    if (!nodes.length) return true;
    let all = true;
    for (const n of nodes) {
      if (n._isParent && n.children.length) {
        n._selected = this.recomputeParents(n.children);
      }
      if (!n._selected) all = false;
    }
    return all;
  }

  private syncModelToGrid(): void {
    this.gridApi.forEachNode(gn => {
      const n = this.uidMap.get((gn.data as EntityRowNode)._uid);
      if (n) gn.setSelected(n._selected, false, 'api');
    });
  }

  private emitSelection(): void {
    const selected = this.gridApi.getSelectedRows() as EntityRowNode[];

    if (!selected.length) {
      this.selectionChanged.emit([]);
      return;
    }

    const selectedClusters: EntityRowNode[][] = [];
    for (const row of selected) {
      const root = this.findRootOf(this.tree, row._uid);
      if (root && root._uid === row._uid) {
        selectedClusters.push(this.flattenNode(root));
      }
    }

    this.selectionChanged.emit({ selectedRows: selected, selectedClusters });
  }

  // ── Tree utilities ───────────────────────────────────────────────────────────

  private findRootOf(nodes: EntityRowNode[], uid: string): EntityRowNode | null {
    for (const n of nodes) {
      if (n._uid === uid) return n;
      if (n.children.length && this.findByUid(n.children, uid)) return n;
    }
    return null;
  }

  private findByUid(nodes: EntityRowNode[], uid: string): EntityRowNode | null {
    for (const n of nodes) {
      if (n._uid === uid) return n;
      if (n.children.length) {
        const f = this.findByUid(n.children, uid);
        if (f) return f;
      }
    }
    return null;
  }

  private flattenNode(n: EntityRowNode): EntityRowNode[] {
    const out: EntityRowNode[] = [n];
    for (const c of n.children) out.push(...this.flattenNode(c));
    return out;
  }

  // ── Pagination ───────────────────────────────────────────────────────────────

  onPaginationChanged(): void {
    if (!this.gridApi) return;
    this.currentPage.set(this.gridApi.paginationGetCurrentPage() + 1);
    this.totalPages.set(this.gridApi.paginationGetTotalPages() || 1);
    this.totalRows.set(this.gridApi.paginationGetRowCount());
  }

  goToPage(page: number): void {
    if (!this.gridApi || page < 1 || page > this.totalPages()) return;
    this.gridApi.paginationGoToPage(page - 1);
  }

  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.gridApi.updateGridOptions({ paginationPageSize: size });
  }
}
