/**
 * Deduplicates an array by ocifId (or ecifId).
 */
deduplicateByOcifId<T extends Record<string, any>>(list: T[]): T[] {
    if (!Array.isArray(list) || list.length === 0) return [];
    const map = new Map<string | number, T>();
    
    list.forEach(item => {
      const id = item?.ocifId ?? item?.ecifId;
      if (id !== undefined && id !== null && id !== '') {
        map.set(id, item);
      }
    });
  
    return Array.from(map.values());
  }
  
  /**
   * handleRemoveProfile remains 100% UNTOUCHED
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
   * Complete, error-free handleSelectionChange
   */
  handleSelectionChange(selectedRows: any): void {
    console.log('checking for selectedRows.identifier : ', selectedRows?.identifier);
    if (!selectedRows || !selectedRows.identifier) return;
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    const getId = (item: any) => item?.ocifId || item?.ecifId;
  
    // Helper to merge new selections into stored list without losing past tab selections
    const reconcileCategoryList = (currentStoredList: any[]) => {
      const list = Array.isArray(currentStoredList) ? [...currentStoredList] : [];
      
      // If incomingSelected has items, append and deduplicate by ocifId
      const combined = [...list, ...incomingSelected];
      return this.deduplicateByOcifId(combined);
    };
  
    if (selectedRows.identifier === 'customer') {
      this.selectedCustomerList = reconcileCategoryList(this.selectedCustomerList);
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
    } else if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = reconcileCategoryList(this.selectedEntityList);
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
    } else if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = reconcileCategoryList(this.selectedLegalHoldList);
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
  
    this.cdr.detectChanges();
  }