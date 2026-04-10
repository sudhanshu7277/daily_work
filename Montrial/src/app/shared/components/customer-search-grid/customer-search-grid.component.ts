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
// Custom Checkbox Cell Renderer
// Renders a fully styled checkbox (#0079C1 bg + white tick).
// Owns its own click → triggers parent component's handler via callback.
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cs-checkbox-cell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cs-cb-wrap" (click)="onClick($event)">
      <span class="cs-cb-box" [class.cs-cb-box--checked]="checked">
        <svg *ngIf="checked" class="cs-cb-tick"
             viewBox="0 0 12 10" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <polyline points="1,5 4.5,9 11,1"
                    stroke="#ffffff" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </span>`,
  styles: [`
    :host { display: flex; align-items: center; justify-content: center; width: 100%; }
    .cs-cb-wrap {
      display:     inline-flex;
      align-items: center;
      cursor:      pointer;
      padding:     4px;
    }
    .cs-cb-box {
      width:         18px;
      height:        18px;
      min-width:     18px;
      border-radius: 3px;
      border:        1.5px solid #96a6b4;
      background:    #ffffff;
      display:       flex;
      align-items:   center;
      justify-content: center;
      transition:    background .12s, border-color .12s;
      flex-shrink:   0;
    }
    .cs-cb-box:hover { border-color: #0079C1; }
    .cs-cb-box--checked {
      background:   #0079C1 !important;
      border-color: #0079C1 !important;
    }
    .cs-cb-tick {
      width:  12px;
      height: 10px;
      display: block;
      flex-shrink: 0;
    }
  `],
})
export class CheckboxCellComponent {
  checked = false;
  private uid   = '';
  private onCheck!: (uid: string) => void;

  agInit(params: ICellRendererParams): void {
    this.checked  = !!(params.data as any)?._selected;
    this.uid      = (params.data as any)?._uid ?? '';
    this.onCheck  = (params as any).onCheck;
  }

  refresh(params: ICellRendererParams): boolean {
    this.checked = !!(params.data as any)?._selected;
    this.uid     = (params.data as any)?._uid ?? '';
    (this as any).cdr?.markForCheck();
    return true;
  }

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.onCheck) this.onCheck(this.uid);
  }

  constructor(private cdr: ChangeDetectorRef) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Name + Chevron Cell Renderer
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
          <path d="M4.5 7.5l4.5 4.5 4.5-4.5"
                stroke="#0079C1" stroke-width="2"
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
  name     = '';
  isParent = false;
  expanded = true;
  private uid      = '';
  private onToggle!: (uid: string) => void;

  constructor(private cdr: ChangeDetectorRef) {}

  agInit(params: ICellRendererParams): void {
    this.name     = String(params.value ?? '');
    this.isParent = !!(params.data as any)?._isParent;
    this.expanded = !!(params.data as any)?._expanded;
    this.uid      = (params.data as any)?._uid ?? '';
    this.onToggle = (params as any).onToggle;
  }

  refresh(params: ICellRendererParams): boolean {
    this.name     = String(params.value ?? '');
    this.isParent = !!(params.data as any)?._isParent;
    this.expanded = !!(params.data as any)?._expanded;
    this.uid      = (params.data as any)?._uid ?? '';
    this.cdr.markForCheck();
    return true;
  }

  onChevronClick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.onToggle) this.onToggle(this.uid);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Header Checkbox Cell Renderer
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cs-header-checkbox',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cs-cb-wrap" (click)="onClick($event)">
      <span class="cs-cb-box"
            [class.cs-cb-box--checked]="state === 'all'"
            [class.cs-cb-box--indet]="state === 'some'">
        <svg *ngIf="state === 'all'" class="cs-cb-tick"
             viewBox="0 0 12 10" fill="none">
          <polyline points="1,5 4.5,9 11,1"
                    stroke="#ffffff" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg *ngIf="state === 'some'" class="cs-cb-dash"
             viewBox="0 0 12 2" fill="none">
          <line x1="1" y1="1" x2="11" y2="1"
                stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </span>
    </span>`,
  styles: [`
    :host { display:flex; align-items:center; justify-content:center; width:100%; }
    .cs-cb-wrap { display:inline-flex; align-items:center; cursor:pointer; padding:4px; }
    .cs-cb-box {
      width:18px; height:18px; min-width:18px;
      border-radius:3px; border:1.5px solid #96a6b4;
      background:#fff;
      display:flex; align-items:center; justify-content:center;
      transition:background .12s,border-color .12s; flex-shrink:0;
    }
    .cs-cb-box:hover { border-color:#0079C1; }
    .cs-cb-box--checked, .cs-cb-box--indet { background:#0079C1!important; border-color:#0079C1!important; }
    .cs-cb-tick { width:12px; height:10px; display:block; }
    .cs-cb-dash { width:12px; height:2px;  display:block; }
  `],
})
export class HeaderCheckboxComponent {
  /** 'none' | 'some' | 'all' */
  state: 'none' | 'some' | 'all' = 'none';
  private onSelectAll!: (select: boolean) => void;

