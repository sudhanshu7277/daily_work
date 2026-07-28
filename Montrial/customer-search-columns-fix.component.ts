// 1. In customer-search-grid.component.html

// Add [getRowId]="getRowId" to the <ag-grid-angular> tag:

<ag-grid-angular
  class="ag-theme-alpine csg-grid"
  [class.grid--hidden]="!tree.length"
  style="width: 100%;"
  [rowData]="rowData"
  [columnDefs]="columnDefs"
  [defaultColDef]="defaultColDef"
  [rowSelection]="'multiple'"
  [suppressRowClickSelection]="true"
  [rowHeight]="52"
  [headerHeight]="44"
  [suppressCellFocus]="true"
  [animateRows]="false"
  [getRowClass]="getRowClass"
  [getRowId]="getRowId"
  (gridReady)="onGridReady($event)"
  (selectionChanged)="onSelectionChanged($event)"
  (sortChanged)="onSortChanged()">
</ag-grid-angular>

// 2. In customer-search-grid.component.ts
//Add/update these two methods in your class:

//A. Add getRowId Property:

// 🟢 Ensures AG-Grid maps row selection to the actual ID instead of row index (0, 1, 2)
getRowId = (params: GetRowIdParams): string => {
  const data = params.data;
  if (!data) return '';
  const id = data.proxyOcifId ?? data.ocifId ?? data.ecifId ?? data.uid ?? data.id ?? data.profileId;
  return id !== undefined && id !== null ? String(id) : '';
};

// B. Update onSelectionChanged:
onSelectionChanged(event: any): void {
  if (!event.api) return;

  const selectedNodes = event.api.getSelectedNodes();
  const selectedData = selectedNodes.map((node: any) => node.data).filter(Boolean);

  this.selectionChange.emit({
    identifier: 'customer', // 'entity' or 'hold' for respective grid instances
    selected: selectedData
  });
}

// 3. Parent Component (handleSelectionChange)
//In the parent component containing selectedCustomerList and the selection panel, replace your handleSelectionChange with this Map-based assignment:

private getProfileId(item: any): string {
  if (!item) return '';
  const id = item.proxyOcifId ?? item.ocifId ?? item.ecifId ?? item.uid ?? item.id ?? item.profileId;
  return id !== undefined && id !== null ? String(id) : '';
}

handleSelectionChange(event: { identifier: string; selected: any[] }): void {
  if (!event || !event.identifier) return;

  const category = event.identifier;
  const storageKey = category === 'customer' ? 'selectedCustomerList' 
                   : category === 'entity' ? 'selectedEntityList' 
                   : 'selectedLegalHoldList';

  const incomingSelected = Array.isArray(event.selected) ? event.selected : [];
  const incomingIds = new Set(incomingSelected.map(item => this.getProfileId(item)).filter(id => id !== ''));

  // Read existing items from sessionStorage
  const existingStoredList = this.getStoredProfiles(storageKey);
  const profileMap = new Map<string, any>();

  // Preserve stored items from other searches
  existingStoredList.forEach(item => {
    const id = this.getProfileId(item);
    if (id) profileMap.set(id, item);
  });

  // Explicitly remove items unchecked in current AG-Grid view
  const lastEmitted = this.lastEmittedSelections[category] || [];
  lastEmitted.forEach((item: any) => {
    const id = this.getProfileId(item);
    if (id && !incomingIds.has(id)) {
      profileMap.delete(id);
    }
  });

  // Add currently checked items (Map.set auto-prevents duplicates)
  incomingSelected.forEach(item => {
    const id = this.getProfileId(item);
    if (id) profileMap.set(id, item);
  });

  this.lastEmittedSelections[category] = incomingSelected;
  const updatedList = Array.from(profileMap.values());

  if (category === 'customer') this.selectedCustomerList = updatedList;
  else if (category === 'entity') this.selectedEntityList = updatedList;
  else if (category === 'hold') this.selectedLegalHoldList = updatedList;

  this.setStoredProfiles(storageKey, updatedList);
  if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  }

  this.cdr.detectChanges();
}









// ROUND 2

// Fix 1: In customer-search-grid.component.ts
//Add this helper method to your component, and call it right after this.tree is built/updated (for example, inside ngOnChanges or after your API response transforms the data into this.tree):

