// The Solution — Session Cache + Preselect on Search

//Step 1 — When profiles are selected, cache them with sourceGrid tag:

// legal-hold-shell.component.ts

onCustomerSelectionChanged(rows: any[]): void {
    const stamped = rows.map(r => ({ ...r, sourceGrid: 'customer' }));
    this.mergeSelectedProfiles(stamped, 'customer');
  }
  
  onLegalHoldSelectionChanged(rows: any[]): void {
    const stamped = rows.map(r => ({ ...r, sourceGrid: 'legal-hold' }));
    this.mergeSelectedProfiles(stamped, 'legal-hold');
  }
  
  onEntitySelectionChanged(rows: any[]): void {
    const stamped = rows.map(r => ({ ...r, sourceGrid: 'entity' }));
    this.mergeSelectedProfiles(stamped, 'entity');
  }
  
  private mergeSelectedProfiles(incoming: any[], source: string): void {
    // Remove old entries from this source, add new ones
    this.selectedProfiles = [
      ...this.selectedProfiles.filter(p => p.sourceGrid !== source),
      ...incoming,
    ];
    sessionStorage.setItem('selectedProfiles', 
      JSON.stringify(this.selectedProfiles));
  }

    // Step 2 — When search results come back, preselect previously cached profiles:

    // legal-hold-shell.component.ts

// After API response comes back for customer search:
onSearch(criteria: any): void {
    // ...existing API call...
    this.customerGridData = response; // array from API
  
    // Pass previously selected ocifIds for this grid type back to the grid
    this.customerPreselectIds = this.selectedProfiles
      .filter(p => p.sourceGrid === 'customer')
      .map(p => p.proxyOcifId);
  
    this.cdr.detectChanges();
  }

  // In legal-hold-shell.component.html:

  <app-customer-search-grid
  [customerGridData]="customerGridData"
  [preselectIds]="customerPreselectIds"
  (selectionChanged)="onCustomerSelectionChanged($event)">
</app-customer-search-grid>

// Step 4 — Delete from selected profiles:

// legal-hold-shell.component.ts

onRemove(profile: any, index: number): void {
    if (index !== undefined && index > -1) {
      this.deleteByIndex(this.selectedProfiles, index);
      sessionStorage.setItem('selectedProfiles',
        JSON.stringify(this.selectedProfiles));
  
      // Signal the correct grid to deselect — only if it's currently visible
      this.deletedProfile = profile;
      setTimeout(() => this.deletedProfile = null, 0);
  
      this.cdr.detectChanges();
    }
  }
  