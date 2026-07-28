handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const category = selectedRows.identifier; // 'customer' | 'entity' | 'hold'
    const storageKey = category === 'customer' ? 'selectedCustomerList' 
                     : category === 'entity' ? 'selectedEntityList' 
                     : 'selectedLegalHoldList';
  
    // Extract raw incoming selection array from AG-Grid
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
  
    // Robust ID Extractor
    const getId = (item: any): string => {
      if (!item) return '';
      const rawId = item.ocifId ?? item.ecifId ?? item.uid ?? item.id ?? item.profileId ?? item.proxyOcifId;
      return rawId !== undefined && rawId !== null ? String(rawId) : '';
    };
  
    // 1. Build a map of items from OTHER categories currently in session storage
    // (Preserves multi-tab selections without mixing them up)
    const existingStoredList = this.getStoredProfiles(storageKey);
  
    // 2. Build a fresh Map for the CURRENT category
    const profileMap = new Map<string, any>();
  
    // Optional: If you want to keep selections from PREVIOUS searches that are NOT in the current grid page:
    // First, identify IDs that belong to the current active grid page/data view
    const activeGridData: any[] = selectedRows.gridApi ? [] : []; // Or your component's grid row data array
    const activeGridIds = new Set(
      (selectedRows.allGridRows || []).map((row: any) => getId(row)).filter((id: string) => id !== '')
    );
  
    // Keep stored items that belong to OTHER searches (not present on the current grid view)
    existingStoredList.forEach(item => {
      const id = getId(item);
      if (id && activeGridIds.size > 0 && !activeGridIds.has(id)) {
        profileMap.set(id, item);
      }
    });
  
    // 3. Directly set ALL currently selected rows emitted by AG-Grid for this grid view
    incomingSelected.forEach(item => {
      const id = getId(item);
      if (id) {
        profileMap.set(id, item); // Overwrites cleanly, mathematically preventing duplicate keys
      } else {
        // Fallback if item lacks an explicit ID property
        profileMap.set(JSON.stringify(item), item);
      }
    });
  
    // 4. Convert Map values directly to updated array
    const updatedList = Array.from(profileMap.values());
  
    // 5. Assign updated state
    if (category === 'customer') {
      this.selectedCustomerList = updatedList;
    } else if (category === 'entity') {
      this.selectedEntityList = updatedList;
    } else if (category === 'hold') {
      this.selectedLegalHoldList = updatedList;
    }
  
    // 6. Save to Session Storage
    this.setStoredProfiles(storageKey, updatedList);
  
    if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
      this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
    }
  
    this.cdr.detectChanges();
  }


  // In your component or gridOptions:
getRowId = (params: any) => {
    return params.data.ocifId || params.data.ecifId || params.data.uid || params.data.id;
  };


    [suppressRowClickSelection]="true"