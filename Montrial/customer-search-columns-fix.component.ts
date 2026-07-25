ngOnChanges(changes: SimpleChanges): void {
    const getKey = (p: any): string =>
      p.ocifId ?? p.ecifId ?? p.proxyOcifId ?? p.fileNetId ?? JSON.stringify(p);
  
    const processChange = (prev: any[], curr: any[]): void => {
      // Empty curr = tab switch reset → skip entirely, preserve selections
      if (!curr.length) return;
  
      // Add items in curr that aren't already in selectedProfiles
      curr.forEach(p => {
        if (!this.selectedProfiles.find((sp: any) => getKey(sp) === getKey(p))) {
          this.selectedProfiles = [...this.selectedProfiles, p];
        }
      });
  
      // Remove items that were in prev but not in curr = explicit uncheck in grid
      if (prev.length > 0) {
        const currKeys = new Set(curr.map(getKey));
        prev.forEach(p => {
          if (!currKeys.has(getKey(p))) {
            this.selectedProfiles = this.selectedProfiles.filter(
              (sp: any) => getKey(sp) !== getKey(p)
            );
          }
        });
      }
    };
  
    if (changes['selectedCustomerList']) {
      processChange(
        changes['selectedCustomerList'].previousValue || [],
        changes['selectedCustomerList'].currentValue || []
      );
    }
  
    if (changes['selectedLegalHoldList']) {
      processChange(
        changes['selectedLegalHoldList'].previousValue || [],
        changes['selectedLegalHoldList'].currentValue || []
      );
    }
  
    if (changes['selectedEntityList']) {
      processChange(
        changes['selectedEntityList'].previousValue || [],
        changes['selectedEntityList'].currentValue || []
      );
    }
  
    const cachedTrue = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
    if (cachedTrue) this.loadCachedProfiles();
  }