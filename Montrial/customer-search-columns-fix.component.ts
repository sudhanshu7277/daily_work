handleSelectionChange(selectedRows: any): void {
    const getKey = (p: any) => 
      p.ocifId ?? p.ecifId ?? p.proxyOcifId ?? p.fileNetId ?? JSON.stringify(p);
    const curr: any[] = selectedRows.selected || [];
  
    if (selectedRows.identifier === 'customer') {
      const existing = this.selectedCustomerList || [];
      const newItems = curr.filter(p => 
        !existing.some((sp: any) => getKey(sp) === getKey(p))
      );
      this.selectedCustomerList = [...existing, ...newItems];
      this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
    }
  
    if (selectedRows.identifier === 'entity') {
      const existing = this.selectedEntityList || [];
      const newItems = curr.filter(p => 
        !existing.some((sp: any) => getKey(sp) === getKey(p))
      );
      this.selectedEntityList = [...existing, ...newItems];
      this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
    }
  
    if (selectedRows.identifier === 'hold') {
      const existing = this.selectedLegalHoldList || [];
      const newItems = curr.filter(p => 
        !existing.some((sp: any) => getKey(sp) === getKey(p))
      );
      this.selectedLegalHoldList = [...existing, ...newItems];
      this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
    }
    // Lines 1133-1137 removed entirely
  }