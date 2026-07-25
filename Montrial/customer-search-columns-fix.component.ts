ngOnChanges(changes: SimpleChanges): void {
    const getKey = (p: any): string =>
      p.ocifId ?? p.ecifId ?? p.proxyOcifId ?? p.fileNetId ?? JSON.stringify(p);
  
    ['selectedCustomerList', 'selectedLegalHoldList', 'selectedEntityList']
      .forEach(key => {
        if (!changes[key]) return;
        const prev: any[] = changes[key].previousValue || [];
        const curr: any[] = changes[key].currentValue || [];
  
        // ADD new selections
        curr.forEach(p => {
          if (!this.selectedProfiles.some((sp: any) => getKey(sp) === getKey(p))) {
            this.selectedProfiles.push(p);
          }
        });
  
        // REMOVE unchecked items
        const currKeys = new Set(curr.map(getKey));
        prev.forEach(p => {
          if (!currKeys.has(getKey(p))) {
            const idx = this.selectedProfiles
              .findIndex((sp: any) => getKey(sp) === getKey(p));
            if (idx > -1) this.selectedProfiles.splice(idx, 1);
          }
        });
      });
  
    this.selectedProfiles = [...this.selectedProfiles];
    const cached = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
    if (cached) this.loadCachedProfiles();
  }