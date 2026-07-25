// Add three tracking properties to the class:

private prevCustomerList: any[] = [];
private prevLegalHoldList: any[] = [];
private prevEntityList: any[] = [];

// Replace ngOnChanges entirely:

ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCustomerList']) {
      this.applyDiff(this.prevCustomerList, this.selectedCustomerList || [], 'customer');
      if (this.selectedCustomerList?.length) {
        this.prevCustomerList = [...this.selectedCustomerList];
      }
    }
    if (changes['selectedLegalHoldList']) {
      this.applyDiff(this.prevLegalHoldList, this.selectedLegalHoldList || [], 'legalHold');
      if (this.selectedLegalHoldList?.length) {
        this.prevLegalHoldList = [...this.selectedLegalHoldList];
      }
    }
    if (changes['selectedEntityList']) {
      this.applyDiff(this.prevEntityList, this.selectedEntityList || [], 'entity');
      if (this.selectedEntityList?.length) {
        this.prevEntityList = [...this.selectedEntityList];
      }
    }
  
    const cachedTrue = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
    if (cachedTrue) this.loadCachedProfiles();
  }

  // Add applyDiff method:

  private applyDiff(prev: any[], curr: any[], source: string): void {
    // Skip empty arrays — these are tab-switch resets, not real deselections
    if (!curr.length) return;
  
    const getKey = (p: any) => p.ocifId || p.ecifId || p.proxyOcifId || p.fileNetId || JSON.stringify(p);
  
    const prevKeys = new Set(prev.map(getKey));
    const currKeys = new Set(curr.map(getKey));
  
    // Add newly selected profiles
    curr.forEach(p => {
      if (!prevKeys.has(getKey(p))) {
        this.selectedProfiles = [
          ...this.selectedProfiles,
          { ...p, _source: source }
        ];
      }
    });
  
    // Remove explicitly deselected profiles
    prev.forEach(p => {
      if (!currKeys.has(getKey(p))) {
        this.selectedProfiles = this.selectedProfiles.filter(
          sp => getKey(sp) !== getKey(p)
        );
      }
    });
  }