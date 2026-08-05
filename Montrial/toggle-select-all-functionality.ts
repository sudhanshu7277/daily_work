// 1. Updated toggleSelectAll in TypeScript



toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
  
    // 1. Determine if all optional columns are already selected
    const optionalIds = this.filterOptions
      .map(opt => opt.id)
      .filter(id => !this.mandatoryColumnIds.includes(id));
  
    const allOptionalSelected = optionalIds.every(id =>
      this.selectedFilterIds.includes(id)
    );
  
    if (allOptionalSelected) {
      // 🔴 DESELECT ALL: Revert back to mandatory columns only
      this.selectedFilterIds = [...this.mandatoryColumnIds];
      this.onSelectAll(false); // Uncheck all data grid rows
    } else {
      // 🔵 SELECT ALL: Select all filter options + dummy 'SELECT_ALL' tag for Material state
      this.selectedFilterIds = [
        'SELECT_ALL',
        ...this.filterOptions.map(opt => opt.id)
      ];
      this.onSelectAll(true); // Check all data grid rows
    }
  
    // 2. Sync columns, clean up dummy values, and trigger CD
    this.onFilterChange();
  }


  // 2. Updated Helper Functions
//Ensure isAllColumnsSelected() and normalizeSelectedFilters() cleanly ignore the 'SELECT_ALL' value so it doesn't break column rendering:

isAllColumnsSelected(): boolean {
    const optionalIds = this.filterOptions
      .map(opt => opt.id)
      .filter(id => !this.mandatoryColumnIds.includes(id));
  
    return optionalIds.every(id => this.selectedFilterIds.includes(id));
  }
  
  isIndeterminateColumnsSelected(): boolean {
    const optionalIds = this.filterOptions
      .map(opt => opt.id)
      .filter(id => !this.mandatoryColumnIds.includes(id));
  
    const selectedCount = optionalIds.filter(id =>
      this.selectedFilterIds.includes(id)
    ).length;
  
    return selectedCount > 0 && selectedCount < optionalIds.length;
  }
  
  private normalizeSelectedFilters(ids: string[]): string[] {
    // Strip out dummy 'SELECT_ALL' value so it doesn't affect column definitions
    const nonSelectAll = ids.filter(id => id !== 'SELECT_ALL');
    const merged = [...this.mandatoryColumnIds, ...nonSelectAll];
    return Array.from(new Set(merged));
  }

  // 3. Template Fix (customer-search-grid.component.html)
//Make sure your template binds both [class.is-checked] and [selected] to isAllColumnsSelected() on the <mat-option>:

<mat-option
  class="select-all-option"
  [selected]="isAllColumnsSelected()"
  [class.is-checked]="isAllColumnsSelected()"
  [class.is-indeterminate]="isIndeterminateColumnsSelected()"
  value="SELECT_ALL"
  (click)="toggleSelectAll($event)">
  Select All
</mat-option>

// new code //
<mat-option
  class="select-all-option"
  [class.is-checked]="isAllColumnsSelected()"
  [class.is-indeterminate]="isIndeterminateColumnsSelected()"
  value="SELECT_ALL"
  (click)="toggleSelectAll($event)">
  Select All
</mat-option>


toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
  
    const optionalIds = this.filterOptions
      .map(opt => opt.id)
      .filter(id => !this.mandatoryColumnIds.includes(id));
  
    const allOptionalSelected = optionalIds.every(id =>
      this.selectedFilterIds.includes(id)
    );
  
    if (allOptionalSelected) {
      // 🔴 DESELECT ALL: Keep only mandatory columns
      this.selectedFilterIds = [...this.mandatoryColumnIds];
      this.onSelectAll(false);
    } else {
      // 🔵 SELECT ALL: Include SELECT_ALL and all filter options
      this.selectedFilterIds = [
        'SELECT_ALL',
        ...this.filterOptions.map(opt => opt.id)
      ];
      this.onSelectAll(true);
    }
  
    this.onFilterChange();
  }