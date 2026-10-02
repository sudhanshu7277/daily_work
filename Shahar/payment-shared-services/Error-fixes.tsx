//Option B: Or use AllCommunityModule (Easiest one-liner)
// If your ag-grid-community version supports bundle modules:

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

<AgGridReact
  theme="legacy"
  rowData={rowsWithDynamicStatus}