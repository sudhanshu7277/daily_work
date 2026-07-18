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

::ng-deep .bmo-custom-dropdown-panel {
  
    .select-all-option {
      border-bottom: 1px solid #e0e0e0;
  
      /* Base setup for the checkbox container to allow perfect centering */
      .mat-pseudo-checkbox {
        position: relative !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
  
      /* 1. STATE ONE: All Selected (White Checkmark on Blue) */
      &.is-checked {
        .mat-pseudo-checkbox {
          background-color: $bmo-blue !important;
          border-color: $bmo-blue !important;
  
          /* Strip any default Material checkmark styles */
          &::after {
            content: "" !important;
            position: absolute !important;
            left: 5px !important;
            top: 2px !important;
            width: 5px !important;
            height: 9px !important;
            border: solid white !important;
            border-width: 0 2px 2px 0 !important;
            transform: rotate(45deg) !important;
            background: none !important;
            display: block !important;
          }
        }
      }
  
      /* 2. STATE TWO: Mandatory Fields Only (White Horizontal Minus Line on Blue) */
      &.is-indeterminate {
        .mat-pseudo-checkbox {
          background-color: $bmo-blue !important;
          border-color: $bmo-blue !important;
  
          /* Enforce a clean horizontal line graphic */
          &::after {
            content: "" !important;
            position: absolute !important;
            width: 10px !important;
            height: 2px !important;
            background-color: white !important;
            border: none !important;
            transform: none !important;
            top: calc(50% - 1px) !important;
            left: calc(50% - 5px) !important;
            display: block !important;
          }
        }
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