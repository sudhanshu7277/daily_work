import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AgGridAngular, MatFormFieldModule, 
    MatSelectModule, MatIconModule, MatButtonModule, TranslateModule
  ],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent {
  @Output() selectionChanged = new EventEmitter<any[]>();
  private gridApi!: GridApi;
  
  rowData: any[] = [];
  selectedFilterIds: any[] = [];

  // Logic to handle design-specific row classes
  public rowClassRules = {
    'expanded-parent-row': (params: any) => params.data.isParent && params.data.isExpanded,
    'last-child-row': (params: any) => {
      if (!params.data.isChild) return false;
      const parent = this.allMockData.find(p => 
        p.children?.some((c: any) => c.ocifId === params.data.ocifId)
      );
      return !!(parent && parent.isExpanded && 
             parent.children[parent.children.length - 1].ocifId === params.data.ocifId);
    }
  };

  columnDefs: ColDef[] = [
    { 
      headerName: '', 
      checkboxSelection: true, 
      headerCheckboxSelection: true, 
      width: 50, 
      pinned: 'left',
      cellRenderer: (params: any) => params.data.isChild ? '' : null 
    },
    { 
      field: 'legalName', 
      headerName: 'Legal Name', 
      width: 320, 
      pinned: 'left', 
      sortable: true,
      cellRenderer: (params: any) => {
        const data = params.data;
        const textClass = data.isChild ? 'grid-child-text' : 'grid-parent-text';
        const carrotHtml = data.isParent ? 
          `<span class="bmo-thin-carrot ${data.isExpanded ? 'up' : 'down'}"></span>` : '';
        
        return `
          <div class="name-cell-wrapper">
            <span class="${textClass}">${params.value}</span>
            ${carrotHtml}
          </div>`;
      },
      onCellClicked: (params: any) => {
        if (params.data.isParent) this.toggleRowExpansion(params.data);
      }
    },
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      cellRenderer: (params: any) => {
        return params.value === 'LEGAL HOLD' ? 
          `<div class="status-badge-container"><span class="status-pill-badge">LEGAL HOLD</span></div>` : 
          `<span style="color: #666;">${params.value || 'N/A'}</span>`;
      },
      width: 130 
    },
    { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
    { field: 'lifecycle', headerName: 'Lifecycle', width: 180 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  // --- Grid Operations ---

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.syncColumns();
  }

  // onSelectionChanged() {
  //   if (this.selectionInProgress || !this.gridApi) return;
  //   this.selectionInProgress = true;

  //   // Logic: Sync children state to match parent state
  //   const allSelectedNodes = this.gridApi.getSelectedNodes();
    
  //   // We iterate through parents to force their children to match
  //   this.gridApi.forEachNode(node => {
  //     if (node.data.isParent && node.data.children) {
  //       const isParentSelected = node.isSelected();
  //       const childrenOcifIds = node.data.children.map((c: any) => c.ocifId);

  //       // Find children currently rendered in the grid and sync selection
  //       this.gridApi.forEachNode(childNode => {
  //         if (childNode.data.isChild && childrenOcifIds.includes(childNode.data.ocifId)) {
  //           if (childNode.isSelected() !== isParentSelected) {
  //             childNode.setSelected(isParentSelected, false);
  //           }
  //         }
  //       });
  //     }
  //   });

  //   this.selectionInProgress = false;
  //   this.selectionChanged.emit(this.gridApi.getSelectedRows());
  // }


private selectionInProgress = false;
  
  // Local track of selected objects to solve the 'never' and undefined errors
  public selectedRowsData: any[] = [];


  onSelectionChanged() {
  if (this.selectionInProgress || !this.gridApi) return;
  this.selectionInProgress = true;

  const selectedNodes = this.gridApi.getSelectedNodes();
  const finalSelectionMap = new Map<string, any>();

  // 1. Process explicit UI selections
  selectedNodes.forEach((node: any) => {
    if (!node.data) return;
    
    finalSelectionMap.set(node.data.ocifId, node.data);

    // If Parent is selected, force-add all children (handles hidden children)
    if (node.data.isParent && node.data.children) {
      node.data.children.forEach((child: any) => {
        finalSelectionMap.set(child.ocifId, child);
      });
    }
  });

  // 2. Handle Deselection Logic (Child-to-Parent and Parent-to-Child)
  this.gridApi.forEachNode((node: any) => {
    if (!node.data) return;

    // A. CHILD DESELECTED: If child is unchecked, uncheck the parent
    if (node.data.isChild && !node.isSelected()) {
      finalSelectionMap.delete(node.data.ocifId);

      const parentNode = this.findParentNode(node);
      if (parentNode && parentNode.isSelected()) {
        parentNode.setSelected(false, false);
        finalSelectionMap.delete(parentNode.data.ocifId);
      }
    }

    // B. PARENT DESELECTED (NEW): If a parent is unchecked, ensure children are unchecked
    if (node.data.isParent && !node.isSelected()) {
      // Remove the parent itself from payload
      finalSelectionMap.delete(node.data.ocifId);

      // Remove all its children from the payload
      if (node.data.children) {
        node.data.children.forEach((c: any) => finalSelectionMap.delete(c.ocifId));
        
        // Uncheck any visible children in the grid visually
        this.gridApi.forEachNode((childNode: any) => {
          if (childNode.data.isChild && node.data.children.some((c: any) => c.ocifId === childNode.data.ocifId)) {
            if (childNode.isSelected()) {
              childNode.setSelected(false, false);
            }
          }
        });
      }
    }
  });

  // 3. Finalize Source of Truth
  this.selectedRowsData = Array.from(finalSelectionMap.values());
  this.selectionInProgress = false;

  this.selectionChanged.emit(this.selectedRowsData);
}

  toggleRowExpansion(parent: any) {
    parent.isExpanded = !parent.isExpanded;
    
    // Manage RowData array
    if (parent.isExpanded) {
      const index = this.rowData.indexOf(parent);
      this.rowData.splice(index + 1, 0, ...parent.children);
    } else {
      this.rowData = this.rowData.filter(row => !parent.children.includes(row));
    }
    
    this.gridApi.setGridOption('rowData', [...this.rowData]);

    // PERSISTENCE: Re-apply checkmarks from selectedRowsData
    this.gridApi.forEachNode((node: any) => {
      const isStillSelected = this.selectedRowsData.some(s => s.ocifId === node.data.ocifId);
      if (isStillSelected) {
        //setSelected(true, true) would trigger onSelectionChanged, 
        //but our flag selectionInProgress handles it.
        node.setSelected(true, false);
      }
    });
  }

 private findParentNode(childNode: any): any {
    let foundParent = null;
    this.gridApi.forEachNode((node: any) => {
      if (node.data?.isParent && node.data.children?.some((c: any) => c.ocifId === childNode.data.ocifId)) {
        foundParent = node;
      }
    });
    return foundParent;
  }
  // ... rest of your search and filter methods ...
}