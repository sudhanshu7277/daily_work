handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const category = selectedRows.identifier; // 'customer' | 'entity' | 'hold'
    const storageKey = category === 'customer' ? 'selectedCustomerList' 
                     : category === 'entity' ? 'selectedEntityList' 
                     : 'selectedLegalHoldList';
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    
    // 🟢 FIX 1: Expanded ID list based on standard BMO/AG-Grid data structures
    const getId = (item: any) => 
      item?.ocifId || item?.ecifId || item?.uid || item?.id || item?.profileId || item?.proxyOcifId;
  
    // 🟢 FIX 2: Bulletproof deduplication using JSON stringification as a fallback
    const deduplicate = (list: any[]) => {
      const seen = new Set();
      return list.filter(item => {
        const id = getId(item);
        const uniqueKey = id !== undefined && id !== null ? id : JSON.stringify(item);
        
        if (seen.has(uniqueKey)) return false;
        seen.add(uniqueKey);
        return true;
      });
    };
  
    const masterListFromSession = this.getStoredProfiles(storageKey);
    const previousGridState = this.lastEmittedSelections[category] || [];
    
    // Create a Set of unique keys for incoming rows
    const incomingIds = new Set(incomingSelected.map(r => {
      const id = getId(r);
      return id !== undefined && id !== null ? id : JSON.stringify(r);
    }));
  
    // Find what was unchecked in THIS specific grid interaction
    const uncheckedIds = new Set<string | number>();
    previousGridState.forEach(item => {
      const id = getId(item);
      const uniqueKey = id !== undefined && id !== null ? id : JSON.stringify(item);
      if (!incomingIds.has(uniqueKey)) {
        uncheckedIds.add(uniqueKey);
      }
    });
  
    // Update active grid tracking memory
    this.lastEmittedSelections[category] = incomingSelected;
  
    // Reconcile master session list
    let updatedList = masterListFromSession.filter(item => {
      const id = getId(item);
      const uniqueKey = id !== undefined && id !== null ? id : JSON.stringify(item);
      return !uncheckedIds.has(uniqueKey);
    });
    
    // Deduplicate and merge
    updatedList = deduplicate([...updatedList, ...incomingSelected]);
  
    // Update Component State
    if (category === 'customer') {
      this.selectedCustomerList = updatedList;
    } else if (category === 'entity') {
      this.selectedEntityList = updatedList;
    } else if (category === 'hold') {
      this.selectedLegalHoldList = updatedList;
    }
  
    // Persist to session storage
    this.setStoredProfiles(storageKey, updatedList);
    
    // Only call caching if this method exists in your component
    if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
      this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
    }
  
    this.cdr.detectChanges();
  }


  onTabChange(): void {
    // Reset grid emission memory so AG-Grid init doesn't trigger false unchecks
    this.lastEmittedSelections = {
      customer: [],
      entity: [],
      hold: []
    };
  }