// Change 1: customer-search-grid.component.ts

private emitSelected(): void {
  // Filter out parent cluster header rows so ONLY the checked child/standalone profiles are emitted
  const selected = this.allNodes().filter(n => {
    if (!n._selected) return false;
    // Skip parent container rows that have children
    if (n._isParent && n.children && n.children.length > 0) {
      return false;
    }
    return true;
  }) as unknown as CustomerNode[];

  const customerSelection = {
    identifier: 'customer',
    selected: selected
  };

  this.selectionChanged.emit(customerSelection);
}

// Change 2: legal-hold-shell.component.ts (Parent Shell)

private getProfileId(item: any): string {
  if (!item) return '';
  // Use node's unique tree instance ID (_uid) if present, otherwise fallback to business key
  if (item._uid) return String(item._uid);
  const id = item.proxyOcifId ?? item.ocifId ?? item.ecifId ?? item.uid ?? item.id;
  return id !== undefined && id !== null ? String(id) : '';
}

// Then, replace handleSelectionChange in legal-hold-shell.component.ts with this direct assignment:

handleSelectionChange(event: { identifier: string; selected: any[] }): void {
  if (!event || !event.identifier) return;

  const category = event.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList' 
                   : category === 'entity' ? 'selectedEntityList' 
                   : 'selectedLegalHoldList';

  const incomingSelected = Array.isArray(event.selected) ? event.selected : [];

  // Deduplicate incoming items using getProfileId
  const profileMap = new Map<string, any>();
  incomingSelected.forEach(item => {
    const id = this.getProfileId(item);
    if (id) profileMap.set(id, item);
  });

  const updatedList = Array.from(profileMap.values());

  if (category === 'customer') this.selectedCustomerList = updatedList;
  else if (category === 'entity') this.selectedEntityList = updatedList;
  else if (category === 'hold') this.selectedLegalHoldList = updatedList;

  this.setStoredProfiles(storageKey, updatedList);
  this.cdr.detectChanges();
}