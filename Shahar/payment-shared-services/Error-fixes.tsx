//File 1: selection-panel.component.html
// Find lines 195–198 in #applyModal:

<th class="col-name sortable" tabindex="0" [attr.aria-sort]="applySortDirection === 'asc' ? 'ascending' : applySortDirection === 'desc' ? 'descending' : 'none'" (click)="toggleApplySort()" (keydown.enter)="toggleApplySort()" (keydown.space)="$event.preventDefault(); toggleApplySort()">
  {{selectionPanelVerbiage.name | translate}}<mat-icon aria-hidden="true">swap_vert</mat-icon></th>


  //Replace those lines with:

  <th class="col-name sortable" tabindex="0" 
    [attr.aria-sort]="applySortDirection === 'asc' ? 'ascending' : applySortDirection === 'desc' ? 'descending' : 'none'" 
    (click)="toggleApplySort()" 
    (keydown.enter)="toggleApplySort()" 
    (keydown.space)="$event.preventDefault(); toggleApplySort()">
  <span>{{ selectionPanelVerbiage.name | translate }}</span>
  <svg class="sort-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Up Arrow -->
    <path [class.arrow-active]="applySortDirection === 'asc'" class="arrow-path"
          d="M4 11V3M4 3L1.5 5.5M4 3L6.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Down Arrow -->
    <path [class.arrow-active]="applySortDirection === 'desc'" class="arrow-path"
          d="M10 3V11M10 11L7.5 8.5M10 11L12.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</th>



//File 2: selection-panel.component.ts
// Find toggleApplySort() around lines 324–331:


toggleApplySort(): void {
  this.applySortDirection = this.applySortDirection === 'asc' ? 'desc' : 'asc';
  this.filteredModalRows = [...this.filteredModalRows].sort((a, b) => {
    const nameA = (a.legalName || a.profileName || '').toLowerCase();
    const nameB = (b.legalName || b.profileName || '').toLowerCase();
    return this.applySortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
}


//Replace with:

toggleApplySort(): void {
  // Cycle: null (initial grey) -> 'asc' (up black) -> 'desc' (down black) -> 'asc'
  this.applySortDirection = this.applySortDirection === 'asc' ? 'desc' : 'asc';

  this.filteredModalRows = [...this.filteredModalRows].sort((a, b) => {
    const nameA = (a.legalName || a.profileName || '').toLowerCase();
    const nameB = (b.legalName || b.profileName || '').toLowerCase();
    return this.applySortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
  this.cdr.detectChanges();
}


//File 3: selection-panel.component.scss
// In the table header section around lines 338–360:

// Find:

th {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
  text-align: left;
  padding: 15px 8px;
  font-size: 12px;
  font-weight: 700;
  color: #000;
  border-bottom: 1px solid #e0e0e0;
  mat-icon {
    font-size: 16px;
    vertical-align: middle;
    margin-left: 4px;
    margin-top: 4px;
  }

  &.sortable {
    cursor: pointer;
    user-select: none;
  }
}


// Replace with:


th {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
  text-align: left;
  padding: 15px 8px;
  font-size: 12px;
  font-weight: 700;
  color: #000;
  border-bottom: 1px solid #e0e0e0;

  &.sortable {
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .sort-icon {
      cursor: pointer;
      flex-shrink: 0;
      vertical-align: middle;
      margin-left: 4px;
    }

    .arrow-path {
      color: #a0a0a0;
      opacity: 0.6;
      transition: color 0.15s ease, opacity 0.15s ease;
    }

    .arrow-path.arrow-active {
      color: #1c2333;
      opacity: 1;
    }

    &:hover .arrow-path:not(.arrow-active) {
      opacity: 0.85;
    }
  }
}


