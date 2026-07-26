// Step 1: Helper Function for ocifId Deduplication

/**
 * Deduplicates an array of profile objects using `ocifId` (with fallbacks for ecifId/uid).
 */
deduplicateByOcifId<T extends Record<string, any>>(list: T[]): T[] {
    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }
  
    const seenIds = new Set<string | number>();
  
    return list.filter(item => {
      if (!item) return false;
  
      // Target ocifId
      const id = item.ocifId ?? item.ecifId ?? item.uid ?? item.id;
  
      if (id !== undefined && id !== null && id !== '') {
        if (seenIds.has(id)) {
          return false; // Skip duplicate
        }
        seenIds.add(id);
        return true; // Keep first unique instance
      }
  
      return true; // Keep items without explicit IDs
    });
  }

  // Step 2: Keep handleRemoveProfile (Untouched)

  handleRemoveProfile(deselectedProfile: any): void {
    if (!deselectedProfile) return;
  
    const targetId = deselectedProfile.ocifId || deselectedProfile.ecifId;
  
    this.selectedCustomerList = (this.selectedCustomerList || []).filter(p => (p.ocifId || p.ecifId) !== targetId);
    this.selectedLegalHoldList = (this.selectedLegalHoldList || []).filter(p => (p.ocifId || p.ecifId) !== targetId);
    this.selectedEntityList = (this.selectedEntityList || []).filter(p => (p.ocifId || p.ecifId) !== targetId);
  
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }

  // Step 3: Complete handleSelectionChange

  handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows:', selectedRows);
    if (!selectedRows || !selectedRows.identifier) return;
  
    // 🔴 1. DESELECTION: Grid unchecked a profile -> Delegate directly to handleRemoveProfile
    if (selectedRows.deselectedProfile) {
      this.handleRemoveProfile(selectedRows.deselectedProfile);
      return;
    }
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    const getId = (item: any) => item?.ocifId || item?.ecifId || item?.uid || item?.id;
  
    // 🟢 2. CUSTOMER SEARCH SELECTIONS
    if (selectedRows.identifier === 'customer') {
      let currentList = Array.isArray(this.selectedCustomerList) ? [...this.selectedCustomerList] : [];
  
      // Diff against current grid emission: remove items present in active grid but omitted from selected
      if (Array.isArray(selectedRows.activeGridRows) && selectedRows.activeGridRows.length > 0) {
        const activeGridIds = new Set(selectedRows.activeGridRows.map((r: any) => getId(r)));
        const incomingIds = new Set(incomingSelected.map((r: any) => getId(r)));
  
        currentList = currentList.filter(item => {
          const id = getId(item);
          if (activeGridIds.has(id)) {
            return incomingIds.has(id); // Keep only if checked in current emission
          }
          return true; // Retain selections from previous searches/tabs!
        });
      }
  
      this.selectedCustomerList = this.deduplicateByOcifId([...currentList, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
    }
  
    // 🟢 3. ENTITY SEARCH SELECTIONS
    if (selectedRows.identifier === 'entity') {
      let currentList = Array.isArray(this.selectedEntityList) ? [...this.selectedEntityList] : [];
  
      if (Array.isArray(selectedRows.activeGridRows) && selectedRows.activeGridRows.length > 0) {
        const activeGridIds = new Set(selectedRows.activeGridRows.map((r: any) => getId(r)));
        const incomingIds = new Set(incomingSelected.map((r: any) => getId(r)));
  
        currentList = currentList.filter(item => {
          const id = getId(item);
          if (activeGridIds.has(id)) {
            return incomingIds.has(id);
          }
          return true;
        });
      }
  
      this.selectedEntityList = this.deduplicateByOcifId([...currentList, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
    }
  
    // 🟢 4. HOLD SEARCH SELECTIONS
    if (selectedRows.identifier === 'hold') {
      let currentList = Array.isArray(this.selectedLegalHoldList) ? [...this.selectedLegalHoldList] : [];
  
      if (Array.isArray(selectedRows.activeGridRows) && selectedRows.activeGridRows.length > 0) {
        const activeGridIds = new Set(selectedRows.activeGridRows.map((r: any) => getId(r)));
        const incomingIds = new Set(incomingSelected.map((r: any) => getId(r)));
  
        currentList = currentList.filter(item => {
          const id = getId(item);
          if (activeGridIds.has(id)) {
            return incomingIds.has(id);
          }
          return true;
        });
      }
  
      this.selectedLegalHoldList = this.deduplicateByOcifId([...currentList, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
  
    this.cdr.detectChanges();
  }