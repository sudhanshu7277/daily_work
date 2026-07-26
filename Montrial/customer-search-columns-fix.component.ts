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
  
    // Function to reconcile previous selections with current grid state
    const reconcileList = (currentStoredList: any[], activeSearchResults: any[]) => {
      const list = Array.isArray(currentStoredList) ? [...currentStoredList] : [];
      const activeGridIds = new Set((activeSearchResults || []).map(item => getId(item)));
      const resultMap = new Map<string, any>();
  
      // 1. Keep items from PREVIOUS searches/tabs (not currently visible in this grid)
      list.forEach(item => {
        const id = getId(item);
        if (id && !activeGridIds.has(id)) {
          resultMap.set(id, item);
        }
      });
  
      // 2. Add ALL currently checked items from the active grid
      incomingSelected.forEach(item => {
        const id = getId(item);
        if (id) {
          resultMap.set(id, item);
        }
      });
  
      // Unchecked items in the active grid are omitted from resultMap automatically!
      return Array.from(resultMap.values());
    };
  
    if (selectedRows.identifier === 'customer') {
      // 🟢 Replace 'this.customerSearchResult' with your actual search results array name
      const currentResults = this.customerSearchResult || this.searchResult || []; 
      this.selectedCustomerList = reconcileList(this.selectedCustomerList, currentResults);
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
  
    } else if (selectedRows.identifier === 'entity') {
      // 🟢 Replace 'this.entitySearchResult' with your actual entity search array name
      const currentResults = this.entitySearchResult || this.searchResult || [];
      this.selectedEntityList = reconcileList(this.selectedEntityList, currentResults);
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
  
    } else if (selectedRows.identifier === 'hold') {
      const currentResults = this.holdSearchResult || this.searchResult || [];
      this.selectedLegalHoldList = reconcileList(this.selectedLegalHoldList, currentResults);
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
  
    this.cdr.detectChanges();
  }