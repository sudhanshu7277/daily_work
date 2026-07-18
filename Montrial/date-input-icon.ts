// Step 1: Add the Indeterminate Helper to your .ts File

isAllColumnsSelected(): boolean {
    const normalized = this.normalizeSelectedFilters(this.selectedFilterIds);
    return this.filterOptions.every(opt => normalized.includes(opt.id));
  }
  
  // 🟢 ADD THIS METHOD:
  isIndeterminateColumnsSelected(): boolean {
    // Since mandatory columns are always selected, if "All" isn't true, it's always indeterminate
    return !this.isAllColumnsSelected();
  }

  // Step 2: Update the HTML Template Binding

  <mat-option class="select-all-option" 
            [class.is-checked]="isAllColumnsSelected()" 
            [class.is-indeterminate]="isIndeterminateColumnsSelected()"
            [value]="'SELECT_ALL'" 
            (click)="toggleSelectAll($event)">
  Select All
</mat-option>


// Step 3: Verify the SCSS Selectors

/* 🟢 FIXED: Changed from &.is-indeterminate to a flat combined class rule */
.select-all-option.is-indeterminate {
    .mat-pseudo-checkbox {
      background-color: $bmo-blue !important;
      border-color: $bmo-blue !important;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
  
      &::after {
        content: "";
        position: absolute;
        width: 10px;
        height: 2px;
        background-color: white !important;
        border: none !important;
        transform: none !important;
        top: calc(50% - 1px);  /* Centers the line vertically */
        left: calc(50% - 5px); /* Centers the line horizontally */
      }
    }
  }