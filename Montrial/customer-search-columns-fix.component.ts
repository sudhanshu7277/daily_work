handleSelectionChange(event: { identifier: string; selected: any[] }): void {
  if (!event || !event.identifier) return;

  const category = event.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList' 
                   : category === 'entity' ? 'selectedEntityList' 
                   : 'selectedLegalHoldList';

  const incomingSelected: any[] = Array.isArray(event.selected) ? event.selected : [];

  // 1. Fetch master list from sessionStorage to preserve past searches
  const masterListFromSession = this.getStoredProfiles(storageKey) || [];
  const previousGridState = this.lastEmittedSelections[category] || [];

  // 2. Collect incoming IDs from active grid selection
  const incomingIds = new Set(incomingSelected.map(r => this.getProfileId(r)).filter(Boolean));

  // 3. Identify items explicitly UNCHECKED in current grid view
  const uncheckedIds = new Set<string>();
  previousGridState.forEach((item: any) => {
    const id = this.getProfileId(item);
    if (id && !incomingIds.has(id)) {
      uncheckedIds.add(id);
    }
  });

  // 4. Update memory snapshot for diff tracking
  this.lastEmittedSelections[category] = incomingSelected;

  // 5. Deduplicate & Merge (preserves previously selected records from other searches)
  const profileMap = new Map<string, any>();

  // Add existing stored items (excluding items explicitly unchecked in this active view)
  masterListFromSession.forEach((item: any) => {
    const id = this.getProfileId(item);
    if (id && !uncheckedIds.has(id)) {
      profileMap.set(id, item);
    }
  });

  // Merge currently selected items from grid
  incomingSelected.forEach((item: any) => {
    const id = this.getProfileId(item);
    if (id) {
      profileMap.set(id, item);
    }
  });

  const updatedList = Array.from(profileMap.values());

  // 6. Update local component state
  if (category === 'customer') this.selectedCustomerList = updatedList;
  else if (category === 'entity') this.selectedEntityList = updatedList;
  else if (category === 'hold') this.selectedLegalHoldList = updatedList;

  // 7. Persist to SessionStorage & Cache
  this.setStoredProfiles(storageKey, updatedList);
  if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  }

  this.cdr.detectChanges();
}