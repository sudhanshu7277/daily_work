

handleSelectionChange(selectedRows: any): void {
  if (!selectedRows || !selectedRows.identifier) return;

  const category = selectedRows.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList'
                   : category === 'entity' ? 'selectedEntityList'
                   : 'selectedLegalHoldList';

  const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
  const getId = (item: any) => {
    if (!item) return '';
    // Check proxyOcifId and standard primary keys
    const baseId = item.proxyOcifId || item.ocifId || item.ecifId || item.uid || item.id;
    
    // If multiple holds/rows share the same proxyOcifId, differentiate them using hold/tree attributes
    const rowQualifier = item._uid || item.legalHoldName || item.rowId;
    
    if (baseId && rowQualifier) {
      return `${baseId}_${rowQualifier}`;
    }
    return baseId ? String(baseId) : (item._uid ? String(item._uid) : '');
  };

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

  const masterListFromSession = this.getStoredProfiles(storageKey) || [];
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

handleRemoveProfile(deselectedProfile: any): void {
  if (!deselectedProfile) return;

  const getId = (item: any) => item?.ocifId || item?.ecifId || item?.uid || item?.id;
  const targetId = getId(deselectedProfile);

  if (targetId) {
    this.selectedCustomerList = (this.selectedCustomerList || []).filter(
      p => getId(p) !== targetId
    );
    this.selectedEntityList = (this.selectedEntityList || []).filter(
      p => getId(p) !== targetId
    );
    this.selectedLegalHoldList = (this.selectedLegalHoldList || []).filter(
      p => getId(p) !== targetId
    );

    this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
    this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
    this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);

    this.cdr.detectChanges();
  }
}