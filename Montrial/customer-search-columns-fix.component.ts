handleSelectionChange(selectedRows: any): void {
  if (!selectedRows || !selectedRows.identifier) return;

  const category = selectedRows.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList'
                   : category === 'entity' ? 'selectedEntityList'
                   : 'selectedLegalHoldList';

  const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];

  // Deduplication helper using business ID matching
  const deduplicate = (list: any[]) => {
    const seen = new Set();
    return list.filter(item => {
      const id = this.getProfileId(item);
      if (id) {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }
      return true;
    });
  };

  // 1. Fetch persistent profiles from sessionStorage
  const masterListFromSession = this.getStoredProfiles(storageKey) || [];
  const previousGridState = this.lastEmittedSelections[category] || [];
  const incomingIds = new Set(incomingSelected.map(r => this.getProfileId(r)));

  // 2. Identify profiles explicitly unchecked in the current active grid view
  const uncheckedIds = new Set<string>();
  previousGridState.forEach(item => {
    const id = this.getProfileId(item);
    if (id && !incomingIds.has(id)) {
      uncheckedIds.add(id);
    }
  });

  // 3. Update active grid snapshot
  this.lastEmittedSelections[category] = incomingSelected;

  // 4. Filter out unchecked profiles from master storage and append newly selected ones
  let updatedList = masterListFromSession.filter(item => !uncheckedIds.has(this.getProfileId(item)));
  updatedList = deduplicate([...updatedList, ...incomingSelected]);

  // 5. Update local state
  if (category === 'customer') {
    this.selectedCustomerList = updatedList;
  } else if (category === 'entity') {
    this.selectedEntityList = updatedList;
  } else if (category === 'hold') {
    this.selectedLegalHoldList = updatedList;
  }

  // 6. Persist state back to Session Storage & Cache
  this.setStoredProfiles(storageKey, updatedList);
  
  if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  }

  this.cdr.detectChanges();
}