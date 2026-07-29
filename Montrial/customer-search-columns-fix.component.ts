private getProfileId(item: any): string {
  if (!item) return '';

  // 1. Check primary OCIF / Entity identifiers
  const primaryId = item.proxyOcifId || item.ocifId || item.ecifId || item.profileId;
  if (primaryId) return String(primaryId).trim();

  // 2. Fallback to instance / record identifiers if proxyOcifId is missing
  const secondaryId = item.uid || item.id || item._uid || item.rowId;
  if (secondaryId) return String(secondaryId).trim();

  // 3. Last resort fallback: generate a stable unique string from profile attributes
  if (item.profileName || item.firstName) {
    return `${item.profileName || item.firstName}_${item.legalHoldName || ''}`.trim();
  }

  return '';
}

handleSelectionChange(selectedRows: any): void {
  if (!selectedRows || !selectedRows.identifier) return;

  const category = selectedRows.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList' 
                   : category === 'entity' ? 'selectedEntityList' 
                   : 'selectedLegalHoldList';

  const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];

  // Helper deduplicator using our bulletproof ID extractor
  const deduplicate = (list: any[]) => {
    const seen = new Set<string>();
    return list.filter(item => {
      const id = this.getProfileId(item);
      if (!id) return true; // Keep if no ID to be safe
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  // 1. Load existing session data for THIS active category only
  const masterListFromSession = this.getStoredProfiles(storageKey) || [];
  const previousGridState = this.lastEmittedSelections[category] || [];
  
  // Create Set of valid IDs coming from the current emission
  const incomingIds = new Set(
    incomingSelected.map(r => this.getProfileId(r)).filter(id => id !== '')
  );

  // 2. Determine items explicitly unchecked in active view
  const uncheckedIds = new Set<string>();
  previousGridState.forEach((item: any) => {
    const id = this.getProfileId(item);
    if (id && !incomingIds.has(id)) {
      uncheckedIds.add(id);
    }
  });

  // 3. Save memory snapshot
  this.lastEmittedSelections[category] = incomingSelected;

  // 4. Merge stored items (excluding unchecked) with newly selected items
  let updatedList = masterListFromSession.filter((item: any) => {
    const id = this.getProfileId(item);
    return !id || !uncheckedIds.has(id);
  });

  updatedList = deduplicate([...updatedList, ...incomingSelected]);

  // 5. Update local state for active category ONLY
  if (category === 'customer') {
    this.selectedCustomerList = updatedList;
  } else if (category === 'entity') {
    this.selectedEntityList = updatedList;
  } else if (category === 'hold') {
    this.selectedLegalHoldList = updatedList;
  }

  // 6. Persist state
  this.setStoredProfiles(storageKey, updatedList);

  if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  }

  this.cdr.detectChanges();
}

sessionStorage.clear();




// let c if this rools back and fixes

handleSelectionChange(selectedRows: any): void {
  if (!selectedRows || !selectedRows.identifier) return;

  const category = selectedRows.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList'
                   : category === 'entity' ? 'selectedEntityList'
                   : 'selectedLegalHoldList';

  const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
  const getId = (item: any) => item?.ocifId || item?.ecifId || item?.uid || item?.id;

  const deduplicate = (list: any[]) => {
    const seen = new Set();
    return list.filter(item => {
      const id = getId(item);
      if (id) {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }
      return true;
    });
  };

  const masterListFromSession = this.getStoredProfiles(storageKey);
  const previousGridState = this.lastEmittedSelections[category] || [];
  const incomingIds = new Set(incomingSelected.map(r => getId(r)));

  const uncheckedIds = new Set<string | number>();
  previousGridState.forEach(item => {
    const id = getId(item);
    if (id && !incomingIds.has(id)) {
      uncheckedIds.add(id);
    }
  });

  this.lastEmittedSelections[category] = incomingSelected;

  let updatedList = masterListFromSession.filter(item => !uncheckedIds.has(getId(item)));
  updatedList = deduplicate([...updatedList, ...incomingSelected]);

  if (category === 'customer') {
    this.selectedCustomerList = updatedList;
  } else if (category === 'entity') {
    this.selectedEntityList = updatedList;
  } else if (category === 'hold') {
    this.selectedLegalHoldList = updatedList;
  }

  this.setStoredProfiles(storageKey, updatedList);
  this.cacheIndividualAndEntityProfiles(storageKey, updatedList);

  this.cdr.detectChanges();
}