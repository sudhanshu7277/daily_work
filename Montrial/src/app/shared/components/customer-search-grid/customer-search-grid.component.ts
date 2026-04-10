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
// Profile Name cell renderer — standalone Angular component.
// Avoids AG Grid HTML sanitiser that strips plain <button> elements.
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-profile-name-cell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cs-name-cell">
      <span [class]="isParent ? 'pn-parent' : 'pn-child'">{{ name }}</span>
      <button
        *ngIf="isParent"
        class="cs-chevron-btn"
        (click)="onChevronClick($event)">
        <!--
          expanded = true  → chevron points DOWN  (rotate 0°)
          expanded = false → chevron points RIGHT (rotate -90°)
        -->
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
             [style.transform]="expanded ? 'rotate(0deg)' : 'rotate(-90deg)'"
             style="transition: transform .2s ease; display: block;">
          <path d="M4.5 7.5l4.5 4.5 4.5-4.5"
                stroke="#1a4fa0" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </span>`,
  styles: [`
    :host { display: flex; align-items: center; width: 100%; overflow: hidden; }
    .cs-name-cell {
      display:     inline-flex;
      align-items: center;
      gap:         6px;
      width:       100%;
      overflow:    hidden;
    }
    .pn-parent {
      color:         #1a4fa0;
      font-weight:   700;
      font-size:     13px;
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
      flex:          1;
      min-width:     0;
    }
    .pn-child {
      color:         #1a4fa0;
      font-weight:   400;
      font-size:     13px;
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
      flex:          1;
      min-width:     0;
    }
    .cs-chevron-btn {
      background:    none;
      border:        none;
      padding:       3px;
      cursor:        pointer;
      display:       inline-flex;
      align-items:   center;
      flex-shrink:   0;
      border-radius: 3px;
      margin-left:   auto;
      /* No hover background at all */
      outline:       none;
    }
    .cs-chevron-btn:hover { background: none; }
    .cs-chevron-btn:focus { outline: none; }
    .cs-chevron-btn:active { background: none; }
  `],
})
export class ProfileNameCellComponent {
  name     = '';
  isParent = false;
  expanded = true;

  onToggle!: (uid: string) => void;
  private uid = '';

  constructor(private cdr: ChangeDetectorRef) {}

  agInit(params: ICellRendererParams): void {
    this.name     = String(params.value ?? '');
    this.isParent = !!(params.data as any)?._isParent;
    this.expanded = !!(params.data as any)?._expanded;
    this.uid      = (params.data as any)?._uid ?? '';
    this.onToggle = (params as any).onToggle;
  }

  /** Called by AG Grid when row data changes — must return true to keep this instance */
  refresh(params: ICellRendererParams): boolean {
    this.name     = String(params.value ?? '');
    this.isParent = !!(params.data as any)?._isParent;
    this.expanded = !!(params.data as any)?._expanded;
    this.uid      = (params.data as any)?._uid ?? '';
    // Manually trigger OnPush change detection so the template re-evaluates
    this.cdr.markForCheck();
    return true;
  }

  onChevronClick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.onToggle) this.onToggle(this.uid);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main customer search grid component
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, AgGridAngular, ProfileNameCellComponent],
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.scss'],
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
  private syncing = false;

  readonly pageSize = 25;

  readonly getRowId = (p: GetRowIdParams) => String(p.data._uid);

  // ── Columns ─────────────────────────────────────────────────────────────────
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'legalName',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      minWidth: 220,
      flex: 2,
      cellRenderer: ProfileNameCellComponent,
      cellRendererParams: {
        onToggle: (uid: string) => this.toggleExpand(uid),
      },
    },
    { headerName: 'Proxy OCIF ID',             field: 'ocifId',         sortable: false, width: 140 },
    {
      headerName: 'Legal Hold Status',
      field: 'status',
      sortable: true,
      width: 170,
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

  readonly defaultColDef: ColDef = {
    resizable:      true,
    suppressMovable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  constructor(
    private readonly svc: CustomerSearchService,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone,
  ) {}

  ngOnInit():    void { this.loadData(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

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

  // ── Tree helpers ─────────────────────────────────────────────────────────────
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

  /**
   * Flatten visible rows from tree.
   * Each node is spread into a new object so AG Grid detects the change
   * and re-evaluates getRowClass + triggers cell renderer refresh().
   */
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
          // Collapsed — parent itself carries the closing border
          out[out.length - 1]._isClusterEnd = true;
        }
      }
    }
    return out;
  }

  // ── Expand / collapse ────────────────────────────────────────────────────────
  toggleExpand(uid: string): void {
    const node = this.tree.find(n => n._uid === uid);
    if (!node) return;
    node._expanded = !node._expanded;
    this.rowData   = this.buildFlat(this.tree);
    this.cdr.detectChanges();
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

  // ── Selection ────────────────────────────────────────────────────────────────
  onSelectionChanged(): void {
    if (this.syncing) return;
    this.syncing = true;

    try {
      // 1. Grid → model
      this.gridApi.forEachNode(gn => {
        const n = this.findByUid((gn.data as any)?._uid);
        if (n) n._selected = gn.isSelected() ?? false;
      });

      // 2. Cascade parent→children, bubble children→parent
      for (const parent of this.tree) {
        if (!parent._isParent) continue;
        if (parent._selected) {
          parent.children.forEach((c: any) => (c._selected = true));
        } else {
          const allKids =
            parent.children.length > 0 &&
            parent.children.every((c: any) => c._selected);
          if (allKids) parent._selected = true;
        }
      }

      // 3. Model → grid (silent)
      this.gridApi.forEachNode(gn => {
        const n = this.findByUid((gn.data as any)?._uid);
        if (n) gn.setSelected(n._selected, false, 'api');
      });

    } finally {
      this.syncing = false;
    }

    this.emitSelected();
  }

  private findByUid(uid: string): any | null {
    for (const n of this.tree) {
      if (n._uid === uid) return n;
      for (const c of n.children ?? []) {
        if (c._uid === uid) return c;
      }
    }
    return null;
  }

private emitSelected(): void {
  const selected: any[] = this.gridApi.getSelectedRows();
  console.log('[CustomerSearch] Selected:', selected);
  this.selectionChanged.emit(selected as CustomerNode[]);
}

  onGridReady(e: GridReadyEvent): void { this.gridApi = e.api; }
  onPaginationChanged(): void {}
}
