import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

// AG Grid v33 Module Registration
// import { ModuleRegistry, AllCommunityModule, provideGlobalGridOptions } from 'ag-grid-community';
import { provideGlobalGridOptions } from 'ag-grid-community';
import { AppComponent } from './app/app..component';

// Register all community features
// ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * FIX: We use 'rowSelection' as the key to satisfy the TS interface,
 * but pass the v33 SelectionOptions object as the value.
 */
provideGlobalGridOptions({ 
  // theme: 'legacy',
  rowSelection: {
    mode: 'multiRow',
    headerCheckbox: true,
    selectAll: 'filtered'
  } as any // Use 'as any' here if the GridOptions type is lagging behind the API
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));