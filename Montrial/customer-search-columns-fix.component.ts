handleSelectionChange(selectedRows: any): void {
    if (selectedRows.identifier === 'customer') {
      // Replace with current grid selection — panel diff handles accumulation
      this.selectedCustomerList = [...(selectedRows.selected || [])];
      this.cacheIndividualAndEntityProfiles(
        'selectedCustomerList', 
        this.selectedCustomerList
      );
    }
  
    if (selectedRows.identifier === 'entity') {
      this.selectedEntityList = [...(selectedRows.selected || [])];
      this.cacheIndividualAndEntityProfiles(
        'selectedEntityList', 
        this.selectedEntityList
      );
    }
  
    if (selectedRows.identifier === 'hold') {
      this.selectedLegalHoldList = [...(selectedRows.selected || [])];
      this.cacheIndividualAndEntityProfiles(
        'selectedLegalHoldList', 
        this.selectedLegalHoldList
      );
    }
  }