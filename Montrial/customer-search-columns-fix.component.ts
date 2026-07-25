ngOnChanges(changes: SimpleChanges): void {
    // Check if any of the selection lists changed
    if (changes['selectedCustomerList'] || changes['selectedLegalHoldList'] || changes['selectedEntityList']) {
      
      // 1. Extract non-empty lists from current @Inputs
      const newCustomerItems = Array.isArray(this.selectedCustomerList) ? this.selectedCustomerList : [];
      const newHoldItems = Array.isArray(this.selectedLegalHoldList) ? this.selectedLegalHoldList : [];
      const newEntityItems = Array.isArray(this.selectedEntityList) ? this.selectedEntityList : [];
  
      // Combine incoming items from inputs
      const incomingSelections = [...newCustomerItems, ...newHoldItems, ...newEntityItems];
  
      if (incomingSelections.length > 0) {
        // 2. Load existing/cached profiles so we don't lose previous tab selections
        const existingProfiles = this.selectedProfiles || [];
  
        // 3. Merge existing + incoming items, avoiding duplicate profile IDs
        const profileMap = new Map<string, any>();
  
        // Keep previously selected profiles
        existingProfiles.forEach(item => {
          const key = item.uid || item.ocifId || item.id || item.profileName;
          if (key) profileMap.set(key, item);
        });
  
        // Append/update newly selected profiles
        incomingSelections.forEach(item => {
          const key = item.uid || item.ocifId || item.id || item.profileName;
          if (key) profileMap.set(key, item);
        });
  
        // Convert Map back to Array
        this.selectedProfiles = Array.from(profileMap.values());
      }
  
      // 4. Cache updated selected profiles
      let cachedTrueInChangesBlock = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
      if (cachedTrueInChangesBlock) {
        this.loadCachedProfiles();
      }
    }
  }