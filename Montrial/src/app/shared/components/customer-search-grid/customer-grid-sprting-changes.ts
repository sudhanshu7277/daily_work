import {
    ColDef,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    SortChangedEvent,         // ← ADD
  } from 'ag-grid-community';

  //Add sort state fields after pageSizeOpts:
typescriptprivate sortField: string | null       = null;
private sortDir:   'asc' | 'desc' | null = null;

//3. In NameHeaderComponent — add sort field, onSort callback, and sort icon to template:
//In the class fields add:
//typescript

sort: 'none' | 'asc' | 'desc' = 'none';
private onSort!: () => void;

//In agInit() add:
//typescript

this.sort   = p.sort   ?? 'none';
this.onSort = p.onSort;

//In refresh() add:
//typescript

this.sort = p.sort ?? 'none';

//Add onSortClick method:
//typescript

onSortClick(e: MouseEvent): void {
  e.stopPropagation();
  this.onSort?.();
}

//Add sort icon to the template after <span class="hdr-label">Profile Name</span>:

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

// Add to NameHeaderComponent styles:

.hdr-sort { display:inline-flex; align-items:center; margin-left:4px; cursor:pointer; flex-shrink:0; opacity:0.7; }
.hdr-sort:hover { opacity:1; }

// 4. In columnDefs — update headerComponentParams for the legalName column:

headerComponentParams: {
    state:       'none' as 'none' | 'some' | 'all',
    sort:        'none' as 'none' | 'asc' | 'desc',   // ← ADD
    onSelectAll: (select: boolean) => this.onSelectAll(select),
    onSort:      () => this.toggleProfileNameSort(),   // ← ADD
  },


  // Also add suppressHeaderMenuButton: true to the legalName column def.
// 5. Sort this.tree inside refresh() before flattenTree():


if (this.sortField && this.sortDir) {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const f   = this.sortField;
    this.tree.sort((a, b) => {
      const av = String(a[f] ?? '').toLowerCase();
      const bv = String(b[f] ?? '').toLowerCase();
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }


  // 6. Update syncHeaderCheckbox() — also pass sort state into header params:

  const sort: 'none' | 'asc' | 'desc' =
  this.sortField === 'legalName' && this.sortDir ? this.sortDir : 'none';

this.columnDefs[0] = {
  ...this.columnDefs[0],
  headerComponentParams: {
    ...this.columnDefs[0].headerComponentParams,
    state,
    sort,   // ← ADD
  },
};


// 7. Add toggleProfileNameSort() method:

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


  // 8. Add onSortChanged() method:

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


  // HTML change — add (sortChanged) to the grid tag:

  (sortChanged)="onSortChanged($event)"


  // SCSS change — hide AG Grid's native sort icon on the legalName column (we render our own), keep it for Legal Hold Status:

  .ag-header-cell[col-id="legalName"] {
    .ag-sort-indicator-container,
    .ag-sort-indicator-icon { display: none !important; }
  }