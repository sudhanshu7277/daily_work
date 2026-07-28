getRowId = (params: GetRowIdParams): string => {
  const data = params.data;
  if (!data) return '';

  // 1. Check all possible ID properties present in your backend payload
  const id = data.ocifId 
          || data.proxyOcifId 
          || data.ecifId 
          || data.uid 
          || data.id 
          || data.profileId 
          || data.customerNumber;

  if (id !== undefined && id !== null && id !== '') {
    return String(id);
  }

  // 2. Fallback: Generate a unique ID if no explicit ID exists, but do NOT use JSON.stringify
  // (AG-Grid DOM row keys break if stringified JSON contains special characters)
  if (!data._gridRowUniqueId) {
    data._gridRowUniqueId = 'row_' + Math.random().toString(36).substring(2, 9);
  }
  return data._gridRowUniqueId;
};

  // step2

  // Call this after setting rowData or inside onGridReady / onSelectionChanged
syncSelectedGridNodes(): void {
  if (!this.gridApi) return;

  // Retrieve stored profiles for this category
  const storedList = this.getStoredProfiles('selectedCustomerList');
  const storedIds = new Set(storedList.map(item => 
    item.ocifId || item.proxyOcifId || item.ecifId || item.uid || item.id || item.profileId
  ));

  this.gridApi.forEachNode((node) => {
    if (node.data) {
      const nodeId = node.data.ocifId || node.data.proxyOcifId || node.data.ecifId || node.data.uid || node.data.id || node.data.profileId;
      if (storedIds.has(nodeId)) {
        node.setSelected(true, false, true); // (newValue, clearSelection, suppressEvents)
      }
    }
  });
}

//Step 3: Verify Column Def Checkbox Configuration

{
  headerName: 'Profile Name',
  field: 'profileName',
  checkboxSelection: true,
  headerCheckboxSelection: true,
  // ... other column options
}