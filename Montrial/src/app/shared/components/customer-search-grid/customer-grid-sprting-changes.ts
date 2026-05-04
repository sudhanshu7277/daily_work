//NameHeaderComponent (the second @Component in the file)
//Fields — add sort and onSort alongside existing state:

state: 'none' | 'some' | 'all' = 'none';
sort:  'none' | 'asc' | 'desc' = 'none';  // ← ADD
private onSelectAll!: (v: boolean) => void;
private onSort!: () => void;               // ← ADD



// agInit() — add two lines:

agInit(p: any): void {
    this.state       = p.state   ?? 'none';
    this.sort        = p.sort    ?? 'none';  // ← ADD
    this.onSelectAll = p.onSelectAll;
    this.onSort      = p.onSort;             // ← ADD
    this.cdr.detectChanges();
  }

  // refresh() — add one line:

  refresh(p: any): boolean {
    this.state = p.state ?? 'none';
    this.sort  = p.sort  ?? 'none';  // ← ADD
    this.cdr.detectChanges();
    return true;
  }

  // onSortClick() method — add alongside onClick():

  onSortClick(e: MouseEvent): void {
    e.stopPropagation();
    this.onSort?.();
  }

  // Template — add sort icon after <span class="hdr-label">Profile Name</span>:

  <span class="hdr-sort" (click)="onSortClick($event)">
  <svg *ngIf="sort === 'none'" viewBox="0 0 10 14" fill="none" width="10" height="14">
    <path d="M5 1v12M1 4l4-3 4 3M1 10l4 3 4-3"
          stroke="#1c2333" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg *ngIf="sort === 'asc'" viewBox="0 0 10 14" fill="none" width="10" height="14">
    <path d="M5 1v12M1 4l4-3 4 3"
          stroke="#0079C1" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg *ngIf="sort === 'desc'" viewBox="0 0 10 14" fill="none" width="10" height="14">
    <path d="M5 1v12M1 10l4 3 4-3"
          stroke="#0079C1" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</span>

  // Styles — add inside NameHeaderComponent's styles: [...]:

  .hdr-sort { display:inline-flex; align-items:center; margin-left:4px; cursor:pointer; flex-shrink:0; opacity:0.7; }
.hdr-sort:hover { opacity:1; }

// CustomerSearchGridComponent (the third and main @Component)
//Import — SortChangedEvent in the ag-grid-community import at the top of the file.
//Fields — add after pageSizeOpts:

private sortField: string | null        = null;
private sortDir:   'asc' | 'desc' | null = null;

// columnDefs constructor — on the legalName column, add suppressHeaderMenuButton and update headerComponentParams:

suppressHeaderMenuButton: true,
headerComponentParams: {
  state:       'none' as 'none' | 'some' | 'all',
  sort:        'none' as 'none' | 'asc' | 'desc',  // ← ADD
  onSelectAll: (select: boolean) => this.onSelectAll(select),
  onSort:      () => this.toggleProfileNameSort(),  // ← ADD
},

// refresh() — add sort block before flattenTree():

if (this.sortField && this.sortDir) {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const f   = this.sortField;
    this.tree.sort((a, b) => {
      const av = String(a[f] ?? '').toLowerCase();
      const bv = String(b[f] ?? '').toLowerCase();
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }

  // syncHeaderCheckbox() — add sort to the params spread:

  const sort: 'none' | 'asc' | 'desc' =
  this.sortField === 'legalName' && this.sortDir ? this.sortDir : 'none';

this.columnDefs[0] = {
  ...this.columnDefs[0],
  headerComponentParams: {
    ...this.columnDefs[0].headerComponentParams,
    state,
    sort,  // ← ADD
  },
};

// New methods — add before onGridReady():

private toggleProfileNameSort(): void {
    if (this.sortField !== 'legalName') {
      this.sortField = 'legalName';
      this.sortDir   = 'asc';
    } else if (this.sortDir === 'asc') {
      this.sortDir = 'desc';
    } else {
      this.sortField = null;
      this.sortDir   = null;
    }
    this.gridApi?.applyColumnState({
      state:        [{ colId: 'legalName', sort: this.sortDir ?? null }],
      defaultState: { sort: null },
    });
    this.currentPage = 1;
    this.refresh();
  }
  
  onSortChanged(e: SortChangedEvent): void {
    const col = e.api.getColumnState().find(c => c.sort != null);
    if (col) {
      this.sortField = col.colId;
      this.sortDir   = col.sort as 'asc' | 'desc';
    } else {
      this.sortField = null;
      this.sortDir   = null;
    }
    this.currentPage = 1;
    this.refresh();
  }


  // HTML — ag-grid-angular tag
// Add one binding:


(sortChanged)="onSortChanged($event)"


// SCSS — inside ::ng-deep .ag-theme-alpine.csg-grid
// Add after the existing sort icon rules:

.ag-header-cell[col-id="legalName"] {
    .ag-sort-indicator-container,
    .ag-sort-indicator-icon { display: none !important; }
  }