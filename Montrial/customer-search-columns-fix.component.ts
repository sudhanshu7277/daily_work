/**
 * Deduplicates an array by `ocifId` (or `ecifId`).
 */
deduplicateByOcifId(list: any[]): any[] {
    if (!Array.isArray(list) || list.length === 0) return [];
    const map = new Map();
    list.forEach(item => {
      const id = item?.ocifId || item?.ecifId;
      if (id) {
        map.set(id, item);
      }
    });
    return Array.from(map.values());
  }
  
  handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
  
    if (selectedRows.identifier === 'customer') {
      // Replace selectedCustomerList directly with incoming grid selection state
      this.selectedCustomerList = this.deduplicateByOcifId(incomingSelected);
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
    } 
    else if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = this.deduplicateByOcifId(incomingSelected);
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
    } 
    else if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = this.deduplicateByOcifId(incomingSelected);
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
  
    this.cdr.detectChanges();
  }