// 🟢 Call this immediately after 'this.tree' is populated
private syncTreeWithSessionStorage(): void {
  try {
    const stored = sessionStorage.getItem('selectedCustomerList');
    const storedList: any[] = stored ? JSON.parse(stored) : [];

    if (!storedList || storedList.length === 0) return;

    // 1. Create a Set of stored IDs (checking all candidate primary keys)
    const storedIds = new Set(
      storedList
        .map(item => item.ocifId || item.proxyOcifId || item.ecifId || item.uid || item.id)
        .filter(Boolean)
    );

    // 2. Hydrate tree nodes so custom checkboxes visually render as checked
    this.allNodes().forEach((node: any) => {
      const nodeId = node.ocifId || node.proxyOcifId || node.ecifId || node.uid || node.id;
      if (nodeId && storedIds.has(nodeId)) {
        node._selected = true;
      }
    });

    // 3. Keep parent nodes in sync if all children are checked
    this.tree.forEach((parent: any) => {
      if (parent.children && parent.children.length > 0) {
        parent._selected = parent.children.every((c: any) => c._selected);
      }
    });

    // Trigger grid redraw so NameCellComponent picks up _selected = true
    this.refresh();
  } catch (e) {
    console.error('Error syncing tree selections:', e);
  }
}


// Fix 2: In Parent Component (legal-hold-shell.component.ts or main container)
//Replace your existing handleSelectionChange and handleRemoveProfile with this implementation. Using a Map keyed by unique ID prevents duplicate profile additions mathematically and cleanly removes unchecked items.

// Helper to extract primary key consistently from any profile object
private getProfileId(item: any): string {
  if (!item) return '';
  const id = item.ocifId ?? item.proxyOcifId ?? item.ecifId ?? item.uid ?? item.id ?? item.profileId;
  return id !== undefined && id !== null ? String(id) : '';
}

handleSelectionChange(event: { identifier: string; selected: any[] }): void {
  if (!event || !event.identifier) return;

  const category = event.identifier; // 'customer' | 'entity' | 'hold'
  const storageKey = category === 'customer' ? 'selectedCustomerList' 
                   : category === 'entity' ? 'selectedEntityList' 
                   : 'selectedLegalHoldList';

  const incomingSelected = Array.isArray(event.selected) ? event.selected : [];

  // 1. Read existing list from SessionStorage (preserves selections across searches/tabs)
  const existingStoredList = this.getStoredProfiles(storageKey);
  const profileMap = new Map<string, any>();

  existingStoredList.forEach(item => {
    const id = this.getProfileId(item);
    if (id) profileMap.set(id, item);
  });

  // 2. Identify incoming IDs emitted by custom tree checkboxes
  const incomingIds = new Set(
    incomingSelected.map(item => this.getProfileId(item)).filter(id => id !== '')
  );

  // 3. Remove items from this category that were UNCHECKED in the active grid view
  const lastEmitted = this.lastEmittedSelections[category] || [];
  lastEmitted.forEach((item: any) => {
    const id = this.getProfileId(item);
    if (id && !incomingIds.has(id)) {
      profileMap.delete(id); // Explicit unselect
    }
  });

  // 4. Add/Update currently checked items (Map.set auto-overwrites to prevent duplicates!)
  incomingSelected.forEach(item => {
    const id = this.getProfileId(item);
    if (id) {
      profileMap.set(id, item);
    }
  });

  // 5. Save active emission snapshot & update state
  this.lastEmittedSelections[category] = incomingSelected;
  const updatedList = Array.from(profileMap.values());

  if (category === 'customer') this.selectedCustomerList = updatedList;
  else if (category === 'entity') this.selectedEntityList = updatedList;
  else if (category === 'hold') this.selectedLegalHoldList = updatedList;

  // 6. Sync back to SessionStorage & trigger change detection
  this.setStoredProfiles(storageKey, updatedList);

  if (typeof this.cacheIndividualAndEntityProfiles === 'function') {
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  }

  this.cdr.detectChanges();
}

// Side-panel trash icon remove handler
handleRemoveProfile(deselectedProfile: any): void {
  if (!deselectedProfile) return;

  const targetId = this.getProfileId(deselectedProfile);

  const removeFromList = (list: any[]) => 
    (list || []).filter(p => this.getProfileId(p) !== targetId);

  this.selectedCustomerList = removeFromList(this.selectedCustomerList);
  this.selectedEntityList = removeFromList(this.selectedEntityList);
  this.selectedLegalHoldList = removeFromList(this.selectedLegalHoldList);

  // Sync back to Session Storage
  this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
  this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
  this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);

  // Reset emission tracking memory
  this.lastEmittedSelections = { customer: [], entity: [], hold: [] };

  this.cdr.detectChanges();
}




