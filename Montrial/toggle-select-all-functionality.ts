// 1. Update customer-search-grid.component.ts
//Replace isAllColumnsSelected(), isIndeterminateColumnsSelected(), and toggleSelectAll() with these implementation methods:

isAllColumnsSelected(): boolean {
    // Only check if all optional (toggleable) columns are currently present in selectedFilterIds
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
  
  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
  
    if (this.isAllColumnsSelected()) {
      // 🔴 UNSELECT ALL: Keep mandatory columns only
      this.selectedFilterIds = [...this.mandatoryColumnIds];
      if (typeof this.onSelectAll === 'function') {
        this.onSelectAll(false); // Deselect all grid rows
      }
    } else {
      // 🔵 SELECT ALL: Include SELECT_ALL key + all column IDs
      this.selectedFilterIds = [
        'SELECT_ALL',
        ...this.filterOptions.map(opt => opt.id)
      ];
      if (typeof this.onSelectAll === 'function') {
        this.onSelectAll(true); // Select all grid rows
      }
    }
  
    this.onFilterChange();
  }
  
  private normalizeSelectedFilters(ids: string[]): string[] {
    // Clean 'SELECT_ALL' dummy string so it doesn't pollute column definitions
    const nonSelectAll = (ids || []).filter(id => id !== 'SELECT_ALL');
    const merged = [...this.mandatoryColumnIds, ...nonSelectAll];
    return Array.from(new Set(merged));
  }


  // 2. Update customer-search-grid.component.html (image image_24.png)
//Ensure the Select All <mat-option> is configured like this (without [selected] to avoid the Angular compiler error):

<mat-option class="select-all-option"
  [class.is-checked]="isAllColumnsSelected()"
  [class.is-indeterminate]="isIndeterminateColumnsSelected()"
  value="SELECT_ALL"
  (click)="toggleSelectAll($event)">
  Select All
</mat-option>