handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows.identifier : ', selectedRows.identifier);
    if (!selectedRows || !selectedRows.identifier) return;
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    
    // 1. Get incoming selected IDs
    const getId = (item: any) => item?.ocifId || item?.ecifId || item?.uid || item?.id;
    const incomingIds = new Set(incomingSelected.map(item => getId(item)));
  
    // 2. Fallback to active grid rows OR your current search results array if activeGridRows is undefined
    const activeGridRows: any[] = selectedRows.activeGridRows || this.customerGridData || this.gridApi?.getRenderedNodes?.().map(n => n.data) || [];
    const activeGridIds = new Set(activeGridRows.map(item => getId(item)));
  
    const syncList = (currentList: any[], storageKey: string) => {
      let list = Array.isArray(currentList) ? [...currentList] : [];
  
      if (activeGridIds.size > 0) {
        // Filter out items that are present in the current grid view BUT unchecked by the user
        list = list.filter(item => {
          const id = getId(item);
          if (activeGridIds.has(id)) {
            return incomingIds.has(id); // Keep ONLY if still checked in incomingSelected
          }
          return true; // Keep items selected from other searches/pages
        });
      }
  
      // Combine remaining list with newly checked incoming items
      const updated = this.deduplicateByOcifId([...list, ...incomingSelected]);
      this.cacheIndividualAndEntityProfiles(storageKey, updated);
      return updated;
    };
  
    if (selectedRows.identifier === 'customer') {
      this.selectedCustomerList = syncList(this.selectedCustomerList, 'selectedCustomerList');
    } else if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = syncList(this.selectedEntityList, 'selectedEntityList');
    } else if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = syncList(this.selectedLegalHoldList, 'selectedLegalHoldList');
    }
  
    this.cdr.detectChanges();
  }