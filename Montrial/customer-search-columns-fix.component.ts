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

private getProfileId(item: any): string {
  if (!item) return '';
  
  // 🟢 Priority 1: Use node's unique tree instance ID (_uid) if present
  if (item._uid) return String(item._uid);

  // 🟢 Priority 2: Primary keys for standalone single rows
  const id = item.proxyOcifId ?? item.ocifId ?? item.ecifId ?? item.uid ?? item.id;
  return id !== undefined && id !== null ? String(id) : '';
}