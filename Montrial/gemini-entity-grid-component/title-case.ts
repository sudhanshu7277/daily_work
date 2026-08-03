toggleSelectAll(event: Event): void {
    // If event comes from standard checkbox/MatOption
    const isChecked = (event.target as HTMLInputElement)?.checked ?? true;
  
    if (this.isAllSelected()) {
      // Unselect all current visible records
      const currentIds = new Set(this.displayedResults.map(item => item.id));
      this.selectedItems = this.selectedItems.filter(id => !currentIds.has(id));
    } else {
      // Select all current visible records (preserving previously selected/cached records)
      const newIds = this.displayedResults.map(item => item.id);
      this.selectedItems = Array.from(new Set([...this.selectedItems, ...newIds]));
    }
  }
  
  // Keep the header/option check synced
  isAllSelected(): boolean {
    return this.displayedResults?.length > 0 && 
           this.displayedResults.every(item => this.selectedItems.includes(item.id));
  }



  <mat-option class="select-all-option"
  [class.is-checked]="isAllSelected()"
  [class.is-indeterminate]="isIndeterminate()"
  value="SELECT_ALL"
  (click)="toggleSelectAll($event)">
  Select All
</mat-option>