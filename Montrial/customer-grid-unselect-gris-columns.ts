// Step 1: Update the TS Method Controlling the Gray "Disabled" State
//Open customer-search-grid.component.ts and locate the disableOptionsAndChips(id: string) helper method.

//By default, it is likely checking if the column ID is not 'eDiscoveryProjectManager'. You need to update this function to return false (meaning "do not disable/lock") for your three new fields:

// 🟢 Update this method to allow the 3 new columns to be selectable/removable
disableOptionsAndChips(id: string): boolean {
    // Add your target IDs to the list of columns that should NOT be disabled
    const removableColumnIds = [
      'eDiscoveryProjectManager',
      'responsibleLawyerEmail',
      'legalHoldAppliedDate',
      'legalHoldReleaseDate'
    ];
  
    if (removableColumnIds.includes(id)) {
      return false; // Do not disable (displays blue, removable)
    }
  
    // Fallback default: Lock all other essential columns as gray/disabled
    return true; 
  }


  // Step 2: Handle Column Definition Visibility on Filter Changes

  // 🟢 Call this method whenever the selected filter IDs change (e.g. onFilterChange / removeFilter)
applyColumnVisibility(): void {
    const selectedIds = this.selectedFilterIds; // Your active selected filter IDs array
  
    this.columnDefs = this.columnDefs.map(col => {
      // If it's one of the removable columns, determine visibility based on selection state
      if (col.field === 'eDiscoveryProjectManager' || 
          col.field === 'responsibleLawyerEmail' || 
          col.field === 'holdApplyDate' || 
          col.field === 'holdReleaseDate') {
        
        // Match the col.field with the respective filter option ID
        const filterIdMap: { [key: string]: string } = {
          'eDiscoveryProjectManager': 'eDiscoveryProjectManager',
          'responsibleLawyerEmail': 'responsibleLawyerEmail',
          'holdApplyDate': 'legalHoldAppliedDate',
          'holdReleaseDate': 'legalHoldReleaseDate'
        };
  
        const correspondingFilterId = filterIdMap[col.field];
        const isVisible = selectedIds.includes(correspondingFilterId);
  
        return {
          ...col,
          hide: !isVisible // Hide the column if its filter chip is not selected
        };
      }
      return col;
    });
  
    // Notify AG-Grid to refresh its column headers and sizes
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
  }