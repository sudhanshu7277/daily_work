// 1. In customer-search-grid.component.ts (emitSelected)

private emitSelected(): void {
  // 1. Grab all selected nodes
  const allSelected = this.allNodes().filter(n => n._selected);

  // 2. Filter out parent container rows so we ONLY grab actual selected child/leaf profile records
  const selectedProfiles = allSelected.filter(n => {
    // If this node is a parent cluster container, don't emit it as an individual profile record
    if (n._isParent && n.children && n.children.length > 0) {
      return false;
    }
    return true;
  });

  // 3. Emit cleanly to parent component
  this.selectionChanged.emit({
    identifier: 'customer',
    selected: selectedProfiles
  });
}

//2. In Parent Shell (handleSelectionChange)

export class LegalHoldShellComponent {
  // ... your existing properties like selectedCustomerList, lastEmittedSelections, etc.

  // 🟢 1. DEFINE THE HELPER HERE
  private getProfileId(item: any): string {
    if (!item) return '';

    // Priority 1: Use node's unique tree instance ID (_uid) if present
    if (item._uid) return String(item._uid);

    // Priority 2: Standard primary keys for single standalone profiles
    const id = item.proxyOcifId ?? item.ocifId ?? item.ecifId ?? item.uid ?? item.id ?? item.profileId;
    return id !== undefined && id !== null ? String(id) : '';
  }

  // 🟢 2. CALL IT INSIDE handleSelectionChange
  handleSelectionChange(event: { identifier: string; selected: any[] }): void {
    if (!event || !event.identifier) return;

    const category = event.identifier;
    const storageKey = category === 'customer' ? 'selectedCustomerList' 
                     : category === 'entity' ? 'selectedEntityList' 
                     : 'selectedLegalHoldList';

    const incomingSelected = Array.isArray(event.selected) ? event.selected : [];

    // Read stored items
    const existingStoredList = this.getStoredProfiles(storageKey);
    const profileMap = new Map<string, any>();

    // Call getProfileId when building Map of stored items
    existingStoredList.forEach(item => {
      const id = this.getProfileId(item); // 👈 CALL HERE
      if (id) profileMap.set(id, item);
    });

    // Call getProfileId on incoming emitted selection IDs
    const incomingIds = new Set(
      incomingSelected.map(item => this.getProfileId(item)).filter(id => id !== '') // 👈 CALL HERE
    );

    // Call getProfileId when processing unchecks
    const lastEmitted = this.lastEmittedSelections[category] || [];
    lastEmitted.forEach((item: any) => {
      const id = this.getProfileId(item); // 👈 CALL HERE
      if (id && !incomingIds.has(id)) {
        profileMap.delete(id);
      }
    });

    // Call getProfileId when setting currently checked items
    incomingSelected.forEach(item => {
      const id = this.getProfileId(item); // 👈 CALL HERE
      if (id) {
        profileMap.set(id, item);
      }
    });

    this.lastEmittedSelections[category] = incomingSelected;
    const updatedList = Array.from(profileMap.values());

    if (category === 'customer') this.selectedCustomerList = updatedList;
    else if (category === 'entity') this.selectedEntityList = updatedList;
    else if (category === 'hold') this.selectedLegalHoldList = updatedList;

    this.setStoredProfiles(storageKey, updatedList);
    this.cdr.detectChanges();
  }

  // 🟢 3. CALL IT INSIDE handleRemoveProfile (Side panel trash icon)
  handleRemoveProfile(deselectedProfile: any): void {
    if (!deselectedProfile) return;

    const targetId = this.getProfileId(deselectedProfile); // 👈 CALL HERE

    const removeFromList = (list: any[]) => 
      (list || []).filter(p => this.getProfileId(p) !== targetId); // 👈 CALL HERE

    this.selectedCustomerList = removeFromList(this.selectedCustomerList);
    this.selectedEntityList = removeFromList(this.selectedEntityList);
    this.selectedLegalHoldList = removeFromList(this.selectedLegalHoldList);

    this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
    this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
    this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);

    this.cdr.detectChanges();
  }
}