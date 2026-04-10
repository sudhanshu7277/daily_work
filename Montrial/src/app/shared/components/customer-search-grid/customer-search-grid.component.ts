import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  GetRowIdParams,
  ICellRendererParams,
} from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerSearchService } from './customer-search.service';
import { CustomerNode } from './customer-search.model';

// ─────────────────────────────────────────────────────────────────────────────
// Custom Checkbox Cell Renderer — #0079C1 fill, white SVG tick
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cs-checkbox-cell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cs-cb-wrap" (click)="onClick($event)">
      <span class="cs-cb-box" [class.cs-cb-box--on]="checked">
        <svg *ngIf="checked" viewBox="0 0 12 10" fill="none" width="12" height="10">
          <polyline points="1,5 4.5,9 11,1"
                    stroke="#fff" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </span>`,
  styles: [`
    :host { display:flex; align-items:center; justify-content:center; width:100%; }
    .cs-cb-wrap { display:inline-flex; align-items:center; cursor:pointer; padding:6px; }
    .cs-cb-box {
      width:18px; height:18px; min-width:18px; border-radius:3px;
      border:1.5px solid #96a6b4; background:#fff;
      display:flex; align-items:center; justify-content:center;
      transition:background .12s, border-color .12s; flex-shrink:0;
    }
    .cs-cb-wrap:hover .cs-cb-box { border-color:#0079C1; }
    .cs-cb-box--on { background:#0079C1 !important; border-color:#0079C1 !important; }
  `],
})
export class CheckboxCellComponent {
  checked = false;
  private uid    = '';
  private onCheck!: (uid: string) => void;
  constructor(private cdr: ChangeDetectorRef) {}
  agInit(p: ICellRendererParams): void {
    this.checked = !!(p.data as any)?._selected;
    this.uid     = (p.data as any)?._uid ?? '';
    this.onCheck = (p as any).onCheck;
  }
  refresh(p: ICellRendererParams): boolean {
    this.checked = !!(p.data as any)?._selected;
    this.uid     = (p.data as any)?._uid ?? '';
    this.cdr.markForCheck();
    return true;
  }
  onClick(e: MouseEvent): void { e.stopPropagation(); this.onCheck?.(this.uid); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Header Checkbox — none / some (dash) / all (tick)
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cs-header-checkbox',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cs-cb-wrap" (click)="onClick($event)">
      <span class="cs-cb-box"
            [class.cs-cb-box--on]="state==='all'"
            [class.cs-cb-box--on]="state==='some'">
        <svg *ngIf="state==='all'" viewBox="0 0 12 10" fill="none" width="12" height="10">
          <polyline points="1,5 4.5,9 11,1" stroke="#fff" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg *ngIf="state==='some'" viewBox="0 0 12 2" fill="none" width="12" height="2">
          <line x1="1" y1="1" x2="11" y2="1" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </span>
    </span>`,
  styles: [`
    :host { display:flex; align-items:center; justify-content:center; width:100%; }
    .cs-cb-wrap { display:inline-flex; align-items:center; cursor:pointer; padding:6px; }
    .cs-cb-box {
      width:18px; height:18px; min-width:18px; border-radius:3px;
      border:1.5px solid #96a6b4; background:#fff;
      display:flex; align-items:center; justify-content:center;
      transition:background .12s, border-color .12s; flex-shrink:0;
    }
    .cs-cb-wrap:hover .cs-cb-box { border-color:#0079C1; }
    .cs-cb-box--on { background:#0079C1 !important; border-color:#0079C1 !important; }
  `],
})
export class HeaderCheckboxComponent {
  state: 'none' | 'some' | 'all' = 'none';
  private onSelectAll!: (select: boolean) => void;
  constructor(private cdr: ChangeDetectorRef) {}
  agInit(p: any): void { this.state = p.state ?? 'none'; this.onSelectAll = p.onSelectAll; }
  refresh(p: any): boolean { this.state = p.state ?? 'none'; this.cdr.markForCheck(); return true; }
  onClick(e: MouseEvent): void { e.stopPropagation(); this.onSelectAll?.(this.state !== 'all'); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Name + Chevron — NO checkboxSelection flag on this column
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-profile-name-cell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cs-name-cell">
      <span [class]="isParent ? 'pn-parent' : 'pn-child'">{{ name }}</span>
      <button *ngIf="isParent" class="cs-chevron-btn" (click)="onChevronClick($event)">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
             [style.transform]="expanded ? 'rotate(0deg)' : 'rotate(-90deg)'"
             style="transition:transform .2s ease;display:block;">
          <path d="M4.5 7.5l4.5 4.5 4.5-4.5" stroke="#0079C1" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </span>`,
  styles: [`
    :host { display:flex; align-items:center; width:100%; overflow:hidden; }
    .cs-name-cell { display:inline-flex; align-items:center; gap:6px; width:100%; overflow:hidden; }
    .pn-parent { color:#0079C1; font-weight:700; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0; }
    .pn-child  { color:#0079C1; font-weight:400; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0; }
    .cs-chevron-btn { background:none!important; border:none; padding:3px; cursor:pointer; display:inline-flex; align-items:center; flex-shrink:0; border-radius:3px; margin-left:auto; outline:none; }
    .cs-chevron-btn:hover,.cs-chevron-btn:focus,.cs-chevron-btn:active { background:none!important; outline:none; }
  `],
})
export class ProfileNameCellComponent {
  name = ''; isParent = false; expanded = true;
  private uid = ''; private onToggle!: (uid: string) => void;
  constructor(private cdr: ChangeDetectorRef) {}
  agInit(p: ICellRendererParams): void {
    this.name = String(p.value ?? ''); this.isParent = !!(p.data as any)?._isParent;
    this.expanded = !!(p.data as any)?._expanded; this.uid = (p.data as any)?._uid ?? '';
    this.onToggle = (p as any).onToggle;
  }
  refresh(p: ICellRendererParams): boolean {
    this.name = String(p.value ?? ''); this.isParent = !!(p.data as any)?._isParent;
    this.expanded = !!(p.data as any)?._expanded; this.uid = (p.data as any)?._uid ?? '';
    this.cdr.markForCheck(); return true;
  }
  onChevronClick(e: MouseEvent): void { e.stopPropagation(); this.onToggle?.(this.uid); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    // CheckboxCellComponent, HeaderCheckboxComponent, ProfileNameCellComponent are
    // NOT declared here. AG Grid resolves them at runtime via cellRenderer /
    // headerComponent in the column definitions — Angular's compiler does not
    // need them in the imports array for that to work.
  ],
  templateUrl: './customer-search.component.html',
  styleUrls:  ['./customer-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomerSearchComponent implements OnInit, OnDestroy {
  @Output() selectionChanged = new EventEmitter<CustomerNode[]>();

  private gridApi!: GridApi;
  rowData: any[] = [];
  private tree:   any[] = [];

  isLoading = true;
  loadError = false;

  private readonly destroy$ = new Subject<void>();

  // ── Pagination state ──────────────────────────────────────────────────────
  /** All flattened rows (across all pages) */
  private allRows: any[] = [];

  currentPage   = 1;
  pageSize      = 10;
  totalRows     = 0;
  totalPages    = 1;
  pageNumbers:  (number | '…')[] = [];
  pageSizeOpts  = [10, 25, 50, 100];

  get paginationFrom(): number { return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get paginationTo():   number { return Math.min(this.currentPage * this.pageSize, this.totalRows); }

  readonly getRowId = (p: GetRowIdParams) => String(p.data._uid);

  columnDefs: ColDef[] = [];

  readonly defaultColDef: ColDef = {
    resizable:        true,
    suppressMovable:  true,
    cellStyle:        { display: 'flex', alignItems: 'center' },
    // Ensure AG Grid never adds its own checkbox to any column
    checkboxSelection:       false,
    headerCheckboxSelection: false,
  };

  constructor(
    private readonly svc: CustomerSearchService,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone,
  ) {}

  ngOnInit(): void { this.buildColumns(); this.loadData(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Columns (no checkboxSelection / headerCheckboxSelection on Profile Name) ─
  private buildColumns(): void {
    this.columnDefs = [
      {
        headerName:  '',
        field:       '_selected',
        width:       52,
        sortable:    false,
        resizable:   false,
        suppressMovable: true,
        cellRenderer:       CheckboxCellComponent,
        cellRendererParams: { onCheck: (uid: string) => this.onCheckboxClick(uid) },
        headerComponent:       HeaderCheckboxComponent,
        headerComponentParams: {
          state:       this.headerCheckState(),
          onSelectAll: (select: boolean) => this.onSelectAll(select),
        },
        cellStyle: { display:'flex', alignItems:'center', justifyContent:'center', padding:'0' },
      },
      {
        headerName: 'Profile Name',
        field:      'legalName',
        sortable:   true,
        minWidth:   220,
        flex:       2,
        // ── KEY FIX: NO checkboxSelection / headerCheckboxSelection here ──────
        cellRenderer:       ProfileNameCellComponent,
        cellRendererParams: { onToggle: (uid: string) => this.toggleExpand(uid) },
      },
      { headerName: 'Proxy OCIF ID',             field: 'ocifId',         sortable: false, width: 140 },
      {
        headerName: 'Legal Hold Status',
        field:      'status',
        sortable:   true,
        width:      170,
        cellRenderer: (p: ICellRendererParams) =>
          p.value === 'LEGAL HOLD'
            ? `<span class="cs-lh-pill">LEGAL HOLD</span>`
            : `<span class="cs-lh-na">N/A</span>`,
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
        // Allow text to wrap so it never gets cut off
        wrapText:   true,
        autoHeight: false,
        cellStyle: {
          display:       'flex',
          alignItems:    'center',
          whiteSpace:    'normal',
          lineHeight:    '1.4',
          paddingTop:    '6px',
          paddingBottom: '6px',
          wordBreak:     'break-word',
        },
      },
    ];
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  loadData(): void {
    this.isLoading = true;
    this.loadError = false;

    this.svc.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.tree    = res.data as any[];
          this.stampTree(this.tree, '');
          this.allRows = this.buildFlat(this.tree);
          this.currentPage = 1;
          this.applyPage();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('[CustomerSearch] load error', err);
          this.loadError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ── Tree helpers ──────────────────────────────────────────────────────────
  private stampTree(nodes: any[], parentUid: string): void {
    nodes.forEach((n, i) => {
      const uid       = parentUid ? `${parentUid}-${i}` : `r${i}`;
      n._uid          = uid;
      n._isParent     = Array.isArray(n.children) && n.children.length > 0;
      n._expanded     = true;
      n._selected     = false;
      n._isClusterEnd = false;
      if (n._isParent) this.stampTree(n.children, uid);
    });
  }

  private buildFlat(nodes: any[]): any[] {
    const out: any[] = [];
    for (const n of nodes) {
      n._isClusterEnd = false;
      out.push({ ...n });
      if (n._isParent) {
        if (n._expanded) {
          n.children.forEach((c: any, idx: number) => {
            c._isClusterEnd = idx === n.children.length - 1;
            out.push({ ...c });
          });
        } else {
          out[out.length - 1]._isClusterEnd = true;
        }
      }
    }
    return out;
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  private applyPage(): void {
    this.allRows   = this.buildFlat(this.tree);
    this.totalRows = this.allRows.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);

    const start  = (this.currentPage - 1) * this.pageSize;
    this.rowData = this.allRows.slice(start, start + this.pageSize);
    this.pageNumbers = this.buildPageNumbers();
    this.updateHeaderCheckbox();
  }

  private buildPageNumbers(): (number | '…')[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '…')[] = [1];
    if (cur > 3)            pages.push('…');
    const lo = Math.max(2, cur - 1);
    const hi = Math.min(total - 1, cur + 1);
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (cur < total - 2)    pages.push('…');
    pages.push(total);
    return pages;
  }

  goPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.applyPage();
    this.cdr.detectChanges();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyPage();
    this.cdr.detectChanges();
  }

  // ── Refresh ───────────────────────────────────────────────────────────────
  private refreshGrid(): void {
    this.applyPage();
    this.cdr.detectChanges();
  }

  private updateHeaderCheckbox(): void {
    if (!this.gridApi) return;
    const col = this.gridApi.getColumnDef('_selected') as any;
    if (col?.headerComponentParams) {
      col.headerComponentParams.state = this.headerCheckState();
      this.gridApi.refreshHeader();
    }
  }

  private headerCheckState(): 'none' | 'some' | 'all' {
    const all = this.getAllSelectableNodes();
    if (!all.length) return 'none';
    const n = all.filter(x => x._selected).length;
    return n === 0 ? 'none' : n === all.length ? 'all' : 'some';
  }

  private getAllSelectableNodes(): any[] {
    const out: any[] = [];
    for (const n of this.tree) { out.push(n); (n.children ?? []).forEach((c: any) => out.push(c)); }
    return out;
  }

  // ── Expand / collapse ────────────────────────────────────────────────────
  toggleExpand(uid: string): void {
    const node = this.tree.find(n => n._uid === uid);
    if (!node) return;
    node._expanded = !node._expanded;
    this.refreshGrid();
  }

  // ── Checkbox click — single entry point ──────────────────────────────────
  onCheckboxClick(uid: string): void {
    let clicked: any = null;
    let parent: any  = null;

    for (const n of this.tree) {
      if (n._uid === uid) { clicked = n; break; }
      for (const c of (n.children ?? [])) {
        if (c._uid === uid) { clicked = c; parent = n; break; }
      }
      if (clicked) break;
    }
    if (!clicked) return;

    const next = !clicked._selected;
    clicked._selected = next;

    if (clicked._isParent) {
      // Cascade to ALL children regardless of count
      (clicked.children ?? []).forEach((c: any) => c._selected = next);
    } else if (parent) {
      // Bubble up: parent selected ↔ every child selected
      parent._selected =
        parent.children.length > 0 &&
        parent.children.every((c: any) => c._selected);
    }

    this.refreshGrid();
    this.emitSelected();
  }

  onSelectAll(select: boolean): void {
    for (const n of this.tree) {
      n._selected = select;
      (n.children ?? []).forEach((c: any) => c._selected = select);
    }
    this.refreshGrid();
    this.emitSelected();
  }

  private emitSelected(): void {
    const sel = this.getAllSelectableNodes().filter(n => n._selected) as CustomerNode[];
    console.log('[CustomerSearch] Selected rows:', sel);
    this.selectionChanged.emit(sel);
  }

  // ── Row class ─────────────────────────────────────────────────────────────
  readonly getRowClass = (p: any): string => {
    const d   = p.data as any;
    const end = d?._isClusterEnd ? ' row-cluster-end' : '';
    if (d?._isParent) return d._expanded ? `row-parent-expanded${end}` : `row-parent-collapsed${end}`;
    return `row-child${end}`;
  };

  onGridReady(e: GridReadyEvent): void { this.gridApi = e.api; }
  onSelectionChanged(): void {}
  onPaginationChanged(): void {}
}
