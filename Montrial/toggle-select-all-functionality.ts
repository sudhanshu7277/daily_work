// Inside your columnDefs configuration:
{
    headerName: 'Profile Name',
    field: 'profileName', // or whatever field name your record uses
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true, // keeps header box state synced with visible/paginated rows
    sortable: true,
    // ... other column properties
  }


  // 1. Checks if all available filter dropdown options are checked
isAllColumnsSelected(): boolean {
    const optionalIds = this.filterOptions
      .map(opt => opt.id)
      .filter(id => !this.mandatoryColumnIds.includes(id));
  
    if (!optionalIds.length) return false;
  
    return optionalIds.every(id => this.selectedFilterIds.includes(id));
  }
  
  // 2. Checks if some (but not all) optional columns are checked
  isIndeterminateColumnsSelected(): boolean {
    const optionalIds = this.filterOptions
      .map(opt => opt.id)
      .filter(id => !this.mandatoryColumnIds.includes(id));
  
    const selectedCount = optionalIds.filter(id =>
      this.selectedFilterIds.includes(id)
    ).length;
  
    return selectedCount > 0 && selectedCount < optionalIds.length;
  }
  
  // 3. Handles clicking "Select All" in the filter dropdown
  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  
    const allSelected = this.isAllColumnsSelected();
  
    if (allSelected) {
      // 🔴 DESELECT ALL
      this.selectedFilterIds = [...this.mandatoryColumnIds];
      this.onSelectAll(false);
    } else {
      // 🔵 SELECT ALL
      this.selectedFilterIds = this.filterOptions.map(opt => opt.id);
      this.onSelectAll(true);
    }
  
    this.onFilterChange();
  }
  
  // 4. Selects/Deselects all rows in AG Grid and forces header sync
  onSelectAll(select: boolean): void {
    if (!this.gridApi) return;
  
    if (select) {
      this.gridApi.selectAll();
    } else {
      this.gridApi.deselectAll();
    }
  
    // Force AG Grid to re-render the header row so the checkbox reflects the selection
    this.gridApi.refreshHeader();
    this.cdr.detectChanges();
  }
  
  // 5. Normalizes filter IDs for grid display without breaking mandatory columns
  private normalizeSelectedFilters(ids: string[]): string[] {
    const merged = [...this.mandatoryColumnIds, ...(ids || [])];
    return Array.from(new Set(merged));
  }


  <mat-option
  class="select-all-option"
  [class.is-checked]="isAllColumnsSelected()"
  [class.is-indeterminate]="isIndeterminateColumnsSelected()"
  value="SELECT_ALL"
  (click)="toggleSelectAll($event)">
  Select All
</mat-option>

@for (opt of filterOptions; track opt.id) {
  <mat-option [value]="opt.id" [disabled]="disableOptionsAndChips(opt.id)">
    {{ opt.label }}
  </mat-option>
}