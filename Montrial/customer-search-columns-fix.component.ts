ngOnChanges(changes: SimpleChanges): void {
    const hasCustomerChange = !!changes['selectedCustomerList'];
    const hasHoldChange = !!changes['selectedLegalHoldList'];
    const hasEntityChange = !!changes['selectedEntityList'];
  
    if (hasCustomerChange || hasHoldChange || hasEntityChange) {
      let currentProfiles = [...(this.selectedProfiles || [])];
  
      // Unique key generator
      const getKey = (item: any) => item.uid || item.ocifId || item.id || item.profileName;
  
      // Helper to merge incoming items into selectedProfiles without clearing existing ones
      const mergeIncoming = (incomingList: any[]) => {
        const incomingArray = Array.isArray(incomingList) ? incomingList : [];
        
        incomingArray.forEach(incomingItem => {
          const itemKey = getKey(incomingItem);
          const existingIndex = currentProfiles.findIndex(p => getKey(p) === itemKey);
  
          if (existingIndex > -1) {
            // Update existing profile details in place
            currentProfiles[existingIndex] = { ...currentProfiles[existingIndex], ...incomingItem };
          } else {
            // Push new selection onto the accumulated array
            currentProfiles.push(incomingItem);
          }
        });
      };
  
      // Merge incoming arrays without wiping existing state
      if (hasCustomerChange) mergeIncoming(this.selectedCustomerList);
      if (hasHoldChange) mergeIncoming(this.selectedLegalHoldList);
      if (hasEntityChange) mergeIncoming(this.selectedEntityList);
  
      // Update selectedProfiles reference
      this.selectedProfiles = [...currentProfiles];
  
      // Cache updated selection state
      let cachedTrueInChangesBlock = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
      if (cachedTrueInChangesBlock) {
        this.loadCachedProfiles();
      }
    }
  }

    // // Call this when trash icon in Profile(s) Selected is clicked or grid checkbox is toggled off
removeProfile(profileToRemove: any): void {
    const getKey = (item: any) => item.uid || item.ocifId || item.id || item.profileName;
    const removeKey = getKey(profileToRemove);
  
    this.selectedProfiles = this.selectedProfiles.filter(p => getKey(p) !== removeKey);
  
    this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
    this.loadCachedProfiles();
  }