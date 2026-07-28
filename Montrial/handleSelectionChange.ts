handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const category = selectedRows.identifier; // 'customer' | 'entity' | 'hold'
    const storageKey = category === 'customer' ? 'selectedCustomerList' 
                     : category === 'entity' ? 'selectedEntityList' 
                     : 'selectedLegalHoldList';
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
  
    // 1. Comprehensive ID Extractor
    const getId = (item: any): string => {
      if (!item) return '';
      const rawId = item.ocifId || item.ecifId || item.uid || item.id || item.profileId || item.proxyOcifId;
      return rawId !== undefined && rawId !== null ? String(rawId) : JSON.stringify(item);
    };
  
    // 2. Load current Master Map from Session Storage
    const currentList = this.getStoredProfiles(storageKey);
    const profileMap = new Map<string, any>();
    
    // Populate map with existing stored items
    currentList.forEach(item => {
      const id = getId(item);
      if (id) profileMap.set(id, item);
    });
  
    // 3. Identify all rows present in the CURRENT grid view (from lastEmitted or API dataset)
    const currentGridRows: any[] = this.lastEmittedSelections[category] || [];
    const incomingIds = new Set(incomingSelected.map(item => getId(item)));
  
    // Remove rows that were displayed in this grid session but are NO LONGER checked
    currentGridRows.forEach(item => {
      const id = getId(item);
      if (id && !incomingIds.has(id)) {
        profileMap.delete(id); // Explicit uncheck
      }
    });
  
    // Add/Update all currently checked rows from AG-Grid
    incomingSelected.forEach(item => {
      const id = getId(item);
      if (id) profileMap.set(id, item); // Overwrites cleanly if already present, preventing duplicates!
    });
  
    // 4. Update memory tracking for active grid
    this.lastEmittedSelections[category] = incomingSelected;
  
    // 5. Convert Map values back to Array
    const updatedList = Array.from(profileMap.values());
  
    // 6. Update Component State
    if (category === 'customer') {
      this.selectedCustomerList = updatedList;
    } else if (category === 'entity') {
      this.selectedEntityList = updatedList;
    } else if (category === 'hold') {
      this.selectedLegalHoldList = updatedList;
    }
  
    // 7. Persist to Session Storage
    this.setStoredProfiles(storageKey, updatedList);
  
    if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
      this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
    }
  
    this.cdr.detectChanges();
  }


  // Step 2: Ensure handleRemoveProfile Uses the Same ID Logic

  handleRemoveProfile(deselectedProfile: any): void {
    if (!deselectedProfile) return;
  
    const getId = (item: any): string => {
      if (!item) return '';
      const rawId = item.ocifId || item.ecifId || item.uid || item.id || item.profileId || item.proxyOcifId;
      return rawId !== undefined && rawId !== null ? String(rawId) : JSON.stringify(item);
    };
  
    const targetId = getId(deselectedProfile);
  
    const removeFromList = (list: any[]) => 
      (list || []).filter(p => getId(p) !== targetId);
  
    this.selectedCustomerList = removeFromList(this.selectedCustomerList);
    this.selectedEntityList = removeFromList(this.selectedEntityList);
    this.selectedLegalHoldList = removeFromList(this.selectedLegalHoldList);
  
    // Sync back to Session Storage
    this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
    this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
    this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
  
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }