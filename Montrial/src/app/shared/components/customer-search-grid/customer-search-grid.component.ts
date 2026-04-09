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
    GetRowIdParams,
  } from 'ag-grid-community';
  import { Subject } from 'rxjs';
  import { takeUntil } from 'rxjs/operators';
  import { CustomerSearchService } from './customer-search.service';
  import { CustomerNode } from './customer-search.model';
  
  @Component({
    selector: 'app-customer-search',
    standalone: true,
    imports: [CommonModule, AgGridAngular],
    templateUrl: './customer-search.component.html',
    styleUrls: ['./customer-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
  })
  export class CustomerSearchComponent implements OnInit, OnDestroy {
    @Output() selectionChanged = new EventEmitter<CustomerNode[]>();
  
    private gridApi!: GridApi;
    rowData: any[] = [];
    private tree: any[] = [];
  
    isLoading = true;
    loadError  = false;
  
    private readonly destroy$ = new Subject<void>();
    private updating = false;
  
    readonly pageSize = 25;
  
    readonly getRowId = (p: GetRowIdParams) => String((p.data as any)._uid);
  
    // ── Column definitions ─────────────────────────────────────────────────────
    readonly columnDefs: ColDef[] = [
      {
        headerName: 'Legal Name',
        field: 'legalName',
        sortable: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        minWidth: 200,
        flex: 2,
        cellRenderer: (p: any) => {
          if (!p.data) return '';
          const node = p.data as any;
          const name = String(p.value ?? '');
          return node._isParent
            ? `<span class="pn-parent">${name}</span>`
            : `<span class="pn-child">${name}</span>`;
        },
      },
      { headerName: 'OCIF ID',                   field: 'ocifId',         sortable: false, width: 140 },
      {
        headerName: 'Legal Hold Status',
        field: 'status',
        sortable: true,
        width: 160,
        cellRenderer: (p: any) =>
          p.value === 'LEGAL HOLD'
            ? `<span class="lh-pill">LEGAL HOLD</span>`
            : `<span class="lh-na">N/A</span>`,
      },
      { headerName: 'Legal Hold Name',           field: 'holdName',       width: 200, cellRenderer: (p: any) => p.value || '' },
      { headerName: 'Customer Lifecycle Status', field: 'lifecycle',      width: 190 },
      { headerName: 'Role Type',                 field: 'roleType',       width: 130 },
      { headerName: 'Customer Status',           field: 'customerStatus', width: 140 },
      { headerName: 'Address',                   field: 'address',        flex: 1, minWidth: 180 },
    ];
  
    readonly defaultColDef: ColDef = {
      resizable: true,
      suppressMovable: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    };
  
    constructor(
      private readonly svc: CustomerSearchService,
      private readonly cdr: ChangeDetectorRef,
    ) {}
  
    // ── Lifecycle ──────────────────────────────────────────────────────────────
    ngOnInit(): void { this.loadData(); }
  
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  
    loadData(): void {
      this.isLoading = true;
      this.loadError  = false;
  
      this.svc.getCustomers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.tree    = res.data;
            this.stampTree(this.tree, '');
            this.rowData = this.buildFlat(this.tree);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('[CustomerSearch] load error', err);
            this.loadError  = true;
            this.isLoading  = false;
            this.cdr.detectChanges();
          },
        });
    }
  
    // ── Tree helpers ───────────────────────────────────────────────────────────
  
    /**
     * Stamps runtime metadata:
     * _uid          — stable unique key
     * _isParent     — true when node has children
     * _isClusterEnd — true on last row of each parent cluster (set by buildFlat)
     * _selected     — selection model
     */
    private stampTree(nodes: any[], parentUid: string): void {
      nodes.forEach((n, i) => {
        const uid       = parentUid ? `${parentUid}-${i}` : `r${i}`;
        n._uid          = uid;
        n._isParent     = Array.isArray(n.children) && n.children.length > 0;
        n._selected     = false;
        n._isClusterEnd = false;
        if (n._isParent) this.stampTree(n.children, uid);
      });
    }
  
    /**
     * Flat array of all rows (no expand/collapse — always fully visible).
     * Marks _isClusterEnd on the last child of each parent cluster.
     */
    private buildFlat(nodes: any[]): any[] {
      const out: any[] = [];
  
      for (const n of nodes) {
        out.push(n);
        if (n._isParent) {
          n.children.forEach((c: any, idx: number) => {
            c._isClusterEnd = idx === n.children.length - 1;
            out.push(c);
          });
        }
      }
  
      return out;
    }
  
    // ── Grid events ────────────────────────────────────────────────────────────
    onGridReady(e: GridReadyEvent): void {
      this.gridApi = e.api;
    }
  
    /**
     * Row class drives styling:
     *   row-parent      — parent/header row (teal background)
     *   row-child-item  — child row (pale background)
     *   row-cluster-end — last child in cluster (navy bottom border)
     */
    readonly getRowClass = (p: any): string => {
      const node = p.data as any;
      const end  = node?._isClusterEnd ? ' row-cluster-end' : '';
      return node?._isParent
        ? `row-parent${end}`
        : `row-child-item${end}`;
    };
  
    // ── Selection ──────────────────────────────────────────────────────────────
    onSelectionChanged(): void {
      if (this.updating) return;
      this.updating = true;
  
      try {
        // Read grid → model
        this.gridApi.forEachNode(gn => {
          const n = this.findByUid((gn.data as any)._uid);
          if (n) n._selected = gn.isSelected();
        });
  
        // For each parent: if selected → select all children (cascade down)
        // For each parent: if all children selected → select parent (bubble up)
        for (const parent of this.tree) {
          if (!parent._isParent) continue;
  
          if (parent._selected) {
            // Parent just selected — select all children
            parent.children.forEach((c: any) => c._selected = true);
          } else {
            // Check if all children are selected → auto-select parent
            const allChildrenSelected = parent.children.every((c: any) => c._selected);
            if (allChildrenSelected && parent.children.length > 0) {
              parent._selected = true;
            }
          }
        }
  
        // Push model → grid silently
        this.syncModelToGrid();
  
      } finally {
        this.updating = false;
      }
  
      this.emitSelected();
    }
  
    private syncModelToGrid(): void {
      this.gridApi.forEachNode(gn => {
        const n = this.findByUid((gn.data as any)._uid);
        if (n) gn.setSelected(n._selected, false, 'api');
      });
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
      this.selectionChanged.emit(selected as CustomerNode[]);
    }
  
    onPaginationChanged(): void {}
  }