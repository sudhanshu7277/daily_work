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
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerSearchService } from './customer-search.service';
import { CustomerNode } from './customer-search.model';

// ─────────────────────────────────────────────────────────────────────────────
// GridRow — runtime shape stamped on every node at load time
// ─────────────────────────────────────────────────────────────────────────────
export interface GridRow {
  _uid:          string;
  _isParent:     boolean;
  _expanded:     boolean;
  _selected:     boolean;
  _isClusterEnd: boolean;
  children?:     GridRow[];
  [key: string]: any;
}

// =============================================================================
// NameCellComponent — [checkbox] + [name] + [chevron]
// This is the ONLY checkbox in the grid.
// ChangeDetectionStrategy.Default + explicit cdr.detectChanges() in agInit/refresh
// guarantees the checkbox renders correctly regardless of Angular zone context.
// =============================================================================
@Component({
  selector: 'app-cs-name-cell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="name-cell">

      <span class="cb-wrap" (click)="onCheckClick($event)">
        <span class="cb-box" [class.cb-box--checked]="selected">
          <svg *ngIf="selected" viewBox="0 0 12 10" fill="none" width="12" height="10">
            <polyline points="1,5 4.5,9 11,1"
                      stroke="#ffffff" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </span>

      <span class="name-text" [class.name-text--parent]="isParent">{{ name }}</span>

      <!-- Chevron: ▼ expanded (0°)  |  ▶ collapsed (−90°) -->
      <button *ngIf="isParent" class="chevron-btn" (click)="onChevronClick($event)">
        <svg viewBox="0 0 18 18" fill="none" width="18" height="18"
             [style.transform]="expanded ? 'rotate(0deg)' : 'rotate(-90deg)'"
             style="transition:transform .2s ease;display:block;">
          <path d="M4.5 7.5l4.5 4.5 4.5-4.5"
                stroke="#0079C1" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

    </div>`,
  styles: [`
    :host { display:flex; align-items:center; width:100%; overflow:hidden; }
    .name-cell { display:flex; align-items:center; gap:8px; width:100%; overflow:hidden; }
    .cb-wrap { display:inline-flex; align-items:center; cursor:pointer; flex-shrink:0; padding:2px; }
    .cb-box {
      width:18px; height:18px; border-radius:3px;
      border:1.5px solid #96a6b4; background:#ffffff;
      display:flex; align-items:center; justify-content:center;
      transition:background .12s, border-color .12s; flex-shrink:0;
    }
    .cb-wrap:hover .cb-box { border-color:#0079C1; }
    .cb-box--checked { background:#0079C1 !important; border-color:#0079C1 !important; }
    .name-text {
      color:#0079C1; font-size:13px; font-weight:400;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0;
    }
    .name-text--parent { font-weight:700; }
    .chevron-btn {
      background:none !important; border:none; padding:2px; cursor:pointer;
      display:inline-flex; align-items:center; flex-shrink:0; outline:none; margin-left:auto;
    }
    .chevron-btn:hover,
    .chevron-btn:focus,
    .chevron-btn:active { background:none !important; }
  `],
})
export class NameCellComponent {
  name     = '';
  isParent = false;
  expanded = false;
  selected = false;

  private uid       = '';
  private onCheck!:  (uid: string) => void;
  private onToggle!: (uid: string) => void;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  agInit(p: ICellRendererParams): void {
    this.onCheck  = (p as any).onCheck;
    this.onToggle = (p as any).onToggle;
    this.sync(p);
    this.cdr.detectChanges();
  }

  refresh(p: ICellRendererParams): boolean {
    this.sync(p);
    this.cdr.detectChanges();
    return true;
  }

  private sync(p: ICellRendererParams): void {
    const d       = p.data as GridRow;
    this.name     = String(p.value ?? '');
    this.isParent = !!d?._isParent;
    this.expanded = !!d?._expanded;
    this.selected = !!d?._selected;
    this.uid      = d?._uid ?? '';
  }

  onCheckClick(e: MouseEvent):   void { e.stopPropagation(); this.onCheck?.(this.uid); }
  onChevronClick(e: MouseEvent): void { e.stopPropagation(); this.onToggle?.(this.uid); }
}

// =============================================================================
// NameHeaderComponent — [checkbox none/some/all] + "Profile Name" label
// =============================================================================
@Component({
  selector: 'app-cs-name-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="hdr-cell">
      <span class="cb-wrap" (click)="onClick($event)">
        <span class="cb-box" [class.cb-box--checked]="state !== 'none'">
          <svg *ngIf="state === 'all'" viewBox="0 0 12 10" fill="none" width="12" height="10">
            <polyline points="1,5 4.5,9 11,1"
                      stroke="#ffffff" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg *ngIf="state === 'some'" viewBox="0 0 12 2" fill="none" width="12" height="2">
            <line x1="1" y1="1" x2="11" y2="1"
                  stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </span>
      </span>
      <span class="hdr-label">Profile Name</span>
    </div>`,
  styles: [`
    :host { display:flex; align-items:center; width:100%; }
    .hdr-cell { display:flex; align-items:center; gap:8px; width:100%; }
    .cb-wrap { display:inline-flex; align-items:center; cursor:pointer; flex-shrink:0; padding:2px; }
    .cb-box {
      width:18px; height:18px; border-radius:3px;
      border:1.5px solid #96a6b4; background:#ffffff;
      display:flex; align-items:center; justify-content:center;
      transition:background .12s, border-color .12s; flex-shrink:0;
    }
    .cb-wrap:hover .cb-box { border-color:#0079C1; }
    .cb-box--checked { background:#0079C1 !important; border-color:#0079C1 !important; }
    .hdr-label { font-size:13px; font-weight:700; color:#1c2333; white-space:nowrap; }
  `],
})
export class NameHeaderComponent {
  state: 'none' | 'some' | 'all' = 'none';
  private onSelectAll!: (v: boolean) => void;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  agInit(p: any): void {
    this.state       = p.state ?? 'none';
    this.onSelectAll = p.onSelectAll;
    this.cdr.detectChanges();
  }

  refresh(p: any): boolean {
    this.state = p.state ?? 'none';
    this.cdr.detectChanges();
    return true;
  }

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    this.onSelectAll?.(this.state !== 'all');
  }
}

// =============================================================================
// CustomerSearchComponent
// =============================================================================
@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './customer-search.component.html',
  styleUrls:   ['./customer-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomerSearchComponent implements OnInit, OnDestroy {
  @Output() selectionChanged = new EventEmitter<CustomerNode[]>();

  private gridApi!: GridApi;
  rowData: GridRow[] = [];
  private tree: GridRow[] = [];

  isLoading = true;
  loadError = false;

  private readonly destroy$ = new Subject<void>();

  currentPage  = 1;
  pageSize     = 10;
  totalRows    = 0;
  totalPages   = 1;
  pageNumbers: (number | '…')[] = [];
  readonly pageSizeOpts = [10, 25, 50, 100];

  get paginationFrom(): number {
    return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }
  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRows);
  }

  columnDefs: ColDef[] = [];

  readonly defaultColDef: ColDef = {
    resizable:       true,
    suppressMovable: true,
    cellStyle:       { display: 'flex', alignItems: 'center' },
  };

  constructor(
    private readonly svc: CustomerSearchService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.columnDefs = [
      {
        headerName:            '',
        field:                 'legalName',
        sortable:              true,
        minWidth:              260,
        flex:                  2,
        cellRenderer:          NameCellComponent,
        cellRendererParams:    {
          onCheck:  (uid: string) => this.onCheckboxClick(uid),
          onToggle: (uid: string) => this.toggleExpand(uid),
        },
        headerComponent:       NameHeaderComponent,
        headerComponentParams: {
          state:       'none' as 'none' | 'some' | 'all',
          onSelectAll: (select: boolean) => this.onSelectAll(select),
        },
      },
      { headerName: 'Proxy OCIF ID',             field: 'ocifId',         sortable: false, width: 140 },
      {
        headerName:   'Legal Hold Status',
        field:        'status',
        sortable:     true,
        width:        170,
        cellRenderer: (p: ICellRendererParams) =>
          p.value === 'LEGAL HOLD'
            ? '<span class="cs-lh-pill">LEGAL HOLD</span>'
            : '<span class="cs-lh-na">N/A</span>',
      },
      { headerName: 'Legal Hold Name',           field: 'holdName',       width: 200 },
      { headerName: 'Customer Lifecycle Status', field: 'lifecycle',      width: 190 },
      { headerName: 'Role Type',                 field: 'roleType',       width: 130 },
      { headerName: 'Customer Status',           field: 'customerStatus', width: 140 },
      {
        headerName: 'Address',
        field:      'address',
        flex:       1,
        minWidth:   200,
        wrapText:   true,
        autoHeight: false,
        cellStyle: {
          display: 'flex', alignItems: 'center',
          whiteSpace: 'normal', lineHeight: '1.4',
          paddingTop: '6px', paddingBottom: '6px', wordBreak: 'break-word',
        },
      },
    ];
  }

  ngOnInit():    void { this.loadData(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Load ──────────────────────────────────────────────────────────────────
  loadData(): void {
    this.isLoading = true;
    this.loadError = false;
    this.svc.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.tree        = res.data as GridRow[];
          this.stampTree(this.tree, '');
          this.currentPage = 1;
          this.isLoading   = false;
          this.refresh();
        },
        error: err => {
          console.error('[CustomerSearch] load error', err);
          this.loadError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ── Stamp metadata on every node once at load ─────────────────────────────
  private stampTree(nodes: GridRow[], parentUid: string): void {
    nodes.forEach((n, i) => {
      n._uid          = parentUid ? `${parentUid}-${i}` : `r${i}`;
      n._isParent     = Array.isArray(n.children) && n.children.length > 0;
      n._expanded     = true;
      n._selected     = false;
      n._isClusterEnd = false;
      if (n._isParent) this.stampTree(n.children!, n._uid);
    });
  }

  // ── Flatten tree → visible rows ───────────────────────────────────────────
  private flattenTree(): GridRow[] {
    const rows: GridRow[] = [];
    for (const n of this.tree) {
      n._isClusterEnd = false;
      rows.push({ ...n });
      if (n._isParent) {
        if (n._expanded) {
          n.children!.forEach((c, idx) => {
            c._isClusterEnd = idx === n.children!.length - 1;
            rows.push({ ...c });
          });
        } else {
          // Collapsed: stamp _isClusterEnd on the parent (used for data only,
          // getRowClass does NOT use it for collapsed parents)
          rows[rows.length - 1]._isClusterEnd = true;
        }
      }
    }
    return rows;
  }

  // ── Central refresh — flattens, paginates, syncs header ──────────────────
  private refresh(): void {
    const all        = this.flattenTree();
    this.totalRows   = all.length;
    this.totalPages  = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.pageNumbers = this.buildPageNumbers();

    const start  = (this.currentPage - 1) * this.pageSize;
    // New array reference forces AG Grid to fully re-render all rows,
    // ensuring cell renderers receive fresh _selected / _expanded values.
    this.rowData = [...all.slice(start, start + this.pageSize)];

    this.syncHeaderCheckbox();
    this.cdr.detectChanges();
  }

  // ── Sync header checkbox state ────────────────────────────────────────────
  private syncHeaderCheckbox(): void {
    const nodes = this.allNodes();
    const sel   = nodes.filter(n => n._selected).length;
    const state: 'none' | 'some' | 'all' =
      sel === 0            ? 'none' :
      sel === nodes.length ? 'all'  : 'some';

    // Spread into new object so AG Grid detects the param change
    this.columnDefs[0] = {
      ...this.columnDefs[0],
      headerComponentParams: { ...this.columnDefs[0].headerComponentParams, state },
    };
    this.gridApi?.refreshHeader();
  }

  private allNodes(): GridRow[] {
    return this.tree.flatMap(n => [n, ...(n.children ?? [])]);
  }

  private findNode(uid: string): { node: GridRow; parent?: GridRow } | null {
    for (const n of this.tree) {
      if (n._uid === uid) return { node: n };
      const child = (n.children ?? []).find(c => c._uid === uid);
      if (child) return { node: child, parent: n };
    }
    return null;
  }

  // ── Expand / collapse ─────────────────────────────────────────────────────
  toggleExpand(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;
    found.node._expanded = !found.node._expanded;
    this.refresh();
  }

  // ── Checkbox: cascade down, bubble up ─────────────────────────────────────
  onCheckboxClick(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;

    const { node, parent } = found;
    node._selected = !node._selected;

    if (node._isParent) {
      // Cascade: all children mirror parent state
      (node.children ?? []).forEach(c => c._selected = node._selected);
    } else if (parent) {
      // Bubble up: parent checked only when ALL children are checked
      parent._selected = (parent.children ?? []).every(c => c._selected);
    }

    this.refresh();
    this.emitSelected();
  }

  // ── Select / deselect all ─────────────────────────────────────────────────
  onSelectAll(select: boolean): void {
    this.tree.forEach(n => {
      n._selected = select;
      (n.children ?? []).forEach(c => c._selected = select);
    });
    this.refresh();
    this.emitSelected();
  }

  private emitSelected(): void {
    const selected = this.allNodes()
      .filter(n => n._selected) as unknown as CustomerNode[];
    console.log('[CustomerSearch] Selected rows:', selected);
    this.selectionChanged.emit(selected);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  goPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.refresh();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.refresh();
  }

  private buildPageNumbers(): (number | '…')[] {
    const t = this.totalPages;
    const c = this.currentPage;
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (c > 3) pages.push('…');
    for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) pages.push(i);
    if (c < t - 2) pages.push('…');
    pages.push(t);
    return pages;
  }

  // ── Row class ─────────────────────────────────────────────────────────────
  // Expanded parent  → row-parent-expanded  (blue top border — sandwich open)
  // Collapsed parent → row-parent-collapsed (plain border — no sandwich)
  // Child            → row-child [row-cluster-end on last child]
  readonly getRowClass = (p: any): string => {
    const d = p.data as GridRow;
    if (d?._isParent) {
      return d._expanded ? 'row-parent-expanded' : 'row-parent-collapsed';
    }
    return d?._isClusterEnd ? 'row-child row-cluster-end' : 'row-child';
  };

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }
}
