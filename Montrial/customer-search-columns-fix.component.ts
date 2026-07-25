// The fix — guard handleResponse with a mapped data check in ngOnChanges:

ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerGridData'] && 
        this.customerGridData && 
        this.customerGridData.length) {
      this.isLoading = true;
      this.loadError = false;
      const prev = changes['customerGridData'].previousValue;
      const curr = changes['customerGridData'].currentValue;
      if (curr && curr !== prev) {
        // Map first — only proceed if mapping produces real data
        const mapped = this.mapApiResponse(this.customerGridData);
        
        if (mapped?.data?.length > 0) {
          // Real data — re-render grid
          this.handleResponse(mapped);
          this.syncColumns();
        } else {
          // Mapping produced empty — data format mismatch from session storage
          // Keep grid exactly as is, just stop loading
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }
    }
  }

  // updated ng on changes for selected profiles component

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedCustomerList || this.selectedLegalHoldList || this.selectedEntityList) {
      
      // 🟢 Safely extract arrays (defaulting to empty array [] if null/undefined)
      const customersSelectedData = Array.isArray(this.selectedCustomerList) ? this.selectedCustomerList : [];
      const holdSelectedData = Array.isArray(this.selectedLegalHoldList) ? this.selectedLegalHoldList : [];
      const entitySelectedData = Array.isArray(this.selectedEntityList) ? this.selectedEntityList : [];
  
      // 🟢 Merge all active selections into selectedProfiles
      const mergedProfiles = [
        ...customersSelectedData,
        ...holdSelectedData,
        ...entitySelectedData
      ];
  
      // Optional: Deduplicate by unique profile ID/key if profiles could overlap
      // const uniqueProfiles = Array.from(new Map(mergedProfiles.map(item => [item.uid || item.id, item])).values());
      
      this.selectedProfiles = [...mergedProfiles];
  
      let cachedTrueInChangesBlock = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
      if (cachedTrueInChangesBlock) {
        this.loadCachedProfiles();
      }
  
      // this.pruneInvalidProfileMarkers();
    }
  }