// Step 1: Session Storage Helpers

  // Helper to get items from session storage safely
  getStoredProfiles(key: string): any[] {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key} from sessionStorage`, e);
      return [];
    }
  }
  
  // Helper to save items to session storage cleanly
  setStoredProfiles(key: string, list: any[]): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(list || []));
    } catch (e) {
      console.error(`Error saving ${key} to sessionStorage`, e);
    }
  }
  
  // Step 2: Session-Aware handleSelectionChange
  
  handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const category = selectedRows.identifier; // 'customer' | 'entity' | 'hold'
    const storageKey = category === 'customer' ? 'selectedCustomerList' 
                     : category === 'entity' ? 'selectedEntityList' 
                     : 'selectedLegalHoldList';
  
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
  
    // 1. Pull the absolute latest state from Session Storage (preserves multi-tab/multi-search selections)
    const masterListFromSession = this.getStoredProfiles(storageKey);
  
    // 2. Diff against previous emission for this specific active grid session
    const previousGridState = this.lastEmittedSelections[category] || [];
    const incomingIds = new Set(incomingSelected.map(r => getId(r)));
  
    const uncheckedIds = new Set<string | number>();
    previousGridState.forEach(item => {
      const id = getId(item);
      if (id && !incomingIds.has(id)) {
        uncheckedIds.add(id); // User unchecked this row in the active grid view
      }
    });
  
    // 3. Update active grid tracking memory
    this.lastEmittedSelections[category] = incomingSelected;
  
    // 4. Reconcile master session list against active unchecks & new incoming checks
    let updatedList = masterListFromSession.filter(item => !uncheckedIds.has(getId(item)));
    updatedList = deduplicate([...updatedList, ...incomingSelected]);
  
    // 5. Update Component State & Sync back to Session Storage
    if (category === 'customer') {
      this.selectedCustomerList = updatedList;
    } else if (category === 'entity') {
      this.selectedEntityList = updatedList;
    } else if (category === 'hold') {
      this.selectedLegalHoldList = updatedList;
    }
  
    // Persist to session storage & cache
    this.setStoredProfiles(storageKey, updatedList);
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  
    this.cdr.detectChanges();
  }
  
  
  
  // Step 3: Update handleRemoveProfile to Sync with Session Storage
  
  handleRemoveProfile(deselectedProfile: any): void {
    if (!deselectedProfile) return;
    const targetId = deselectedProfile.ocifId || deselectedProfile.ecifId || deselectedProfile.uid || deselectedProfile.id;
  
    const removeFromList = (list: any[]) => (list || []).filter(p => (p.ocifId || p.ecifId || p.uid || p.id) !== targetId);
  
    this.selectedCustomerList = removeFromList(this.selectedCustomerList);
    this.selectedEntityList = removeFromList(this.selectedEntityList);
    this.selectedLegalHoldList = removeFromList(this.selectedLegalHoldList);
  
    // Sync updated lists directly with sessionStorage
    this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
    this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
    this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
  
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }
  
  // Step 4: Clear Session Active Grid Tracking on New Search
  
  onSearchClick(): void {
    // Reset grid emission memory for fresh search grid session
    this.lastEmittedSelections = {
      customer: [],
      entity: [],
      hold: []
    };
  
    // ... execute existing search API logic ...
  }