  agInit(params: any): void {
    this.state        = params.state ?? 'none';
    this.onSelectAll  = params.onSelectAll;
  }

  refresh(params: any): boolean {
    this.state = params.state ?? 'none';
    (this as any).cdr?.markForCheck();
    return true;
  }

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.onSelectAll) this.onSelectAll(this.state !== 'all');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Grid Component
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, AgGridAngular, CheckboxCellComponent, ProfileNameCellComponent, HeaderCheckboxComponent],
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomerSearchComponent implements OnInit, OnDestroy {
  @Output() selectionChanged = new EventEmitter<CustomerNode[]>();

  private gridApi!: GridApi;
  rowData: any[] = [];

  /** Master tree — single source of truth for selection + expand state */
  private tree: any[] = [];

  isLoading = true;
  loadError = false;

  private readonly destroy$ = new Subject<void>();

  readonly pageSize = 25;

  readonly getRowId = (p: GetRowIdParams) => String(p.data._uid);

  // ── Columns ─────────────────────────────────────────────────────────────────
  columnDefs: ColDef[] = [];   // built after component init so callbacks bind correctly

  readonly defaultColDef: ColDef = {
    resizable:       true,
    suppressMovable: true,
    cellStyle:       { display: 'flex', alignItems: 'center' },
  };

  constructor(
    private readonly svc: CustomerSearchService,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.buildColumns();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Build column defs (after init so arrow fns close over `this`) ───────────
  private buildColumns(): void {
    this.columnDefs = [
      {
        headerName:  '',
        field:       '_selected',
        width:       52,
        sortable:    false,
        resizable:   false,
        suppressMovable: true,
        // Custom checkbox cell
        cellRenderer:       CheckboxCellComponent,
        cellRendererParams: { onCheck: (uid: string) => this.onCheckboxClick(uid) },
        // Custom header checkbox
        headerComponent:       HeaderCheckboxComponent,
        headerComponentParams: {
          state:       this.headerCheckState(),
          onSelectAll: (select: boolean) => this.onSelectAll(select),
        },
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' },
      },
      {
        headerName: 'Profile Name',
        field:      'legalName',
        sortable:   true,
        minWidth:   220,
        flex:       2,
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
      { headerName: 'Address',                   field: 'address',        flex: 1, minWidth: 180 },
    ];
  }

  // ── Load ────────────────────────────────────────────────────────────────────
  loadData(): void {
    this.isLoading = true;
    this.loadError = false;

    this.svc.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.tree    = res.data as any[];
          this.stampTree(this.tree, '');
          this.rowData = this.buildFlat(this.tree);
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

  // ── Stamp tree ───────────────────────────────────────────────────────────────
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

  // ── Flatten tree → visible rows ─────────────────────────────────────────────
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

  // ── Refresh row data + header checkbox ─────────────────────────────────────
  private refreshGrid(): void {
    this.rowData = this.buildFlat(this.tree);
    // Update header checkbox state
    this.updateHeaderCheckbox();
    this.cdr.detectChanges();
  }

  private updateHeaderCheckbox(): void {
    if (!this.gridApi) return;
    const state = this.headerCheckState();
    // Refresh header via column def params update
    const col = this.gridApi.getColumnDef('_selected') as any;
    if (col?.headerComponentParams) {
      col.headerComponentParams.state = state;
      this.gridApi.refreshHeader();
    }
  }

  private headerCheckState(): 'none' | 'some' | 'all' {
    const allRows = this.getAllSelectableNodes();
    if (allRows.length === 0) return 'none';
    const selectedCount = allRows.filter(n => n._selected).length;
    if (selectedCount === 0)             return 'none';
    if (selectedCount === allRows.length) return 'all';
    return 'some';
  }

  /** Returns every parent + every child node from tree */
  private getAllSelectableNodes(): any[] {
    const out: any[] = [];
    for (const n of this.tree) {
      out.push(n);
      (n.children ?? []).forEach((c: any) => out.push(c));
    }
    return out;
  }

  // ── Expand / collapse ───────────────────────────────────────────────────────
  toggleExpand(uid: string): void {
    const node = this.tree.find(n => n._uid === uid);
    if (!node) return;
    node._expanded = !node._expanded;
    this.refreshGrid();
  }

  // ── CHECKBOX CLICK — single entry point for all selection logic ─────────────
  /**
   * Called when any row checkbox is clicked.
   * uid identifies exactly which node was clicked.
   *
   * Rules:
   *  1. Parent clicked → toggle parent + set ALL children to parent's new state.
   *  2. Child clicked  → toggle child.
   *               → if ALL children now selected → select parent too.
   *               → if ANY child now deselected  → deselect parent.
   */
  onCheckboxClick(uid: string): void {
    // Find the node in the tree
    let clickedNode: any = null;
    let parentNode: any  = null;

    for (const n of this.tree) {
      if (n._uid === uid) { clickedNode = n; break; }
      for (const c of (n.children ?? [])) {
        if (c._uid === uid) { clickedNode = c; parentNode = n; break; }
      }
      if (clickedNode) break;
    }

    if (!clickedNode) return;

    const newState = !clickedNode._selected;
    clickedNode._selected = newState;

    if (clickedNode._isParent) {
      // Rule 1: cascade to ALL children (n-deep safe for one level, extend loop for deeper)
      (clickedNode.children ?? []).forEach((c: any) => c._selected = newState);
    } else if (parentNode) {
      // Rule 2 / 3: bubble up
      const allChildrenSelected =
        parentNode.children.length > 0 &&
        parentNode.children.every((c: any) => c._selected);
      parentNode._selected = allChildrenSelected;
    }

    this.refreshGrid();
    this.emitSelected();
  }

  // ── Select All ──────────────────────────────────────────────────────────────
  onSelectAll(select: boolean): void {
    for (const n of this.tree) {
      n._selected = select;
      (n.children ?? []).forEach((c: any) => c._selected = select);
    }
    this.refreshGrid();
    this.emitSelected();
  }

  // ── Emit ────────────────────────────────────────────────────────────────────
  private emitSelected(): void {
    const selected = this.getAllSelectableNodes().filter(n => n._selected) as CustomerNode[];
    console.log('[CustomerSearch] Selected rows:', selected);
    this.selectionChanged.emit(selected);
  }

  // ── Row class ────────────────────────────────────────────────────────────────
  readonly getRowClass = (p: any): string => {
    const d   = p.data as any;
    const end = d?._isClusterEnd ? ' row-cluster-end' : '';
    if (d?._isParent) {
      return d._expanded
        ? `row-parent-expanded${end}`
        : `row-parent-collapsed${end}`;
    }
    return `row-child${end}`;
  };

  // ── Grid events ─────────────────────────────────────────────────────────────
  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  // We manage selection ourselves — AG Grid's selectionChanged not needed
  onSelectionChanged(): void {}
  onPaginationChanged(): void {}
}
