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
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      
      &::after {
        /* 🟢 FORCE VISIBILITY: Overrides Material's unselected opacity: 0 hidden state */
        content: "" !important;
        opacity: 1 !important;
        display: block !important;
        
        /* Strip out standard diagonal checkmark rules */
        border: none !important;
        transform: none !important;
        
        /* Dimensions of the horizontal minus line */
        width: 10px !important;
        height: 2px !important;
        background-color: white !important;
        
        /* Absolute crisp positioning directly in the dead center */
        position: absolute !important;
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


  // white tick

  /* 1. STATE ONE: All Selected (White Checkmark on Blue Background) */
  &.is-checked {
    .mat-pseudo-checkbox {
      background-color: $bmo-blue !important;
      border-color: $bmo-blue !important;
      position: relative;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      /* 🟢 FORCE VISIBILITY & STRUCTURE: Overrides Material's unselected opacity: 0 state */
      &::after {
        content: "" !important;
        opacity: 1 !important;
        display: block !important;
        position: absolute !important;
        
        /* Enforce standard checkmark dimensions & borders */
        left: 5px !important;
        top: 2px !important;
        width: 5px !important;
        height: 9px !important;
        border: solid white !important;
        border-width: 0 2px 2px 0 !important;
        transform: rotate(45deg) !important;
        background: none !important;
      }
    }
  }