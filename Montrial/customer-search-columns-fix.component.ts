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



