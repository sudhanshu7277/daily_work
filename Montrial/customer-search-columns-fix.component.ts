// Add this property at the top of LegalHoldShellComponent class
private lastEmittedSelections: { [key: string]: any[] } = {
    customer: [],
    entity: [],
    hold: []
  };
  
  handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const category = selectedRows.identifier; // 'customer' | 'entity' | 'hold'
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    
    const getId = (item: any) => item?.ocifId || item?.ecifId || item?.uid || item?.id;
  
    const deduplicate = (list: any[]) => {
      const seen = new Set();
      return list.filter(item => {
        const id = getId(item);
        if (id) {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        }
        return true;
      });
    };
  
    // 1. Identify items UNCHECKED in this grid session
    const previousGridState = this.lastEmittedSelections[category] || [];
    const incomingIds = new Set(incomingSelected.map(r => getId(r)));
    
    const uncheckedIds = new Set<string | number>();
    previousGridState.forEach(item => {
      const id = getId(item);
      if (id && !incomingIds.has(id)) {
        uncheckedIds.add(id); // User unchecked this row
      }
    });
  
    // 2. Save current grid emission for the next toggle diff
    this.lastEmittedSelections[category] = incomingSelected;
  
    // Helper to reconcile unchecks and additions
    const syncCategoryList = (currentStoredList: any[], storageKey: string) => {
      let list = Array.isArray(currentStoredList) ? [...currentStoredList] : [];
  
      // Step A: Remove records explicitly unchecked in current grid session
      if (uncheckedIds.size > 0) {
        list = list.filter(item => !uncheckedIds.has(getId(item)));
      }
  
      // Step B: Merge current grid selections and deduplicate
      const updated = deduplicate([...list, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles(storageKey, updated);
      return updated;
    };
  
    if (category === 'customer') {
      this.selectedCustomerList = syncCategoryList(this.selectedCustomerList, 'selectedCustomerList');
    } else if (category === 'entity') {
      this.selectedEntityList = syncCategoryList(this.selectedEntityList, 'selectedEntityList');
    } else if (category === 'hold') {
      this.selectedLegalHoldList = syncCategoryList(this.selectedLegalHoldList, 'selectedLegalHoldList');
    }
  
    this.cdr.detectChanges();
  }