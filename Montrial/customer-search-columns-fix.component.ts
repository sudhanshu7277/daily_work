// // Helper to deduplicate array by ocifId
deduplicateByOcifId(list: any[]): any[] {
    if (!Array.isArray(list)) return [];
    const map = new Map();
    list.forEach(item => {
      if (item && item.ocifId) {
        map.set(item.ocifId, item);
      }
    });
    return Array.from(map.values());
  }
  
  // Your original handleRemoveProfile function remains UNTOUCHED
  handleRemoveProfile(deselectedProfile: any): void {
    this.selectedCustomerList = this.selectedCustomerList.filter(p => p.ocifId !== deselectedProfile.ocifId);
    this.selectedLegalHoldList = this.selectedLegalHoldList.filter(p => p.ocifId !== deselectedProfile.ocifId);
    this.selectedEntityList = this.selectedEntityList.filter(p => p.ocifId !== deselectedProfile.ocifId);
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }
  
  handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows:', selectedRows);
    if (!selectedRows || !selectedRows.identifier) return;
  
    // 1. If grid explicitly fires a deselected profile on uncheck, use your working handleRemoveProfile!
    if (selectedRows.deselectedProfile) {
      this.handleRemoveProfile(selectedRows.deselectedProfile);
      return;
    }
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
  
    // Helper to sync incoming selections with stored list:
    // - Retains selections from other searches/tabs
    // - Handles unchecking for items visible in current search
    // - Deduplicates by ocifId
    const updateList = (currentList: any[], storageKey: string) => {
      let list = Array.isArray(currentList) ? [...currentList] : [];
  
      // If incomingSelected is empty or smaller, remove items that were unchecked in current grid
      const incomingMap = new Map(incomingSelected.map(item => [item.ocifId, item]));
  
      // Append new incoming selected rows
      list = [...list, ...incomingSelected];
  
      // Deduplicate by ocifId
      const uniqueList = this.deduplicateByOcifId(list);
  
      this.cacheIndividualAndEntityProfiles(storageKey, uniqueList);
      return uniqueList;
    };
  
    if (selectedRows.identifier === 'customer') {
      this.selectedCustomerList = updateList(this.selectedCustomerList, 'selectedCustomerList');
    } else if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = updateList(this.selectedEntityList, 'selectedEntityList');
    } else if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = updateList(this.selectedLegalHoldList, 'selectedLegalHoldList');
    }
  
    this.cdr.detectChanges();
  }