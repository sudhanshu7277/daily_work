// Step 1 — Add @Input() activeSearchType to SelectionPanelComponent:

@Input() activeSearchType: 'customer' | 'legalHold' | 'entity' = 'customer';

//Step 2 — Update processChange to use it:

ngOnChanges(changes: SimpleChanges): void {
    const getKey = (p: any): string =>
      p.ocifId ?? p.ecifId ?? p.proxyOcifId ?? p.fileNetId ?? JSON.stringify(p);
  
    const processChange = (
      prev: any[], 
      curr: any[], 
      source: 'customer' | 'legalHold' | 'entity'
    ): void => {
      // curr is empty
      if (!curr.length) {
        // Tab switch — source is NOT the active tab → skip
        if (source !== this.activeSearchType) return;
        
        // Real last-item uncheck — source IS active tab AND prev had items
        if (prev.length > 0) {
          const prevKeys = new Set(prev.map(getKey));
          prevKeys.forEach(key => {
            const idx = this.selectedProfiles
              .findIndex((sp: any) => getKey(sp) === key);
            if (idx > -1) this.selectedProfiles.splice(idx, 1);
          });
        }
        return;
      }
  
      // ADD new items
      curr.forEach(p => {
        const alreadyExists = this.selectedProfiles
          .some((sp: any) => getKey(sp) === getKey(p));
        if (!alreadyExists) {
          this.selectedProfiles.push(p);
        }
      });
  
      // REMOVE unchecked items
      if (prev.length > 0) {
        const currKeys = new Set(curr.map(getKey));
        prev.forEach(p => {
          if (!currKeys.has(getKey(p))) {
            const idx = this.selectedProfiles
              .findIndex((sp: any) => getKey(sp) === getKey(p));
            if (idx > -1) this.selectedProfiles.splice(idx, 1);
          }
        });
      }
    };
  
    if (changes['selectedCustomerList']) {
      processChange(
        changes['selectedCustomerList'].previousValue || [],
        changes['selectedCustomerList'].currentValue || [],
        'customer'
      );
    }
    if (changes['selectedLegalHoldList']) {
      processChange(
        changes['selectedLegalHoldList'].previousValue || [],
        changes['selectedLegalHoldList'].currentValue || [],
        'legalHold'
      );
    }
    if (changes['selectedEntityList']) {
      processChange(
        changes['selectedEntityList'].previousValue || [],
        changes['selectedEntityList'].currentValue || [],
        'entity'
      );
    }
  
    this.selectedProfiles = [...this.selectedProfiles];
    const cachedTrue = this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
    if (cachedTrue) this.loadCachedProfiles();
  }

  //Step 3 — Shell template, pass active tab:

  <app-selection-panel
  [activeSearchType]="activeSearchType"
  ...
>

// Step 4 — Shell, set activeSearchType when tab switches:

activeSearchType: 'customer' | 'legalHold' | 'entity' = 'customer';

onTabSwitch(tab: 'customer' | 'legalHold' | 'entity'): void {
  this.activeSearchType = tab;
  // existing tab switch logic
}

