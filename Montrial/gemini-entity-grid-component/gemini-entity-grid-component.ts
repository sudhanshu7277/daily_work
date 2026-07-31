import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { mapLegalHoldStatusToUi } from '../../shared/services/utilities/legal-hold-status.util';
import { SortHeaderComponent } from './sort-header/sort-header.component';
import { EntityNode, EntityRowNode, EntitySelectionEvent } from './entity-grid.model';

// ── Custom Cell Renderer (from Customer Search Grid) ─────────────────────────
@Component({
  selector: 'app-entity-name-cell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="name-cell" [style.padding-left.px]="level * 20">
      <span class="cb-wrap" (click)="onCheckClick($event)">
        <span class="cb-box" [class.cb-box--checked]="selected">
          <svg *ngIf="selected" viewBox="0 0 12 10" fill="none" width="12" height="10">
            <polyline points="1,5 4.5,9 11,1" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </span>
      <span class="name-text" [class.name-text--parent]="isParent">{{ name }}</span>
      <span *ngIf="isSuspect" class="suspect-icon" title="Suspect profile(s) found for this profile">!</span>
      <button *ngIf="isParent" class="chevron-btn" (click)="onChevronClick($event)">
        <span class="chevron-icon" [class.chevron-icon--expanded]="expanded">
          <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
            <path d="M4.5 7.514.5 4.5 4.5-4.5" stroke="#0079C1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
    </div>
  `,
  styles: [`
    :host { display: flex; align-items: center; width: 100%; overflow: hidden; }
    .name-cell { display: flex; align-items: center; gap: 8px; width: 100%; overflow: hidden; }
    .cb-wrap { display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; padding: 2px; }
    .cb-box { width: 18px; height: 18px; border-radius: 3px; border: 1.5px solid #96a6b4; background: #ffffff; display: flex; align-items: center; justify-content: center; transition: background 0.12s, border-color 0.12s; flex-shrink: 0; }
    .cb-wrap:hover .cb-box { border-color: #0079C1; }
    .cb-box--checked { background: #0079C1 !important; border-color: #0079C1 !important; }
    .name-text { color: #0079C1; font-size: 13px; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
    .name-text--parent { font-weight: 700; }
    .suspect-icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background-color: #e68a00; color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; cursor: pointer; }
    .chevron-btn { background: none !important; border: none; padding: 2px; cursor: pointer; display: inline-flex; align-items: center; flex-shrink: 0; outline: none; margin-left: auto; }
    .chevron-icon { display: inline-flex; align-items: center; transform: rotate(0deg); transition: transform 0.2s ease; }
    .chevron-icon--expanded { transform: rotate(180deg); }
  `]
})
export class EntityNameCellComponent {
  name = '';
  isParent = false;
  expanded = false;
  selected = false;
  isSuspect = false;
  level = 0;
  private uid = '';
  private onCheck!: (uid: string) => void;
  private onToggle!: (uid: string) => void;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  agInit(p: ICellRendererParams): void {
    this.onCheck = (p as any).onCheck;
    this.onToggle = (p as any).onToggle;
    this.sync(p);
  }

  refresh(p: ICellRendererParams): boolean {
    this.sync(p);
    this.cdr.detectChanges();
    return true;
  }

  private sync(p: ICellRendererParams): void {
    const d = p.data as EntityRowNode;
    this.name = String(p.value ?? '');
    this.isParent = !!d?._isParent;
    this.expanded = !!d?._expanded;
    this.selected = !!d?._selected;
    this.isSuspect = !!d?.isSuspect;
    this.level = d?._level ?? 0;
    this.uid = d?._uid ?? '';
  }

  onCheckClick(e: MouseEvent): void {
    e.stopPropagation();
    this.onCheck?.(this.uid);
  }

  onChevronClick(e: MouseEvent): void {
    e.stopPropagation();
    this.onToggle?.(this.uid);
  }
}

// ── Custom Header Renderer (from Customer Search Grid) ───────────────────────
@Component({
  selector: 'app-entity-name-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="hdr-cell" (click)="onSortClick($event)">
      <span *ngIf="showCheckbox" class="cb-wrap" (click)="onClick($event)">
        <span class="cb-box" [class.cb-box--checked]="state !== 'none'">
          <svg *ngIf="state === 'all'" viewBox="0 0 12 10" fill="none" width="12" height="10">
            <polyline points="1,5 4.5,9 11,1" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg *ngIf="state === 'some'" viewBox="0 0 12 2" fill="none" width="12" height="2">
            <line x1="1" y1="1" x2="11" y2="1" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </span>
      </span>
      <span class="hdr-label">{{ showCheckbox ? 'Profile Name' : 'Legal Hold Status' }}</span>
      <svg (click)="onSortClick($event)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="sort-icon">
        <path d="M6 16.5V7.831-2.88 2.88L1.71 9.3 7 415.29 5.3-1.41L8 7.83v8.67H6z"/>
        <path d="M16 7.5v8.6712 88-2.88 1.41 1.41L15 201-5.29-5.3 1.41-1.41 2.88 2.88V7.5h2z"/>
      </svg>
    </div>
  `,
  styles: [`
    :host { display: flex; align-items: center; width: 100%; }
    .hdr-cell { display: flex; align-items: center; gap: 8px; width: 100%; }
    .cb-wrap { display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; padding: 2px; }
    .cb-box { width: 18px; height: 18px; border-radius: 3px; border: 1.5px solid #96a6b4; background: #ffffff; display: flex; align-items: center; justify-content: center; transition: background 0.12s, border-color 0.12s; flex-shrink: 0; }
    .cb-wrap:hover .cb-box { border-color: #0079C1; }
    .cb-box--checked { background: #0079C1 !important; border-color: #0079C1 !important; }
    .hdr-label { font-size: 13px; font-weight: 700; color: #1c2333; white-space: nowrap; }
  `]
})
export class EntityNameHeaderComponent {
  state: 'none' | 'some' | 'all' = 'none';
  sort: 'asc' | 'desc' | null = null;
  showCheckbox = true;
  private onSelectAll!: (v: boolean) => void;
  private params: any;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  agInit(p: any): void {
    this.params = p;
    this.state = p.state ?? 'none';
    this.onSelectAll = p.onSelectAll;
    this.showCheckbox = p.showCheckbox ?? true;
    this.sort = p.column?.getSort() ?? null;
    p.column?.addEventListener('sortChanged', () => {
      this.sort = this.params.column.getSort() ?? null;
      this.cdr.detectChanges();
    });
    this.cdr.detectChanges();
  }

  refresh(p: any): boolean {
    this.params = p;
    this.state = p.state ?? 'none';
    this.showCheckbox = p.showCheckbox ?? true;
    this.sort = p.column?.getSort() ?? null;
    this.cdr.detectChanges();
    return true;
  }

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    this.onSelectAll?.(this.state !== 'all');
  }

  onSortClick(e: MouseEvent): void {
    e.stopPropagation();
    this.params?.progressSort(e.shiftKey);
  }
}

// ── Main Entity Grid Component (Customer Search Grid Base) ───────────────────
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
    MatIconModule,
    MatButtonModule,
    SortHeaderComponent,
    EntityNameCellComponent,
    EntityNameHeaderComponent,
  ],
  templateUrl: './entity-grid.component.html',
  styleUrls: ['./entity-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EntityGridComponent implements OnInit, OnDestroy, OnChanges {
  @Input() entityGridData: any;
  @Input() searchSummary = '';

  @Input() set deselectByOcifId(record: any | null) {
    if (!record) return;
    const targetKey = this.getSelectionKey(record);
    const ocifid = typeof record === 'string' ? record : (record.ocifId || record.proxyOcifId || record.ecifId);
    if (!targetKey && !ocifid) return;

    let changed = false;
    for (const node of this.allNodes()) {
      const sameComposite = targetKey && this.getSelectionKey(node) === targetKey;
      const sameOcifFallback = !targetKey && ocifid && (node['ocifId'] === ocifid || node['proxyOcifId'] === ocifid || node['ecifId'] === ocifid);
      if ((sameComposite || sameOcifFallback) && node._selected) {
        node._selected = false;
        changed = true;
      }
    }

    for (const parent of this.tree) {
      if (parent._isParent && parent.children?.length) {
        parent._selected = parent.children.every(c => c._selected);
      }
    }

    if (changed) {
      this.refresh();
    }
  }

  @Output() selectionChanged = new EventEmitter<any>();

  showChipsSection = false;
  private gridApi!: GridApi;
  rowData: EntityRowNode[] = [];
  tree: EntityRowNode[] = [];
  isLoading = true;
  loadError = false;
  private readonly destroy$ = new Subject<void>();

  currentPage = 1;
  pageSize = 10;
  totalRows = 0;
  totalPages = 1;
  pageNumbers: (number | '...')[] = [];
  readonly pageSizeOpts = [10, 25, 50, 100];

  selectedFilterIds: any[] = [];
  readonly mandatoryColumnIds = ['profileName', 'ocifId', 'status', 'holdName', 'lifecycle', 'role', 'address'];

  columnDefs: ColDef[] = [];
  readonly defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  readonly rowSelection = {
    mode: 'multiRow' as const,
    checkboxes: false,
    headerCheckbox: false,
    enableClickSelection: false,
  };

  readonly filterOptions = [
    { id: 'profileName', label: 'Profile Name' },
    { id: 'ocifId', label: 'Proxy OCIF ID' },
    { id: 'status', label: 'Legal Hold Status' },
    { id: 'holdName', label: 'Legal Hold Name' },
    { id: 'lifecycle', label: 'Customer Lifecycle Status' },
    { id: 'role', label: 'Role Type' },
    { id: 'address', label: 'Address' },
  ];

  preserveGrid = false;

  constructor(private readonly cdr: ChangeDetectorRef) {
    this.selectedFilterIds = [...this.mandatoryColumnIds];
    this.columnDefs = [
      {
        headerName: '',
        field: 'profileName',
        sortable: true,
        comparator: () => 0,
        minWidth: 260,
        flex: 2,
        cellRenderer: EntityNameCellComponent,
        cellRendererParams: {
          onCheck: (uid: string) => this.onCheckboxClick(uid),
          onToggle: (uid: string) => this.toggleExpand(uid),
        },
        headerComponent: EntityNameHeaderComponent,
        headerComponentParams: {
          state: 'none' as 'none' | 'some' | 'all',
          onSelectAll: (select: boolean) => this.onSelectAll(select),
        },
      },
      { headerName: 'Proxy OCIF ID', field: 'ocifId', sortable: false, width: 205 },
      {
        headerName: 'Legal Hold Status',
        field: 'status',
        sortable: true,
        comparator: () => 0,
        width: 170,
        headerComponent: EntityNameHeaderComponent,
        headerComponentParams: {
          showCheckbox: false,
          state: 'none',
          onSelectAll: null,
        },
        cellRenderer: (p: ICellRendererParams) =>
          p.value === 'LEGAL HOLD'
            ? `<span class="cs-lh-pill">LEGAL HOLD</span>`
            : `<span class="cs-lh-na">N/A</span>`,
      },
      { headerName: 'Legal Hold Name', field: 'holdName', width: 200 },
      { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 190 },
      { headerName: 'Role Type', field: 'roleType', width: 130 },
      {
        headerName: 'Address',
        field: 'address',
        flex: 1,
        minWidth: 200,
        wrapText: true,
        autoHeight: false,
        cellStyle: { display: 'flex', alignItems: 'center', whiteSpace: 'normal', lineHeight: '1.4' },
      },
    ];
  }

  ngOnInit(): void {
    if (!this.entityGridData) return;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.preserveGrid) {
      this.preserveGrid = false;
      return;
    }
    if (changes['entityGridData'] && this.entityGridData && this.entityGridData.length) {
      const prev = changes['entityGridData'].previousValue;
      const curr = changes['entityGridData'].currentValue;
      if (curr && curr !== prev && (!this.tree?.length || this.tree?.length)) {
        this.isLoading = true;
        this.loadError = false;
        this.handleResponse(this.mapApiResponse(curr));
        this.syncColumns();
      }
    }
  }

  get activeFilters() {
    return this.filterOptions.filter(opt => this.selectedFilterIds.includes(opt.id));
  }

  disableOptionsAndChips(id: string): boolean {
    return this.mandatoryColumnIds.includes(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeFilter(id: string) {
    if (this.disableOptionsAndChips(id)) return;
    this.selectedFilterIds = this.selectedFilterIds.filter(fid => fid !== id);
    this.selectedFilterIds = this.normalizeSelectedFilters(this.selectedFilterIds);
    this.syncColumns();
  }

  resetFilters() {
    this.selectedFilterIds = [...this.mandatoryColumnIds];
    this.syncColumns();
  }

  syncColumns(): void {
    const selectedIds = this.selectedFilterIds;
    const fieldToFilterId: { [key: string]: string } = {
      profileName: 'profileName',
      ocifId: 'ocifId',
      status: 'status',
      holdName: 'holdName',
      lifecycle: 'lifecycle',
      roleType: 'role',
      address: 'address',
    };

    this.columnDefs = this.columnDefs.map(col => {
      const fieldName = col.field || '';
      const filterId = fieldToFilterId[fieldName];
      if (filterId) {
        return { ...col, hide: !selectedIds.includes(filterId) };
      }
      return col;
    });

    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
  }

  private handleResponse(res: any): void {
    this.tree = res.data as EntityRowNode[];
    this.stampTree(this.tree, '');
    this.showChipsSection = true;
    this.currentPage = 1;
    this.isLoading = false;
    this.refresh();
  }

  private mapPlayer = (p: any): any => ({
    profileName: p.profileName ?? '',
    ocifId: p.ocifId || p.proxyOcifId || p.ecifId || '',
    status: mapLegalHoldStatusToUi(p.legalHoldStatus),
    holdName: p.holdName ?? p.legalHoldName ?? '',
    lifecycle: p.customerLifecycleStatus ?? 'N/A',
    roleType: p.roleType ?? p.role ?? '',
    address: p.address ?? '',
    isParent: Array.isArray(p.children || p.rolePlayers) && (p.children || p.rolePlayers).length > 0,
    isExpanded: false,
    children: (p.children || p.rolePlayers || []).map((rp: any) => this.mapPlayer(rp)),
  });

  private mapApiResponse(res: any): { totalCount: number; data: any[] } {
    const results = res?.searchResult ?? res?.searchResults ?? (Array.isArray(res) ? res : []);
    const data = results.map((p: any) => this.mapPlayer(p));
    return { totalCount: data.length, data };
  }

  // ── Multi-Nested Tree Mechanics Cherry-Picked from Entity Grid ────────────
  private stampTree(nodes: EntityRowNode[], parentUid: string, level = 0): void {
    nodes.forEach((n, i) => {
      n._uid = parentUid ? `${parentUid}-${i}` : `r${i}`;
      n._level = level;
      n._isParent = Array.isArray(n.children) && n.children.length > 0;
      n._expanded = false;
      n._selected = false;
      n._isClusterEnd = false;
      if (n._isParent) this.stampTree(n.children!, n._uid, level + 1);
    });
  }

  private flattenTree(): EntityRowNode[] {
    const rows: EntityRowNode[] = [];
    const recurse = (nodes: EntityRowNode[]) => {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n._isClusterEnd = false;
        rows.push(n);
        if (n._isParent && n._expanded && n.children?.length) {
          recurse(n.children);
        }
      }
    };
    recurse(this.tree);

    for (let i = 0; i < rows.length; i++) {
      const nextIsRoot = rows[i + 1] && rows[i + 1]._level === 0;
      const isLast = i === rows.length - 1;
      if (nextIsRoot || isLast) rows[i]._isClusterEnd = true;
    }
    return rows;
  }

  refresh(): void {
    const all = this.flattenTree();
    this.totalRows = all.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.pageNumbers = this.buildPageNumbers();
    const start = (this.currentPage - 1) * this.pageSize;
    this.rowData = [...all.slice(start, start + this.pageSize)];
    this.syncHeaderCheckbox();
    this.cdr.detectChanges();
  }

  private syncHeaderCheckbox(): void {
    const nodes = this.allNodes();
    const sel = nodes.filter(n => n._selected).length;
    const state = sel === 0 ? 'none' : sel === nodes.length ? 'all' : 'some';

    if (this.columnDefs[0]) {
      this.columnDefs[0] = {
        ...this.columnDefs[0],
        headerComponentParams: { ...this.columnDefs[0].headerComponentParams, state },
      };
      this.gridApi?.refreshHeader();
    }
  }

  private allNodes(): EntityRowNode[] {
    const out: EntityRowNode[] = [];
    const collect = (nodes: EntityRowNode[]) => {
      for (const n of nodes) {
        out.push(n);
        if (n.children?.length) collect(n.children);
      }
    };
    collect(this.tree);
    return out;
  }

  private findNode(uid: string): { node: EntityRowNode; parent?: EntityRowNode } | null {
    const search = (nodes: EntityRowNode[], parent?: EntityRowNode): { node: EntityRowNode; parent?: EntityRowNode } | null => {
      for (const n of nodes) {
        if (n._uid === uid) return { node: n, parent };
        if (n.children?.length) {
          const res = search(n.children, n);
          if (res) return res;
        }
      }
      return null;
    };
    return search(this.tree);
  }

  toggleExpand(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;
    found.node._expanded = !found.node._expanded;
    this.refresh();
  }

  onCheckboxClick(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;
    const { node, parent } = found;
    node._selected = !node._selected;

    if (node._isParent && node.children?.length) {
      this.setDescendantsSelected(node.children, node._selected);
    }
    if (parent) {
      this.recomputeAncestors(this.tree);
    }

    this.refresh();
    this.emitSelected();
  }

  private setDescendantsSelected(nodes: EntityRowNode[], select: boolean): void {
    for (const n of nodes) {
      n._selected = select;
      if (n.children?.length) this.setDescendantsSelected(n.children, select);
    }
  }

  private recomputeAncestors(nodes: EntityRowNode[]): boolean {
    let all = true;
    for (const n of nodes) {
      if (n._isParent && n.children?.length) {
        n._selected = this.recomputeAncestors(n.children);
      }
      if (!n._selected) all = false;
    }
    return all;
  }

  onSelectAll(select: boolean): void {
    const setAll = (nodes: EntityRowNode[]) => {
      for (const n of nodes) {
        n._selected = select;
        if (n.children?.length) setAll(n.children);
      }
    };
    setAll(this.tree);
    this.refresh();
    this.emitSelected();
  }

  private emitSelected(): void {
    const selected: EntityRowNode[] = [];
    const collect = (nodes: EntityRowNode[]) => {
      for (const n of nodes) {
        if (n._selected) selected.push(n);
        if (n.children?.length) collect(n.children);
      }
    };
    collect(this.tree);

    this.selectionChanged.emit({
      identifier: 'entity',
      selected,
    });
  }

  private getSelectionKey(item: any): string {
    if (!item || typeof item === 'string') return '';
    const holdContext = (item.holdName || item.legalHoldName || item.holdId || '').toString().trim();
    const primaryId = item.proxyOcifId || item.ocifId || item.ecifId || item.profileId;
    if (primaryId) {
      const baseId = String(primaryId).trim();
      return holdContext ? `${baseId}::${holdContext}` : baseId;
    }
    return '';
  }

  // ── Pagination Mechanics ─────────────────────────────────────────────────────
  goPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.refresh();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.refresh();
  }

  private buildPageNumbers(): (number | '...')[] {
    const t = this.totalPages;
    const c = this.currentPage;
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (c > 3) pages.push('...');
    for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) pages.push(i);
    if (c < t - 2) pages.push('...');
    pages.push(t);
    return pages;
  }

  get paginationFrom(): number {
    return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRows);
  }

  readonly getRowClass = (p: any): string => {
    const d = p.data as EntityRowNode;
    if (d?._isParent) {
      return d._expanded ? 'row-parent-expanded' : 'row-parent-collapsed';
    }
    return d?._isClusterEnd ? 'row-child row-cluster-end' : 'row-child';
  };

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  onFilterChange(): void {
    this.selectedFilterIds = this.normalizeSelectedFilters(this.selectedFilterIds);
    this.syncColumns();
    this.cdr.detectChanges();
  }

  isAllColumnsSelected(): boolean {
    const normalized = this.normalizeSelectedFilters(this.selectedFilterIds);
    return this.filterOptions.every(opt => normalized.includes(opt.id));
  }

  isIndeterminateColumnsSelected(): boolean {
    return !this.isAllColumnsSelected();
  }

  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
    const normalized = this.normalizeSelectedFilters(this.selectedFilterIds);
    const optionalIds = this.filterOptions.map(opt => opt.id).filter(id => !this.mandatoryColumnIds.includes(id));
    const allOptionalSelected = optionalIds.every(id => normalized.includes(id));

    if (allOptionalSelected) {
      this.selectedFilterIds = [...this.mandatoryColumnIds];
    } else {
      this.selectedFilterIds = this.filterOptions.map(opt => opt.id);
    }
    this.onFilterChange();
  }

  private normalizeSelectedFilters(ids: string[]): string[] {
    const nonSelectAll = ids.filter(id => id !== 'SELECT_ALL');
    const merged = [...this.mandatoryColumnIds, ...nonSelectAll];
    return Array.from(new Set(merged));
  }
}