handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows.identifier : ', selectedRows.identifier);
    if (!selectedRows || !selectedRows.identifier) return;
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    
    // Helper to extract unique ID
    const getId = (item: any) => item?.ocifId || item?.ecifId || item?.uid || item?.id;
    
    // Helper to deduplicate array by ocifId/ecifId
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
  
    // Helper to sync selections: removes unchecked items from current grid view, keeps past searches/tabs
    const reconcileSelections = (currentList: any[], activeGridRows: any[]) => {
      const activeGridIds = new Set((activeGridRows || []).map(r => getId(r)));
      const incomingIds = new Set(incomingSelected.map(r => getId(r)));
  
      // Filter out items visible in the active search grid that were UNCHECKED
      const filteredList = currentList.filter(item => {
        const id = getId(item);
        if (activeGridIds.has(id)) {
          return incomingIds.has(id); // Keep ONLY if checked in current emission
        }
        return true; // Keep items selected from previous searches/tabs!
      });
  
      return deduplicate([...filteredList, ...incomingSelected]);
    };
  
    // 1. Process Customer Selections
    if (selectedRows.identifier === 'customer') {
      let currentCustomerList = Array.isArray(this.selectedCustomerList) ? [...this.selectedCustomerList] : [];
      
      // Pass current customer search result list as active rows
      const activeRows = this.customerSearchResult || this.searchResults || [];
      this.selectedCustomerList = reconcileSelections(currentCustomerList, activeRows);
      
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
    }
  
    // 2. Process Entity Selections
    if (selectedRows.identifier === 'entity') {
      let currentEntityList = Array.isArray(this.selectedEntityList) ? [...this.selectedEntityList] : [];
      
      const activeRows = this.entitySearchResult || this.searchResults || [];
      this.selectedEntityList = reconcileSelections(currentEntityList, activeRows);
      
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
    }
  
    // 3. Process Legal Hold Selections
    if (selectedRows.identifier === 'hold') {
      let currentHoldList = Array.isArray(this.selectedLegalHoldList) ? [...this.selectedLegalHoldList] : [];
      
      const activeRows = this.holdSearchResult || this.searchResults || [];
      this.selectedLegalHoldList = reconcileSelections(currentHoldList, activeRows);
      
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
  
    this.cdr.detectChanges();
  }