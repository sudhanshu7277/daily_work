// fixing ProfileName column width

private adjustProfileNameColumnWidth(data: any[]): void {
  if (!this.gridApi || !data?.length) return;

  // Find the longest name string
  const maxNameLength = data.reduce((max, row) => {
    const len = (row.profileName || '').length;
    return len > max ? len : max;
  }, 0);

  // Base padding: ~40px for checkbox, ~30px for dropdown arrow, ~30px cell padding
  const padding = 100;
  const approxFontCharWidth = 8.5; // pixels per character at ~14px font size

  const calculatedWidth = Math.max(180, Math.ceil(maxNameLength * approxFontCharWidth) + padding);

  // Set column width dynamically
  this.gridApi.setColumnWidths([
    { key: 'profileName', newWidth: calculatedWidth }
  ]);
}

// Method 2: Enable Header Text Wrapping (Responsive Fix)
//If you want to preserve tighter column widths without truncating text, enable header wrapping directly on those columns (or in your defaultColDef):

{ 
  headerName: 'Customer Lifecycle Status', 
  field: 'lifecycle', 
  width: 190, 
  wrapHeaderText: true, 
  autoHeaderHeight: true 
},

{ 
  headerName: 'eDiscovery Project Manager', 
  field: 'eDiscoveryProjectManager', 
  width: 200, 
  wrapHeaderText: true, 
  autoHeaderHeight: true 
},