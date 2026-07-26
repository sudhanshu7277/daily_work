handleRemoveProfile(deselectedProfile: any): void {
    const idToRemove = deselectedProfile?.ocifId || deselectedProfile?.ecifId;
    this.selectedCustomerList = this.selectedCustomerList.filter(p => (p.ocifId || p.ecifId) !== idToRemove);
    this.selectedLegalHoldList = this.selectedLegalHoldList.filter(p => (p.ocifId || p.ecifId) !== idToRemove);
    this.selectedEntityList = this.selectedEntityList.filter(p => (p.ocifId || p.ecifId) !== idToRemove);
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }


  handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    const getId = (item: any) => item?.ocifId || item?.ecifId;
  
    // Set of IDs currently checked in the grid emission
    const incomingIds = new Set(incomingSelected.map(item => getId(item)));
  
    // All IDs currently visible in the search results grid (to identify what can be unchecked)
    const currentGridResults = this.searchResults || []; // Replace with your component's search results array if named differently
    const activeGridIds = new Set(currentGridResults.map((item: any) => getId(item)));
  
    const reconcileList = (currentStoredList: any[]) => {
      const list = Array.isArray(currentStoredList) ? [...currentStoredList] : [];
      const resultMap = new Map<string, any>();
  
      // 1. Keep items from PREVIOUS searches/tabs (not currently visible in this search grid)
      list.forEach(item => {
        const id = getId(item);
        if (id && !activeGridIds.has(id)) {
          resultMap.set(id, item);
        }
      });
  
      // 2. Add ALL currently checked items from the active grid emission
      incomingSelected.forEach(item => {
        const id = getId(item);
        if (id) {
          resultMap.set(id, item);
        }
      });
  
      // Note: Items that WERE in activeGridIds BUT ARE NOT in incomingIds (user unchecked them) 
      // are naturally excluded from resultMap!
  
      return Array.from(resultMap.values());
    };
  
    if (selectedRows.identifier === 'customer') {
      this.selectedCustomerList = reconcileList(this.selectedCustomerList);
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
    } else if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = reconcileList(this.selectedEntityList);
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
    } else if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = reconcileList(this.selectedLegalHoldList);
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
  
    this.cdr.detectChanges();
  }