//2. Quickest Way to See the Exact Line & Full Message
// In the component that renders <AgGridReact> (such as InstructionDetailPage.
// tsx or your grid wrapper component), register the validation module at the top of the file:

import { ModuleRegistry } from 'ag-grid-community';
// Or from '@ag-grid-community/core' / '@ag-grid-community/validation' depending on your package imports
import { ValidationModule } from 'ag-grid-community'; 

ModuleRegistry.registerModules([ValidationModule]);


