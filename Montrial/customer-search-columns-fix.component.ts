handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows.identifier : ', selectedRows.identifier);
    if (!selectedRows || !selectedRows.identifier) return;
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    
    // Helper to extract unique ID (checks ocifId, ecifId, or fallback)
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
  
    // 1. Process Customer Selections
    if (selectedRows.identifier === 'customer') {
      let currentCustomerList = Array.isArray(this.selectedCustomerList) ? [...this.selectedCustomerList] : [];
  
      // If grid passed active grid rows, handle explicit unchecks for rows visible in current grid
      if (Array.isArray(selectedRows.activeGridRows) && selectedRows.activeGridRows.length > 0) {
        const activeGridIds = new Set(selectedRows.activeGridRows.map((r: any) => getId(r)));
        const incomingIds = new Set(incomingSelected.map((r: any) => getId(r)));
  
        // Remove items that are visible in current grid BUT unchecked by user
        currentCustomerList = currentCustomerList.filter(item => {
          const id = getId(item);
          if (activeGridIds.has(id)) {
            return incomingIds.has(id); // Keep only if checked in current emission
          }
          return true; // Keep items selected from previous searches/tabs!
        });
      }
  
      // Append newly selected records and deduplicate
      this.selectedCustomerList = deduplicate([...currentCustomerList, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
    }
  
    // 2. Process Entity Selections
    if (selectedRows.identifier === 'entity') {
      let currentEntityList = Array.isArray(this.selectedEntityList) ? [...this.selectedEntityList] : [];
  
      if (Array.isArray(selectedRows.activeGridRows) && selectedRows.activeGridRows.length > 0) {
        const activeGridIds = new Set(selectedRows.activeGridRows.map((r: any) => getId(r)));
        const incomingIds = new Set(incomingSelected.map((r: any) => getId(r)));
  
        currentEntityList = currentEntityList.filter(item => {
          const id = getId(item);
          if (activeGridIds.has(id)) {
            return incomingIds.has(id);
          }
          return true;
        });
      }
  
      this.selectedEntityList = deduplicate([...currentEntityList, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
    }
  
    // 3. Process Legal Hold Selections
    if (selectedRows.identifier === 'hold') {
      let currentHoldList = Array.isArray(this.selectedLegalHoldList) ? [...this.selectedLegalHoldList] : [];
  
      if (Array.isArray(selectedRows.activeGridRows) && selectedRows.activeGridRows.length > 0) {
        const activeGridIds = new Set(selectedRows.activeGridRows.map((r: any) => getId(r)));
        const incomingIds = new Set(incomingSelected.map((r: any) => getId(r)));
  
        currentHoldList = currentHoldList.filter(item => {
          const id = getId(item);
          if (activeGridIds.has(id)) {
            return incomingIds.has(id);
          }
          return true;
        });
      }
  
      this.selectedLegalHoldList = deduplicate([...currentHoldList, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
  
    this.cdr.detectChanges();
  }