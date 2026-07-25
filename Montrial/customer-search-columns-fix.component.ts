ngOnChanges(changes: SimpleChanges): void {
    const hasCustomerChange = !!changes['selectedCustomerList'];
    const hasHoldChange = !!changes['selectedLegalHoldList'];
    const hasEntityChange = !!changes['selectedEntityList'];
  
    if (hasCustomerChange || hasHoldChange || hasEntityChange) {
      let currentProfiles = [...(this.selectedProfiles || [])];
  
      // Key generator using your existing method or unique identifiers
      const getKey = (item: any) => this.getProfileKey ? this.getProfileKey(item, 0) : (item.uid || item.ocifId || item.id || item.profileName);
  
      // Sync a list coming from a parent input (Handles additions AND removals for that specific grid/list)
      const syncInputList = (incomingList: any[], categoryKey: string) => {
        // If the input was never set/passed, don't touch existing profiles for this category
        if (!incomingList && !changes[categoryKey]) return;
  
        const incomingArray = Array.isArray(incomingList) ? incomingList : [];
        const incomingKeys = new Set(incomingArray.map(item => getKey(item)));
  
        // 1. Tag incoming items with category
        const taggedIncoming = incomingArray.map(item => ({ ...item, _listSource: categoryKey }));
  
        // 2. Filter out items belonging to THIS list that were unchecked in the grid
        currentProfiles = currentProfiles.filter(profile => {
          if (profile._listSource === categoryKey) {
            return incomingKeys.has(getKey(profile));
          }
          return true; // Keep selections from OTHER lists/tabs!
        });
  
        // 3. Add or update items from this incoming list
        taggedIncoming.forEach(incomingItem => {
          const itemKey = getKey(incomingItem);
          const existingIndex = currentProfiles.findIndex(p => getKey(p) === itemKey);
  
          if (existingIndex > -1) {
            currentProfiles[existingIndex] = { ...currentProfiles[existingIndex], ...incomingItem };
          } else {
            currentProfiles.push(incomingItem);
          }
        });
      };
  
      // Synchronize active input lists
      if (hasCustomerChange) syncInputList(this.selectedCustomerList, 'selectedCustomerList');
      if (hasHoldChange) syncInputList(this.selectedLegalHoldList, 'selectedLegalHoldList');
      if (hasEntityChange) syncInputList(this.selectedEntityList, 'selectedEntityList');
  
      this.selectedProfiles = [...currentProfiles];
  
      let cachedTrueInChangesBlock = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
      if (cachedTrueInChangesBlock) {
        this.loadCachedProfiles();
      }
    }
  }