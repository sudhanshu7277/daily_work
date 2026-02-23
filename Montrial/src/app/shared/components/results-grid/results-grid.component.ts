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

private selectionInProgress = false;
  public selectedRowsData: any[] = [];


onSelectionChanged() {
  if (this.selectionInProgress || !this.gridApi) return;
  this.selectionInProgress = true;

  const selectedNodes = this.gridApi.getSelectedNodes();
  const finalSelectionMap = new Map<string, any>();
  selectedNodes.forEach((node: any) => {
    if (!node.data) return;
    finalSelectionMap.set(node.data.ocifId, node.data);
  });

  this.gridApi.forEachNode((node: any) => {
    if (!node.data) return;
    const wasParentPreviouslySelected = this.selectedRowsData.some(s => s.ocifId === node.data.ocifId);
    
    if (node.data.isParent && node.isSelected() && !wasParentPreviouslySelected) {
      const childIds = node.data.children?.map((c: any) => c.ocifId) || [];
      node.data.children?.forEach((c: any) => finalSelectionMap.set(c.ocifId, c));
      this.gridApi.forEachNode((childNode: any) => {
        if (childNode.data.isChild && childIds.includes(childNode.data.ocifId)) {
          childNode.setSelected(true, false);
        }
      });
    }

    if (node.data.isParent && !node.isSelected() && wasParentPreviouslySelected) {
      const childIds = node.data.children?.map((c: any) => c.ocifId) || [];
      finalSelectionMap.delete(node.data.ocifId);
      
      node.data.children?.forEach((c: any) => finalSelectionMap.delete(c.ocifId));

      this.gridApi.forEachNode((childNode: any) => {
        if (childNode.data.isChild && childIds.includes(childNode.data.ocifId)) {
          childNode.setSelected(false, false);
        }
      });
    }

    if (node.data.isChild && !node.isSelected()) {
      finalSelectionMap.delete(node.data.ocifId);
      const parentNode = this.findParentNode(node);
      if (parentNode && parentNode.isSelected()) {
        parentNode.setSelected(false, false);
        finalSelectionMap.delete(parentNode.data.ocifId);
      }
    }
  });

  this.selectedRowsData = Array.from(finalSelectionMap.values());
  this.selectionInProgress = false;
  this.selectionChanged.emit(this.selectedRowsData);
}
  toggleRowExpansion(parent: any) {
    parent.isExpanded = !parent.isExpanded;
    
    if (parent.isExpanded) {
      const index = this.rowData.indexOf(parent);
      this.rowData.splice(index + 1, 0, ...parent.children);
    } else {
      this.rowData = this.rowData.filter(row => !parent.children.includes(row));
    }
    
    this.gridApi.setGridOption('rowData', [...this.rowData]);
    this.gridApi.forEachNode((node: any) => {
      const shouldBeSelected = this.selectedRowsData.some(s => s.ocifId === node.data.ocifId);
      if (shouldBeSelected) {
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
}

// NEW CODE WITH STORE

import { Component, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

// Store & Service Imports
import { Store } from '@ngrx/store';
import { LegalHoldActions } from '../../store/legal-hold/legal-hold.actions';
import { LegalHoldService } from '../../core/services/legal-hold.service';

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
  private store = inject(Store);
  private legalService = inject(LegalHoldService);

  @Output() selectionChanged = new EventEmitter<any[]>();

  // 1. INPUT: Triggered by the parent shell when search criteria is submitted
  @Input() set searchCriteria(payload: any) {
    if (payload) {
      this.fetchData(payload);
    }
  }

  private gridApi!: GridApi;
  private selectionInProgress = false;
  
  public rowData: any[] = [];
  public selectedRowsData: any[] = [];

  // --- API / CRUD Logic ---

  fetchData(payload: any) {
    this.store.dispatch(LegalHoldActions.loadProfiles({ query: payload }));
    
    // Direct API call mapping to DummyJSON
    this.legalService.getProfiles(payload).subscribe({
      next: (profiles) => {
        this.rowData = profiles;
        this.gridApi?.setGridOption('rowData', this.rowData);
        this.store.dispatch(LegalHoldActions.loadSuccess({ profiles }));
      },
      error: (err) => this.store.dispatch(LegalHoldActions.loadFailure({ error: err.message }))
    });
  }

  // --- Grid Visual Logic ---

  public rowClassRules = {
    'expanded-parent-row': (params: any) => params.data.isParent && params.data.isExpanded,
    'last-child-row': (params: any) => {
      if (!params.data.isChild) return false;
      const parent = this.rowData.find(p => 
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
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  // --- Selection & Expansion Logic ---

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSelectionChanged() {
    if (this.selectionInProgress || !this.gridApi) return;
    this.selectionInProgress = true;

    const selectedNodes = this.gridApi.getSelectedNodes();
    const finalMap = new Map<string, any>();

    selectedNodes.forEach((node: any) => {
      if (!node.data) return;
      finalMap.set(node.data.ocifId, node.data);
    });

    this.gridApi.forEachNode((node: any) => {
      if (!node.data) return;
      const wasSelected = this.selectedRowsData.some(s => s.ocifId === node.data.ocifId);

      // CASE A: NEW PARENT SELECTION
      if (node.data.isParent && node.isSelected() && !wasSelected) {
        node.data.children?.forEach((c: any) => finalMap.set(c.ocifId, c));
        this.syncVisibleChildren(node, true);
      }
      // CASE B: PARENT DESELECTED
      else if (node.data.isParent && !node.isSelected() && wasSelected) {
        node.data.children?.forEach((c: any) => finalMap.delete(c.ocifId));
        this.syncVisibleChildren(node, false);
      }
      // CASE C: INDIVIDUAL CHILD DESELECTED
      else if (node.data.isChild && !node.isSelected()) {
        finalMap.delete(node.data.ocifId);
        const parentNode = this.findParentNode(node);
        if (parentNode && parentNode.isSelected()) {
          parentNode.setSelected(false, false);
          finalMap.delete(parentNode.data.ocifId);
        }
      }
    });

    this.selectedRowsData = Array.from(finalMap.values());
    this.selectionInProgress = false;

    // Dispatch to Store & Emit to Selection Panel
    this.store.dispatch(LegalHoldActions.updateSelection({ 
      selectedProfiles: this.selectedRowsData 
    }));
    this.selectionChanged.emit(this.selectedRowsData);
  }

  toggleRowExpansion(parent: any) {
    parent.isExpanded = !parent.isExpanded;
    
    if (parent.isExpanded) {
      const index = this.rowData.indexOf(parent);
      this.rowData.splice(index + 1, 0, ...parent.children);
    } else {
      this.rowData = this.rowData.filter(row => !parent.children.includes(row));
    }
    
    this.gridApi.setGridOption('rowData', [...this.rowData]);

    // Re-hydrate Selection checkmarks
    this.gridApi.forEachNode((node: any) => {
      const active = this.selectedRowsData.some(s => s.ocifId === node.data.ocifId);
      if (active) node.setSelected(true, false);
    });
  }

  private syncVisibleChildren(parentNode: any, state: boolean) {
    const ids = parentNode.data.children?.map((c: any) => c.ocifId) || [];
    this.gridApi.forEachNode((n: any) => {
      if (n.data.isChild && ids.includes(n.data.ocifId)) {
        n.setSelected(state, false);
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
}