ngOnChanges(changes: SimpleChanges): void {
    const getKey = (p: any): string =>
      p.ocifId ?? p.ecifId ?? p.proxyOcifId ?? p.fileNetId ?? JSON.stringify(p);
  
    if (changes['selectedCustomerList']) {
      const prev: any[] = changes['selectedCustomerList'].previousValue || [];
      const curr: any[] = changes['selectedCustomerList'].currentValue || [];
      this.syncDiff(prev, curr, getKey);
    }
  
    if (changes['selectedLegalHoldList']) {
      const prev: any[] = changes['selectedLegalHoldList'].previousValue || [];
      const curr: any[] = changes['selectedLegalHoldList'].currentValue || [];
      this.syncDiff(prev, curr, getKey);
    }
  
    if (changes['selectedEntityList']) {
      const prev: any[] = changes['selectedEntityList'].previousValue || [];
      const curr: any[] = changes['selectedEntityList'].currentValue || [];
      this.syncDiff(prev, curr, getKey);
    }
  
    const cachedTrue = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
    if (cachedTrue) this.loadCachedProfiles();
  }
  
  private syncDiff(prev: any[], curr: any[], getKey: (p: any) => string): void {
    // Skip empty — tab switch reset, not a real deselection
    if (!curr.length) return;
  
    const prevKeys = new Set(prev.map(getKey));
    const currKeys = new Set(curr.map(getKey));
  
    // Add newly selected
    curr.forEach(p => {
      if (!prevKeys.has(getKey(p)) &&
          !this.selectedProfiles.find((sp: any) => getKey(sp) === getKey(p))) {
        this.selectedProfiles = [...this.selectedProfiles, p];
      }
    });
  
    // Remove explicitly deselected (only when prev had items)
    if (prev.length > 0) {
      prev.forEach(p => {
        if (!currKeys.has(getKey(p))) {
          this.selectedProfiles = this.selectedProfiles.filter(
            (sp: any) => getKey(sp) !== getKey(p)
          );
        }
      });
    }
  }