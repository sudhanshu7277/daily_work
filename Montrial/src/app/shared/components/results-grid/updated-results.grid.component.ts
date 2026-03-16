import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ColDef, GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-results-grid',
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent implements OnInit {
  private gridApi!: GridApi;
  private isSyncing = false;
  public rowData: any[] = [];
  
  // This should be your source tree from LegalHoldDataService
  public allMockData: any[] = []; 

  constructor(private sanitizer: DomSanitizer) {}

  public columnDefs: ColDef[] = [
    { 
      headerName: '', 
      checkboxSelection: true, 
      headerCheckboxSelection: true, 
      width: 50, 
      pinned: 'left',
      // Figma: Hide checkbox on child rows
      cellRenderer: (params: any) => params.data.level > 0 ? '' : null 
    },
    // {
    //   field: 'profileName',
    //   headerName: 'Profile Name',
    //   width: 400,
    //   pinned: 'left',
    //   cellRenderer: (params: any) => this.profileNameRenderer(params)
    // },

    // Inside your columnDefs for 'profileName'
{
  field: 'profileName',
  headerName: 'Profile Name',
  cellRenderer: (params: any) => {
    if (!params.data) return '';

    const { level, isParent, isExpanded, isChild } = params.data;
    const indent = (level || 0) * 24;
    
    // Create Depth Lines
    let depthLines = '';
    for (let i = 1; i <= (level || 0); i++) {
      depthLines += `<div class="depth-line" style="left: ${(i * 24) - 12}px; position: absolute; top: 0; bottom: 0; width: 1px; background: #E0E0E0;"></div>`;
    }

    const chevronClass = isExpanded ? 'up' : 'down';
    const chevron = isParent ? `<span class="bmo-thin-carrot ${chevronClass}"></span>` : '';
    const textClass = isChild ? 'grid-child-text' : 'grid-parent-text';

    // RETURN A PLAIN STRING. AG Grid will turn this into a Node safely.
    return `
      <div class="name-cell-wrapper" style="padding-left: ${indent}px; position: relative; display: flex; align-items: center;">
        ${depthLines}
        <span class="${textClass}">${params.value || ''}</span>
        ${chevron}
      </div>
    `;
  }
}
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    { field: 'legalHoldStatus', headerName: 'Legal Hold Status', width: 200 },
    { field: 'lifecycle', headerName: 'Customer Lifecycle Status', width: 200 },
    { field: 'role', headerName: 'Role Type', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  ngOnInit() {
    this.refreshGrid();
  }

  // --- RECURSIVE ENGINE: Flattens the Tree for Pagination ---
  // private flatten(data: any[]): any[] {
  //   let result: any[] = [];
  //   data.forEach(item => {
  //     result.push(item);
  //     // Recursively add children only if parent is expanded
  //     if (item.isParent && item.isExpanded && item.children && item.children.length > 0) {
  //       result = [...result, ...this.flatten(item.children)];
  //     }
  //   });
  //   return result;
  // }

  private flatten(data: any[]): any[] {
  if (!data) return [];
  let result: any[] = [];
  
  data.forEach(item => {
    result.push(item);
    if (item.isParent && item.isExpanded && item.children && item.children.length > 0) {
      result = [...result, ...this.flatten(item.children)];
    }
  });
  return result;
}

  // public refreshGrid() {
  //   this.rowData = [...this.flatten(this.allMockData)];
  //   if (this.gridApi) {
  //     // Latest AG Grid uses setGridOption to maintain reactivity
  //     this.gridApi.setGridOption('rowData', this.rowData);
  //   }
  // }

public refreshGrid() {
  // Ensure masterData is what you're actually using (based on your service)
  const sourceData = this.allMockData || []; 
  this.rowData = [...this.flatten(sourceData)];
  
  if (this.gridApi) {
    // Use the modern API method to avoid the deprecated setRowData
    this.gridApi.setGridOption('rowData', this.rowData);
  }
}

  // --- FIGMA UI: Sanitized Indentation + Vertical Depth Lines ---
  private profileNameRenderer(params: any): SafeHtml {
    const { level, isParent, isExpanded, isChild } = params.data;
    const indent = (level || 0) * 24; // 24px per level
    
    // Create the vertical connector lines for nested levels
    let depthLines = '';
    for (let i = 1; i <= (level || 0); i++) {
      depthLines += `<div class="depth-line" style="left: ${(i * 24) - 12}px"></div>`;
    }

    const chevron = isParent 
      ? `<span class="bmo-thin-carrot ${isExpanded ? 'up' : 'down'}"></span>` 
      : '';

    const html = `
      <div class="name-cell-wrapper" style="padding-left: ${indent}px">
        ${depthLines}
        <span class="${isChild ? 'grid-child-text' : 'grid-parent-text'}">${params.value}</span>
        ${chevron}
      </div>
    `;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // --- SELECTION: Recursive sync across all levels ---
  onSelectionChanged() {
    if (this.isSyncing || !this.gridApi) return;
    this.isSyncing = true;

    this.gridApi.forEachNode((node: RowNode) => {
      if (node.data.children) {
        const childNodes = node.data.children
          .map((c: any) => this.gridApi.getRowNode(c.ocifId))
          .filter((n: any) => n != null);

        if (childNodes.length === 0) return;
        const allSelected = childNodes.every(n => n.isSelected());

        // Select children if parent is selected, or vice versa
        if (node.isSelected() && !allSelected) {
          childNodes.forEach(n => n.setSelected(true, false));
        } else if (allSelected && !node.isSelected()) {
          node.setSelected(true, false);
        }
      }
    });
    this.isSyncing = false;
  }

  // --- THE BLUE SANDWICH CLASS RULES ---
  // public getRowClass = (params: any) => {
  //   const { level, isParent, isExpanded, isChild } = params.data;
  //   const classes = [];

  //   // Expanded Level 0 gets the Blue Header
  //   if (level === 0 && isParent && isExpanded) classes.push('blue-sandwich-parent');
    
  //   // All levels > 0 are child rows (White background)
  //   if (level > 0) classes.push('sandwich-child-row');

  //   // Closure Logic: Draw 2px bottom border if this is the last item in the cluster
  //   const nextNode = this.gridApi?.getDisplayedRowAtIndex(params.node.rowIndex + 1);
  //   const isEndOfCluster = level > 0 && (!nextNode || nextNode.data.level === 0 || nextNode.data.level < level);

  //   if (isEndOfCluster) {
  //     classes.push('sandwich-bottom-border');
  //   }

  //   return classes.join(' ');
  // };

  public getRowClass = (params: any) => {
  if (!params.data) return '';
  const classes = [];
  const { level, isParent, isExpanded, isChild } = params.data;

  // Blue Top
  if (level === 0 && isParent && isExpanded) classes.push('blue-sandwich-parent');
  
  // White Body
  if (level > 0) classes.push('sandwich-child-row');

  // Blue Bottom Closure
  const nextNode = params.api.getDisplayedRowAtIndex(params.node.rowIndex + 1);
  const isLastInCluster = level > 0 && (!nextNode || nextNode.data.level === 0 || nextNode.data.level < level);

  if (isLastInCluster) classes.push('sandwich-bottom-border');

  return classes.join(' ');
};

  onCellClicked(params: any) {
    if (params.colDef.field === 'profileName' && params.data.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.refreshGrid();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.refreshGrid();
  }
}

// scss code below

::ng-deep .bmo-grid {
  /* FIGMA: 2px Dark Blue Top Border for Parent */
  .ag-row.blue-sandwich-parent {
    background-color: #E8F4FD !important;
    border-top: 2px solid #004c97 !important;
    z-index: 10;
  }

  /* FIGMA: Child Rows & Vertical Guide Lines */
  .ag-row.sandwich-child-row {
    background-color: #ffffff !important;
    border-top: none !important;

    .name-cell-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .depth-line {
        position: absolute;
        top: 0; bottom: 0; width: 1px;
        background-color: #E0E0E0; /* Subtle grey vertical line */
      }
    }
  }

  /* FIGMA: 2px Dark Blue Bottom Border to close the cluster */
  .ag-row.sandwich-bottom-border {
    border-bottom: 2px solid #004c97 !important;
  }

  /* FIGMA: Thin Dark Blue Carrot */
  .bmo-thin-carrot {
    width: 8px; height: 8px;
    border-top: 1.5px solid #004c97;
    border-right: 1.5px solid #004c97;
    display: inline-block;
    transition: 0.2s ease;
    margin-left: 10px;
    &.down { transform: rotate(135deg); }
    &.up { transform: rotate(-45deg); margin-top: 5px; }
  }

  /* Checkbox styling */
  .ag-checkbox-input-wrapper.ag-checked::after { color: #004c97 !important; }
}

// html code below

<div class="grid-container">
  <ag-grid-angular
    style="width: 100%; height: 600px;"
    class="ag-theme-alpine bmo-grid"
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [getRowClass]="getRowClass"
    [pagination]="true"
    [paginationPageSize]="20"
    [rowSelection]="'multiple'"
    [suppressRowClickSelection]="true"
    (selectionChanged)="onSelectionChanged()"
    (cellClicked)="onCellClicked($event)"
    (gridReady)="onGridReady($event)">
  </ag-grid-angular>
</div>