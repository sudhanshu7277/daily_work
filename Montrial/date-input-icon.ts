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


::ng-deep .bmo-custom-dropdown-panel {
    /* ... your existing code ... */
  
    .select-all-option {
      border-bottom: 1px solid #e0e0e0;
  
      /* State 1: All Selected (Checkmark) */
      &.is-checked {
        .mat-pseudo-checkbox {
          background-color: $bmo-blue !important;
          border-color: $bmo-blue !important;
        }
        .mat-pseudo-checkbox::after {
          content: "";
          position: absolute;
          left: 3px;
          top: 0;
          width: 6px;
          height: 10px;
          border: solid $bmo-white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }
  
      /* State 2: Mandatories Only Selected (Horizontal Minus Line) */
      /* 🟢 NESTED PROPERLY HERE: Resolves both the compiler error and view encapsulation failure */
      &.is-indeterminate {
        .mat-pseudo-checkbox {
          background-color: $bmo-blue !important;
          border-color: $bmo-blue !important;
          position: relative;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
  
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