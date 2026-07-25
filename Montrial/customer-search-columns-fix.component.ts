private prevCustomerList: any[] = [];
private prevLegalHoldList: any[] = [];
private prevEntityList: any[] = [];

private getKey = (p: any): string => 
  p.ocifId ?? p.ecifId ?? p.proxyOcifId ?? p.fileNetId ?? JSON.stringify(p);

private syncSource(
  prev: any[], 
  curr: any[], 
  source: string
): any[] {
  // Empty incoming = new search reset or tab switch
  // Preserve selectedProfiles, just reset tracking
  if (!curr.length) return prev.length ? [] : prev;

  const prevKeys = new Set(prev.map(this.getKey));
  const currKeys = new Set(curr.map(this.getKey));

  // Add newly checked items
  curr.forEach(p => {
    const key = this.getKey(p);
    if (!prevKeys.has(key) && 
        !this.selectedProfiles.find(sp => this.getKey(sp) === key)) {
      this.selectedProfiles = [
        ...this.selectedProfiles, 
        { ...p, _source: source }
      ];
    }
  });

  // Remove explicitly unchecked items
  // Only diff when prev was also non-empty (real uncheck, not reset)
  if (prev.length > 0) {
    prev.forEach(p => {
      if (!currKeys.has(this.getKey(p))) {
        this.selectedProfiles = this.selectedProfiles.filter(
          sp => this.getKey(sp) !== this.getKey(p)
        );
      }
    });
  }

  return [...curr];
}

ngOnChanges(changes: SimpleChanges): void {
  let updated = false;

  if (changes['selectedCustomerList']) {
    this.prevCustomerList = this.syncSource(
      this.prevCustomerList,
      this.selectedCustomerList || [],
      'customer'
    );
    updated = true;
  }

  if (changes['selectedLegalHoldList']) {
    this.prevLegalHoldList = this.syncSource(
      this.prevLegalHoldList,
      this.selectedLegalHoldList || [],
      'legalHold'
    );
    updated = true;
  }

  if (changes['selectedEntityList']) {
    this.prevEntityList = this.syncSource(
      this.prevEntityList,
      this.selectedEntityList || [],
      'entity'
    );
    updated = true;
  }

  if (updated) {
    const cachedTrue = this.cacheSelectedProfiles(
      'profilesSelected', 
      this.selectedProfiles
    );
    if (cachedTrue) this.loadCachedProfiles();
  }
}