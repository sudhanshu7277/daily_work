handleSelectionChange(selectedRows: any): void {
  console.log('--- SELECTION EVENT DEBUG ---');
  console.log('Incoming Event Identifier:', selectedRows?.identifier);
  console.log('Incoming Selected Count:', selectedRows?.selected?.length);
  console.log('Incoming Selected Items Raw:', JSON.parse(JSON.stringify(selectedRows?.selected || [])));
  if (!selectedRows || !selectedRows.identifier) return;

  const category = selectedRows.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList'
                   : category === 'entity' ? 'selectedEntityList'
                   : 'selectedLegalHoldList';

  const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];

  // 1. STABLE ID GENERATOR: Only use permanent data properties (never dynamic _uid)
  const getId = (item: any): string => {
    if (!item) return '';
    const baseId = item.proxyOcifId || item.ocifId || item.ecifId || item.uid || item.id || '';
    const holdName = item.legalHoldName || item.legalHoldId || item.holdName || '';
    
    // If a customer has multiple legal hold records, pair baseId + holdName
    if (baseId && holdName) {
      return `${baseId}_${holdName}`.trim();
    }
    
    return String(baseId || item._uid || '').trim();
  };

  // 2. STRICT DEDUPLICATION
  const deduplicate = (list: any[]) => {
    const seen = new Set<string>();
    return list.filter(item => {
      const id = getId(item);
      if (!id) return false; // Filter out empty/invalid items
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  // 3. Read session storage
  const masterListFromSession = this.getStoredProfiles(storageKey) || [];
  const previousGridState = this.lastEmittedSelections[category] || [];
  const incomingIds = new Set(incomingSelected.map(r => getId(r)).filter(Boolean));

  // 4. Track unchecked items in current grid
  const uncheckedIds = new Set<string>();
  previousGridState.forEach(item => {
    const id = getId(item);
    if (id && !incomingIds.has(id)) {
      uncheckedIds.add(id);
    }
  });

  // 5. Save state
  this.lastEmittedSelections[category] = incomingSelected;

  // 6. Filter & Deduplicate
  let updatedList = masterListFromSession.filter(item => {
    const id = getId(item);
    return id && !uncheckedIds.has(id);
  });

  updatedList = deduplicate([...updatedList, ...incomingSelected]);

  // 7. Assign to list
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

  const getId = (item: any): string => {
    if (!item) return '';
    const baseId = item.proxyOcifId || item.ocifId || item.ecifId || item.uid || item.id || '';
    const holdName = item.legalHoldName || item.legalHoldId || item.holdName || '';
    return (baseId && holdName) ? `${baseId}_${holdName}`.trim() : String(baseId || item._uid || '').trim();
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