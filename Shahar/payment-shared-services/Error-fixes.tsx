// File 1: name-renderers.component.ts
// Change 1: In NameHeaderComponent template & styles
// Replace the header template markup and styles inside 
// @Component({...}) with the parallel bidirectional SVG arrow:


//Find:

<span class="header-text">{{ displayName }}</span>
      <span *ngIf="isSortable" class="sort-icon">...</span>

    // Replace with:

    <span class="header-text" (click)="onSortRequested($event)">
        {{ displayName }}
      </span>

      <span
        *ngIf="isSortable"
        class="sort-icon-btn"
        (click)="onSortRequested($event)"
      >
        <svg class="sort-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Up Arrow -->
          <g [attr.class]="currentSort === 'asc' ? 'arrow-active' : 'arrow-inactive'">
            <path d="M4 11V3M4 3L1.5 5.5M4 3L6.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <!-- Down Arrow -->
          <g [attr.class]="currentSort === 'desc' ? 'arrow-active' : 'arrow-inactive'">
            <path d="M10 3V11M10 11L7.5 8.5M10 11L12.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>
      </span>


      // Change 2: In NameHeaderComponent styles array
// Add or update these rules in styles: [...]:

.custom-header-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.header-text {
  font-size: 13px;
  font-weight: 700;
  color: #1c2333;
  white-space: nowrap;
}
.sort-icon-btn {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
.arrow-inactive {
  color: #a0a0a0;
  opacity: 0.7;
}
.arrow-active {
  color: #1c2333;
  opacity: 1;
}


// Change 3: In NameHeaderComponent Class body
//Add currentSort property and wire the sort state listener:

// Find:


export class NameHeaderComponent implements IHeaderAngularComp {
  params!: any;
  displayName: string = '';
  showCheckbox: boolean = true;
  state: 'none' | 'some' | 'all' = 'none';


  // Add right below:

  isSortable: boolean = true;
  currentSort: 'asc' | 'desc' | null = null;
  private onSortListener = () => this.updateSort();

  // In agInit(params: any):


  agInit(params: any): void {
    this.params = params;
    this.displayName = params.displayName || params.column.getColDef().headerName || '';
    this.showCheckbox = params.showCheckbox !== false;
    this.state = params.state || 'none';
    this.isSortable = params.column.getColDef().sortable !== false;

    // Attach AG-Grid sort listener
    params.column.addEventListener('sortChanged', this.onSortListener);
    this.updateSort();
  }


  // Add these two methods to NameHeaderComponent:


  onSortRequested(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.isSortable) return;
    // Tri-state: Initial / null -> asc -> desc -> asc
    const nextSort = this.currentSort === 'asc' ? 'desc' : 'asc';
    this.params.setSort(nextSort, false);
  }

  private updateSort(): void {
    if (!this.params?.column) return;
    const sort = this.params.column.getSort();
    this.currentSort = sort === 'asc' ? 'asc' : sort === 'desc' ? 'desc' : null;
  }

  destroy(): void {
    this.params?.column?.removeEventListener('sortChanged', this.onSortListener);
  }


  // File 2: multi-level-grid.config.ts
//Ensure sorting is enabled for both columns.

// In the profileName column definition (lines 69–85):
// Ensure sortable: true is present:


{
  field: 'profileName',
  headerName: 'Profile Name',
  sortable: true,
  minWidth: 170,
  width: 185,
  headerComponent: NameHeaderComponent,
  headerComponentParams: {
    showCheckbox: true,
    onSelectAll: onHeaderCheckClick,
    state: 'none'
  },


  // In the status (Legal Hold Status) column definition (lines 103–121):
// Ensure sortable: true is present:

{
  headerName: 'Legal Hold Status',
  field: 'status',
  sortable: true,
  width: 170,
  minWidth: 150,
  headerComponent: NameHeaderComponent,
  headerComponentParams: {
    showCheckbox: false,
    state: 'none'
  },


  //File 3: multi-level-customer-grid-component.scss
// Suppress AG-Grid's built-in pseudo-element font icons so 
// they do not show up alongside our custom SVG.

//Around lines 205–208:

// Find:


.ag-sort-indicator-icon .ag-icon,
.ag-icon-asc::before,
.ag-icon-desc::before { color: $bmo-blue !important; }



// Replace with:


.ag-sort-indicator-icon,
.ag-icon-asc::before,
.ag-icon-desc::before {
  display: none !important;
}


