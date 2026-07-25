ngOnChanges(changes: SimpleChanges): void {
    const hasCustomerChange = !!changes['selectedCustomerList'];
    const hasHoldChange = !!changes['selectedLegalHoldList'];
    const hasEntityChange = !!changes['selectedEntityList'];
  
    if (hasCustomerChange || hasHoldChange || hasEntityChange) {
  
      // 1. Get current active profiles
      let currentProfiles = [...(this.selectedProfiles || [])];
  
      // Helper unique key generator
      const getKey = (item: any) => item.uid || item.ocifId || item.id || item.profileName;
  
      // Helper to sync incoming changes for a specific category
      const syncCategory = (incomingList: any[], categoryType: string) => {
        const incomingArray = Array.isArray(incomingList) ? incomingList : [];
        const incomingKeys = new Set(incomingArray.map(item => getKey(item)));
  
        // Step A: Remove profiles belonging to this category that are NO LONGER in the incoming list (Unchecked)
        currentProfiles = currentProfiles.filter(profile => {
          if (profile._category === categoryType) {
            return incomingKeys.has(getKey(profile));
          }
          return true; // Keep profiles from other categories intact!
        });
  
        // Step B: Add or update newly selected profiles for this category
        incomingArray.forEach(incomingItem => {
          const itemKey = getKey(incomingItem);
          const existingIndex = currentProfiles.findIndex(p => getKey(p) === itemKey);
  
          const taggedItem = { ...incomingItem, _category: categoryType };
  
          if (existingIndex > -1) {
            // Update existing item in place
            currentProfiles[existingIndex] = taggedItem;
          } else {
            // Add newly checked item
            currentProfiles.push(taggedItem);
          }
        });
      };
  
      // 2. Synchronize each list whenever its input updates
      if (hasCustomerChange) {
        syncCategory(this.selectedCustomerList, 'CUSTOMER');
      }
      if (hasHoldChange) {
        syncCategory(this.selectedLegalHoldList, 'HOLD');
      }
      if (hasEntityChange) {
        syncCategory(this.selectedEntityList, 'ENTITY');
      }
  
      // 3. Update component state
      this.selectedProfiles = [...currentProfiles];
  
      // 4. Cache updated state
      let cachedTrueInChangesBlock = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
      if (cachedTrueInChangesBlock) {
        this.loadCachedProfiles();
      }
    }
  }