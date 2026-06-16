// selection-panel.component.ts — stamp sourceGrid in ngOnChanges

// Current line 131:

this.selectedProfiles = [
    ...customersSelectedData || [],
    ...holdSelectedData || [],
    ...entitySelectedData || []
  ];

  // Replace with:

  this.selectedProfiles = [
    ...(customersSelectedData || []).map((r: any) => ({ ...r, sourceGrid: 'customer' })),
    ...(holdSelectedData || []).map((r: any) => ({ ...r, sourceGrid: 'legal-hold' })),
    ...(entitySelectedData || []).map((r: any) => ({ ...r, sourceGrid: 'entity' })),
  ];

  // 2. selection-panel.component.ts — save updated cache after deleteByIndex in onRemove
// Current onRemove (line 485-503):

onRemove(profile: any, index: number): void {
    console.log('Removing item at index:', index);
  
    if (index !== undefined && index > -1) {
      this.removeProfile.emit(profile);
      this.deleteByIndex(this.selectedProfiles, index);
      if (this.selectedProfiles.length === 0) {
        this.removeCachedItems('profilesSelected');
        this.clearCache();
      }
  
      this.cdr.detectChanges();
    }
  
    this.cdr.detectChanges();
  }

  // Replace with:

  onRemove(profile: any, index: number): void {
    console.log('Removing item at index:', index);
  
    if (index !== undefined && index > -1) {
      this.removeProfile.emit(profile); // emits to shell with sourceGrid stamped
      this.deleteByIndex(this.selectedProfiles, index);
  
      if (this.selectedProfiles.length === 0) {
        this.removeCachedItems('profilesSelected');
        this.clearCache();
      } else {
        // Keep cache in sync after single deletion
        this.cacheSelectedProfiles('profilesSelected', this.selectedProfiles);
      }
  
      this.cdr.detectChanges();
    }
  }


  // 3. legal-hold-shell.component.ts — update handleRemoveProfile to route by sourceGrid
// Add properties after line 49:

deletedProfile: any | null = null;
customerPreselectIds:  string[] = [];
legalHoldPreselectIds: string[] = [];
entityPreselectIds:    string[] = [];

// Replace handleRemoveProfile (line 293):

handleRemoveProfile(deselectedProfile: any): void {
    // Signal the correct grid to visually deselect — only if currently visible
    this.deletedProfile = deselectedProfile;
    setTimeout(() => { this.deletedProfile = null; }, 0);
  
    // Update individual typed lists
    this.selectedCustomerList  = this.selectedCustomerList
      .filter(p => (p.proxyOcifId ?? p.ocifId) !==
                   (deselectedProfile.proxyOcifId ?? deselectedProfile.ocifId));
    this.selectedLegalHoldList = this.selectedLegalHoldList
      .filter(p => (p.proxyOcifId ?? p.ocifId) !==
                   (deselectedProfile.proxyOcifId ?? deselectedProfile.ocifId));
    this.selectedEntityList    = this.selectedEntityList
      .filter(p => (p.proxyOcifId ?? p.ocifId) !==
                   (deselectedProfile.proxyOcifId ?? deselectedProfile.ocifId));
  
    this.cdr.detectChanges();
  }

  // 4. legal-hold-shell.component.html — add deselectByOcifId to each grid
// app-customer-search-grid (line 54-59) — add one binding:

<app-customer-search-grid
  [customerGridData]="customerGridData.length && customerGridData"
  [searchSummary]="searchSummary"
  [deselectByOcifId]="deletedProfile?.sourceGrid === 'customer'
                       ? (deletedProfile?.proxyOcifId ?? deletedProfile?.ocifId)
                       : null"
  (selectionChanged)="handleSelectionChange(selectedRows: $event)"
  (removeProfile)="handleRemoveProfile(deselectedProfile: $event)">
</app-customer-search-grid>


// app-hold-search-grid (line 77-81) — add one binding:

<app-hold-search-grid
  [legalHoldGridData]="legalHoldGridData.length && legalHoldGridData"
  [searchSummary]="searchSummary"
  [deselectByOcifId]="deletedProfile?.sourceGrid === 'legal-hold'
                       ? (deletedProfile?.proxyOcifId ?? deletedProfile?.ocifId)
                       : null"
  (selectionChanged)="handleSelectionChange(selectedRows: $event)">
</app-hold-search-grid>

// app-temp-entity-data-grid (line 63-68) — add one binding:

<app-temp-entity-data-grid #entityAgGrid
  [tempEntityGridData]="entityGridData.length && entityGridData"
  [searchSummary]="searchSummary"
  [deselectByOcifId]="deletedProfile?.sourceGrid === 'entity'
                       ? (deletedProfile?.proxyOcifId ?? deletedProfile?.ocifId)
                       : null"
  (selectionChanged)="handleSelectionChange(selectedRows: $event)"
  (removeProfile)="handleRemoveProfile(deselectedProfile: $event)">
</app-temp-entity-data-grid>


// 5. customer-search-grid.component.ts — add @Input deselectByOcifId


@Input() set deselectByOcifId(ocifId: string | null) {
    if (!ocifId) return;
    this.deselectByOcif(ocifId);
  }
  
  private deselectByOcif(ocifId: string): void {
    let changed = false;
    for (const n of this.tree) {
      if (n.ocifId === ocifId && n._selected) {
        n._selected = false;
        (n.children ?? []).forEach((c: any) => c._selected = false);
        changed = true;
      }
      for (const c of (n.children ?? [])) {
        if (c.ocifId === ocifId && c._selected) {
          c._selected = false;
          n._selected = false;
          changed = true;
        }
      }
    }
    if (changed) {
      this.refresh();
      this.emitSelected();
    }
  }

  