handleRemoveProfile(deselectedProfile: any): void {
    const idToRemove = deselectedProfile?.ocifId || deselectedProfile?.ecifId;
    this.selectedCustomerList = this.selectedCustomerList.filter(p => (p.ocifId || p.ecifId) !== idToRemove);
    this.selectedLegalHoldList = this.selectedLegalHoldList.filter(p => (p.ocifId || p.ecifId) !== idToRemove);
    this.selectedEntityList = this.selectedEntityList.filter(p => (p.ocifId || p.ecifId) !== idToRemove);
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }


  /**
 * Deduplicates an array of objects by `ocifId` (or `ecifId`).
 */
deduplicateByOcifId<T extends Record<string, any>>(list: T[]): T[] {
    if (!Array.isArray(list) || list.length === 0) return [];
    const map = new Map<string | number, T>();
    
    list.forEach(item => {
      const id = item?.ocifId ?? item?.ecifId;
      if (id !== undefined && id !== null && id !== '') {
        map.set(id, item); // Keeps latest unique record per ocifId
      }
    });
  
    return Array.from(map.values());
  }
  
  /**
   * Your existing handleRemoveProfile function remains 100% UNTOUCHED
   */
  handleRemoveProfile(deselectedProfile: any): void {
    if (!deselectedProfile) return;
    const targetId = deselectedProfile.ocifId || deselectedProfile.ecifId;
  
    this.selectedCustomerList = (this.selectedCustomerList || []).filter(p => (p.ocifId || p.ecifId) !== targetId);
    this.selectedLegalHoldList = (this.selectedLegalHoldList || []).filter(p => (p.ocifId || p.ecifId) !== targetId);
    this.selectedEntityList = (this.selectedEntityList || []).filter(p => (p.ocifId || p.ecifId) !== targetId);
  
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }
  
  /**
   * Handles grid selection/deselection changes cleanly without external variables
   */
  handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows:', selectedRows);
    if (!selectedRows || !selectedRows.identifier) return;
  
    // 1. Direct deselection event fallback
    if (selectedRows.deselectedProfile) {
      this.handleRemoveProfile(selectedRows.deselectedProfile);
      return;
    }
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    const getId = (item: any) => item?.ocifId || item?.ecifId;
  
    // Map of incoming selected IDs currently checked in AG-Grid
    const incomingMap = new Map(incomingSelected.map(item => [getId(item), item]));
  
    // Helper function to update stored profiles list
    const reconcileCategoryList = (currentStoredList: any[], storageKey: string) => {
      const list = Array.isArray(currentStoredList) ? [...currentStoredList] : [];
  
      // Step A: Collect all IDs that exist in the active emission list
      // If incomingSelected has items, map them; if empty, user unchecked everything in current grid view
      const updatedList: any[] = [];
  
      // Step B: Retain items from prior searches/tabs that are NOT part of current grid action
      // AND retain/update items that ARE present in incomingSelected
      const processedIds = new Set<string | number>();
  
      // 1. First add all currently selected items from the grid
      incomingSelected.forEach(item => {
        const id = getId(item);
        if (id) {
          updatedList.push(item);
          processedIds.add(id);
        }
      });
  
      // 2. Retain items from previously saved list ONLY if they were NOT toggled off in the current view
      list.forEach(item => {
        const id = getId(item);
        if (id && !processedIds.has(id)) {
          // If the item wasn't in incomingSelected, but also wasn't explicitly deselected from active grid, keep it
          // Check if item was part of active grid uncheck batch
          const isCurrentlyUncheckedInGrid = selectedRows.deselectedId === id;
          if (!isCurrentlyUncheckedInGrid) {
            updatedList.push(item);
            processedIds.add(id);
          }
        }
      });
  
      const finalUniqueList = this.deduplicateByOcifId(updatedList);
      this.cacheIndividualAndEntityProfiles(storageKey, finalUniqueList);
      return finalUniqueList;
    };
  
    // Process based on identifier
    if (selectedRows.identifier === 'customer') {
      this.selectedCustomerList = reconcileCategoryList(this.selectedCustomerList, 'selectedCustomerList');
    } else if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = reconcileCategoryList(this.selectedEntityList, 'selectedEntityList');
    } else if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = reconcileCategoryList(this.selectedLegalHoldList, 'selectedLegalHoldList');
    }
  
    this.cdr.detectChanges();
  }