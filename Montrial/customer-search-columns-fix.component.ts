handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows.identifier : ', selectedRows.identifier);
    if (!selectedRows || !selectedRows.identifier) return;
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    
    // Helper to get unique key
    const getKey = (item: any) => item.uid || item.ocifId || item.id || item.profileName;
    const incomingKeys = new Set(incomingSelected.map(item => getKey(item)));
  
    // Core reconciliation logic
    const reconcileList = (currentList: any[], keyInStorage: string): any[] => {
      const existingList = Array.isArray(currentList) ? [...currentList] : [];
      
      // 1. Get all profile keys present in the current active grid (if passed by the event)
      // If your grid event passes `selectedRows.allGridRows` or `selectedRows.currentSearchResults`, use that set.
      // Otherwise, we sync incomingSelected directly for the active category while preserving other categories.
      const resultMap = new Map<string, any>();
  
      // Keep existing items from previous searches that aren't part of this current grid reset
      existingList.forEach(item => {
        const key = getKey(item);
        if (key) resultMap.set(key, item);
      });
  
      // If the event provides the list of all rows in the current active grid view:
      if (Array.isArray(selectedRows.activeGridRows)) {
        const activeGridKeys = new Set(selectedRows.activeGridRows.map((r: any) => getKey(r)));
        
        // Remove items that ARE in the active grid but ARE NOT in incomingSelected (user unchecked them)
        activeGridKeys.forEach(key => {
          if (!incomingKeys.has(key)) {
            resultMap.delete(key);
          }
        });
      }
  
      // Add or update all currently selected items
      incomingSelected.forEach(item => {
        const key = getKey(item);
        if (key) resultMap.set(key, item);
      });
  
      const updatedList = Array.from(resultMap.values());
      this.cacheIndividualAndEntityProfiles(keyInStorage, updatedList);
      return updatedList;
    };
  
    if (selectedRows.identifier === 'customer') {
      this.selectedCustomerList = reconcileList(this.selectedCustomerList, 'selectedCustomerList');
    } else if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = reconcileList(this.selectedEntityList, 'selectedEntityList');
    } else if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = reconcileList(this.selectedLegalHoldList, 'selectedLegalHoldList');
    }
  
    this.cdr.detectChanges();
  }