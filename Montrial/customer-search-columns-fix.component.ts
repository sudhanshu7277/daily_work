handleSelectionChange(selectedRows: any): void {
  if (!selectedRows || !selectedRows.identifier) return;

  const category = selectedRows.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList'
                   : category === 'entity' ? 'selectedEntityList'
                   : 'selectedLegalHoldList';

  const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];

  // 1. Bulletproof ID generator (includes proxyOcifId and row/hold qualifiers)
  const getId = (item: any) => {
    if (!item) return '';
    const baseId = item.proxyOcifId || item.ocifId || item.ecifId || item.uid || item.id;
    const qualifier = item._uid || item.legalHoldName || item.legalHoldId || item.rowId;
    
    if (baseId && qualifier) {
      return `${baseId}_${qualifier}`;
    }
    return baseId ? String(baseId) : (item._uid ? String(item._uid) : '');
  };

  // 2. Strict Deduplication Logic (filters out items with duplicate or empty IDs)
  const deduplicate = (list: any[]) => {
    const seen = new Set<string>();
    return list.filter(item => {
      const id = getId(item);
      if (!id) return false; // 🔴 Stops non-unique/empty ID records from flooding the list
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  // 3. Load persistent state from sessionStorage
  const masterListFromSession = this.getStoredProfiles(storageKey) || [];
  const previousGridState = this.lastEmittedSelections[category] || [];
  const incomingIds = new Set(incomingSelected.map(r => getId(r)).filter(Boolean));

  // 4. Identify unchecked items in active grid
  const uncheckedIds = new Set<string>();
  previousGridState.forEach(item => {
    const id = getId(item);
    if (id && !incomingIds.has(id)) {
      uncheckedIds.add(id);
    }
  });

  // 5. Update active grid tracking memory
  this.lastEmittedSelections[category] = incomingSelected;

  // 6. Merge session records (excluding unchecked) with active grid selection
  let updatedList = masterListFromSession.filter(item => {
    const id = getId(item);
    return id && !uncheckedIds.has(id);
  });

  updatedList = deduplicate([...updatedList, ...incomingSelected]);

  // 7. Sync state
  if (category === 'customer') {
    this.selectedCustomerList = updatedList;
  } else if (category === 'entity') {
    this.selectedEntityList = updatedList;
  } else if (category === 'hold') {
    this.selectedLegalHoldList = updatedList;
  }

  this.setStoredProfiles(storageKey, updatedList);
  if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  }

  this.cdr.detectChanges();
}


handleRemoveProfile(deselectedProfile: any): void {
  if (!deselectedProfile) return;

  const getId = (item: any) => {
    if (!item) return '';
    const baseId = item.proxyOcifId || item.ocifId || item.ecifId || item.uid || item.id;
    const qualifier = item._uid || item.legalHoldName || item.legalHoldId || item.rowId;
    return (baseId && qualifier) ? `${baseId}_${qualifier}` : (baseId ? String(baseId) : String(item._uid || ''));
  };

  const targetId = getId(deselectedProfile);

  if (targetId) {
    this.selectedCustomerList = (this.selectedCustomerList || []).filter(p => getId(p) !== targetId);
    this.selectedEntityList = (this.selectedEntityList || []).filter(p => getId(p) !== targetId);
    this.selectedLegalHoldList = (this.selectedLegalHoldList || []).filter(p => getId(p) !== targetId);

    this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
    this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
    this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);

    this.cdr.detectChanges();
  }
}