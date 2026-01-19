

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AgGridAngular, MatFormFieldModule, 
    MatSelectModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent {
  @Output() selectionChanged = new EventEmitter<any[]>();
  private gridApi!: GridApi;
  
  rowData: any[] = [];
  public noRowsTemplate = `<span>No results to display. Please perform a search.</span>`;
  public loadingTemplate = `<span class="ag-overlay-loading-center">Searching profiles...</span>`;

  columnDefs: ColDef[] = [
    { headerName: '', checkboxSelection: true, headerCheckboxSelection: true, width: 50, pinned: 'left' },
    { field: 'legalName', headerName: 'Legal Name', width: 160, pinned: 'left', sortable: true },
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      cellRenderer: () => `<span class="status-pill-badge">LEGAL HOLD</span>`,
      width: 130 
    },
    { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
    { field: 'lifecycle', headerName: 'Lifecycle', width: 180 },
    { field: 'role', headerName: 'Role', width: 120 },
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

  selectedFilterIds: any[] = this.filterOptions.map(opt => opt.id);
  private allMockData = [
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '3223-545454',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
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
      type: 'individual'
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '1000-12341',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '7000-0898989',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '6000-434343',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '5000-98083',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '4000-34343',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '3000-798798',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Asha',
      lastName: 'Dhola',
      legalName: 'Asha Dhola',
      ocifId: '2000-12341',
      status: 'LEGAL HOLD',
      holdName: 'Project Alpha',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
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
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Sid',
      lastName: 'Jain',
      legalName: 'Sid Jain',
      ocifId: '1000-12342',
      status: 'LEGAL HOLD',
      holdName: 'Project Beta',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Sid',
      lastName: 'Jain',
      legalName: 'Sid Jain',
      ocifId: '1000-323232',
      status: 'LEGAL HOLD',
      holdName: 'Project Beta',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Sid',
      lastName: 'Jain',
      legalName: 'Sid Jain',
      ocifId: '1000-98080',
      status: 'LEGAL HOLD',
      holdName: 'Project Beta',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Sid',
      lastName: 'Jain',
      legalName: 'Sid Jain',
      ocifId: '1000-9889798',
      status: 'LEGAL HOLD',
      holdName: 'Project Beta',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Sid',
      lastName: 'Jain',
      legalName: 'Sid Jain',
      ocifId: '1000-32222',
      status: 'LEGAL HOLD',
      holdName: 'Project Beta',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Harsha',
      lastName: 'Vardhana',
      legalName: 'Harsha Vardhana',
      ocifId: '1000-87877',
      status: 'LEGAL HOLD',
      holdName: 'Legal Hold Re Pl...',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Harsha',
      lastName: 'Vardhana',
      legalName: 'Harsha Vardhana',
      ocifId: '1000-323232',
      status: 'LEGAL HOLD',
      holdName: 'Legal Hold Re Pl...',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Harsha',
      lastName: 'Vardhana',
      legalName: 'Harsha Vardhana',
      ocifId: '1000-767676',
      status: 'LEGAL HOLD',
      holdName: 'Legal Hold Re Pl...',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    },
    {
      firstName: 'Harsha',
      lastName: 'Vardhana',
      legalName: 'Harsha Vardhana',
      ocifId: '1000-66565',
      status: 'LEGAL HOLD',
      holdName: 'Legal Hold Re Pl...',
      lifecycle: 'Active',
      role: 'Owner',
      address: '33 Dundas St W, Toronto',
      type: 'individual'
    }
  ];

  get activeFilters() {
    return this.filterOptions.filter(opt => this.selectedFilterIds.includes(opt.id));
  }

  public performSearch(criteria: any): void {
    this.gridApi?.showLoadingOverlay();
    this.rowData = [...this.allMockData];
    this.gridApi?.setGridOption('rowData', this.rowData);
    this.syncColumns(); 
  }

  onFilterChange() {
    this.syncColumns();
  }

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

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.syncColumns();
  }

  onSelectionChanged() {
    this.selectionChanged.emit(this.gridApi.getSelectedRows());
  }

  public deselectRow(item: any): void {
    this.gridApi?.forEachNode(node => {
      if (node.data.ocifId === item.ocifId) node.setSelected(false);
    });
  }
}