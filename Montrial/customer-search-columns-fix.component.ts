ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedCustomerList'] && 
        !changes['selectedLegalHoldList'] && 
        !changes['selectedEntityList']) return;
  
    // For each source: use new list if it has items,
    // otherwise preserve whatever was already selected from that source
    const customerItems = (this.selectedCustomerList?.length
      ? this.selectedCustomerList
      : this.selectedProfiles.filter((p: any) => p._source === 'customer'))
      .map((p: any) => ({...p, _source: 'customer'}));
  
    const legalHoldItems = (this.selectedLegalHoldList?.length
      ? this.selectedLegalHoldList
      : this.selectedProfiles.filter((p: any) => p._source === 'legalHold'))
      .map((p: any) => ({...p, _source: 'legalHold'}));
  
    const entityItems = (this.selectedEntityList?.length
      ? this.selectedEntityList
      : this.selectedProfiles.filter((p: any) => p._source === 'entity'))
      .map((p: any) => ({...p, _source: 'entity'}));
  
    this.selectedProfiles = [
      ...customerItems,
      ...legalHoldItems,
      ...entityItems
    ];
  
    const cachedTrue = this.cacheSelectedProfiles(
      'profilesSelected',
      this.selectedProfiles
    );
    if (cachedTrue) this.loadCachedProfiles();
  }