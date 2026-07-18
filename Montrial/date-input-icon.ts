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
&.is-indeterminate {
    .mat-pseudo-checkbox {
      background-color: $bmo-blue !important;
      border-color: $bmo-blue !important;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &::after {
        content: "" !important;
        position: absolute !important;
        
        /* 🟢 THE FIX: Explicitly nullify the rotation and border layout properties */
        border: none !important;
        transform: none !important;
        
        /* Shape the line cleanly */
        width: 10px !important;
        height: 2px !important;
        background-color: white !important;
        
        /* Center it perfectly within the blue container square */
        top: 50% !important;
        left: 50% !important;
        margin-top: -1px !important;
        margin-left: -5px !important;
      }
    }
  }

  // 
  onFilterChange(): void {
    // Always sanitize selection values
    this.selectedFilterIds = this.normalizeSelectedFilters(this.selectedFilterIds);
    this.syncColumns();
    
    // Explicitly trigger a change detection cycle to force the dropdown template to repaint
    this.cdr.detectChanges();
  }