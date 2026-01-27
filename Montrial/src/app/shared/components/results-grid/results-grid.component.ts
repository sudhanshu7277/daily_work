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
  public noRowsTemplate = `<span>No results to display. Please perform a search.</span>`;
  public loadingTemplate = `<span class="ag-overlay-loading-center">Searching profiles...</span>`;

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
        if (params.data.isParent) {
          this.toggleRowExpansion(params.data);
        }
      }
    },
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      cellRenderer: (params: any) => {
        if (params.value === 'LEGAL HOLD') {
          return `<div class="status-badge-container">
                    <span class="status-pill-badge">LEGAL HOLD</span>
                  </div>`;
        }
        return `<span>${params.value || 'N/A'}</span>`;
      },
      width: 140 
    },
    { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
    { field: 'lifecycle', headerName: 'Lifecycle', width: 180 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  filterOptions = [
    { id: 'ocifId', label: 'File Net ID' },
    { id: 'status', label: 'Legal Hold Status' },
    { id: 'holdName', label: 'Legal Hold Name' },
    { id: 'lifecycle', label: 'Customer Lifecycle Status' },
    { id: 'role', label: 'Role Type' },
    { id: 'address', label: 'Address' }
  ];

  

  public allMockData = [
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Corporation 2',
      ocifId: '1000-12341',
      status: 'N/A',
      holdName: '',
      lifecycle: 'Active Customer',
      role: 'Owner',
      address: '33 Dundas St W, Toronto, ON M5G 2C3',
      dob: '',
      email: 'contact@corp2.com',
      type: 'entity',
      isParent: true,
      isExpanded: false,
      children: [
        { firstName: 'Role', lastName: 'Player A', legalName: 'Role Player A', ocifId: '1000-12341-A', status: 'N/A', lifecycle: 'Active', role: 'Owner of ABC Ltd', address: '33 Dundas St W, Toronto', isChild: true, type: 'individual', email: 'player.a@corp2.com', dob: '1985-05-20' },
        { firstName: 'Role', lastName: 'Player B', legalName: 'Role Player B', ocifId: '1000-12341-B', status: 'N/A', lifecycle: 'Active', role: 'Signatory', address: '33 Dundas St W, Toronto', isChild: true, type: 'individual', email: 'player.b@corp2.com', dob: '1978-11-12' }
      ]
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Tech Solutions Inc',
      ocifId: '2000-99887',
      status: 'LEGAL HOLD',
      holdName: 'Project Omega',
      lifecycle: 'Active Customer',
      role: 'Entity',
      address: '100 King St W, Toronto, ON',
      dob: '',
      email: 'info@techsolutions.ca',
      type: 'entity',
      isParent: true,
      isExpanded: false,
      children: [
        { firstName: 'John', lastName: 'Executive', legalName: 'John Executive', ocifId: '2000-99887-CEO', status: 'LEGAL HOLD', lifecycle: 'Active', role: 'CEO', address: '100 King St W, Toronto', isChild: true, type: 'individual', email: 'john@techsolutions.ca', dob: '1970-01-01' }
      ]
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '9000-798797',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      dob: '1990-01-15',
      email: 'asha.dhola@example.com',
      type: 'individual'
    },
    {
      firstName: 'Sid',
      lastName: 'Jain',
      legalName: 'Sid Jain',
      ocifId: '1000-03232',
      status: 'LEGAL HOLD',
      holdName: 'Project Beta',
      lifecycle: 'Active',
      role: 'Owner',
      address: '45 Queen St E, Brampton',
      dob: '1989-10-29',
      email: 'sid.jain@example.com',
      type: 'individual'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      legalName: 'Jane Smith',
      ocifId: '4444-112233',
      status: 'N/A',
      holdName: '',
      lifecycle: 'Prospect',
      role: 'Primary',
      address: '123 Bay St, Toronto',
      dob: '1985-12-12',
      email: 'jane.smith@test.com',
      type: 'individual'
    }
  ];

  constructor() {
    this.selectedFilterIds = this.filterOptions.map(opt => opt.id);
  }

  get activeFilters() {
    return this.filterOptions.filter(opt => this.selectedFilterIds.includes(opt.id));
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.syncColumns();
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
  }

  public deselectRow(item: any): void {
    if (!this.gridApi) return;
    this.gridApi.forEachNode(node => {
      if (node.data && node.data.ocifId === item.ocifId) {
        node.setSelected(false);
      }
    });
  }

  public performSearch(criteria: any): void {
    if (!this.gridApi) return;
    this.gridApi.showLoadingOverlay();
  
    setTimeout(() => {
      this.rowData = this.allMockData.filter(item => {
        const matchesFirstName = !criteria.firstName || 
          item.firstName.toLowerCase().includes(criteria.firstName.toLowerCase());
        const matchesLastName = !criteria.lastName || 
          item.lastName.toLowerCase().includes(criteria.lastName.toLowerCase());
        const matchesOcif = !criteria.ocifId || item.ocifId === criteria.ocifId;
        const matchesEmail = !criteria.email || 
          item.email?.toLowerCase() === criteria.email.toLowerCase();
        const matchesDob = !criteria.dob || item.dob === criteria.dob;
  
        return matchesFirstName && matchesLastName && matchesOcif && matchesEmail && matchesDob;
      });
  
      this.gridApi?.setGridOption('rowData', this.rowData);
  
      if (this.rowData.length === 0) {
        this.gridApi?.showNoRowsOverlay();
      } else {
        this.gridApi?.hideOverlay();
        this.syncColumns();
      }
    }, 600);
  }

  onFilterChange() { this.syncColumns(); }

  removeFilter(id: string) {
    this.selectedFilterIds = this.selectedFilterIds.filter(fId => fId !== id);
    this.syncColumns();
  }

  resetFilters() {
    this.selectedFilterIds = this.filterOptions.map(opt => opt.id);
    this.syncColumns();
  }

  syncColumns() {
    if (this.gridApi) {
      this.filterOptions.forEach(opt => {
        this.gridApi.setColumnVisible(opt.id, this.selectedFilterIds.includes(opt.id));
      });
      this.gridApi.sizeColumnsToFit();
    }
  }

  onSelectionChanged() {
    this.selectionChanged.emit(this.gridApi.getSelectedRows());
  }

// UPDATED CODE BELOW
  // results-grid.component.ts

  // Inside your component class
// Ensure the blue separator line is triggered in the grid options
public rowClassRules = {
  // Matches the blue line below expanded records in your design image
  'expanded-parent-row': (params: any) => params.data.isParent && params.data.isExpanded,
  'grid-child-row': (params: any) => params.data.isChild
};


onSelectionChanged() {
  const selectedNodes = this.gridApi.getSelectedNodes();
  
  selectedNodes.forEach(node => {
    if (node.data.isParent && node.data.children) {
      const isParentSelected = !!node.isSelected(); 

      this.gridApi.forEachNode(childNode => {
        // Check if the child belongs to this specific parent
        if (childNode.data.isChild && node.data.children.some((c: any) => c.ocifId === childNode.data.ocifId)) {
          // FIX: Use named parameters or omit the third arg to match AG Grid's type definition
          childNode.setSelected(isParentSelected, false); 
        }
      });
    }
  });

  this.selectionChanged.emit(this.gridApi.getSelectedRows());
}

// Update toggleRowExpansion to ensure selection persists if parent is selected
toggleRowExpansion(parent: any) {
  parent.isExpanded = !parent.isExpanded;
  
  // Check if parent is selected BEFORE re-rendering
  const parentNode = this.gridApi.getRowNode(parent.ocifId);
  const shouldSelectChildren = parentNode ? !!parentNode.isSelected() : false;

  if (parent.isExpanded) {
    const index = this.rowData.indexOf(parent);
    this.rowData.splice(index + 1, 0, ...parent.children);
  } else {
    this.rowData = this.rowData.filter(row => !parent.children.includes(row));
  }
  
  this.gridApi.setGridOption('rowData', [...this.rowData]);

  // If parent was selected, select the newly added children
  if (parent.isExpanded && shouldSelectChildren) {
    this.gridApi.forEachNode(node => {
      if (parent.children.some((c: any) => c.ocifId === node.data.ocifId)) {
        node.setSelected(true);
      }
    });
  }
}
}
