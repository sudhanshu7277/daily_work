import { Component, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent {
  @Output() selectionChanged = new EventEmitter<any[]>();
  private gridApi!: GridApi;
  isDropdownOpen = false;
  rowData: any[] = [];
  public noRowsTemplate = `<span>No results to display. Please perform a search.</span>`;
  public loadingTemplate = `<span class="ag-overlay-loading-center">Searching profiles...</span>`;

  private allData = [
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

  columnDefs: ColDef[] = [
    { headerName: '', checkboxSelection: true, headerCheckboxSelection: true, width: 50, pinned: 'left' },
    { field: 'legalName', headerName: 'Legal Name', width: 150, pinned: 'left' },
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: (p: any) => `<span class="status-pill-badge">LEGAL HOLD</span>`
    },
    { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
    { field: 'lifecycle', headerName: 'Lifecycle' },
    { field: 'role', headerName: 'Role' },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  filterOptions = [
    { id: 'ocifId', label: 'File Net ID', selected: true },
    { id: 'status', label: 'Legal Hold Status', selected: true },
    { id: 'holdName', label: 'Legal Hold Name', selected: true },
    { id: 'lifecycle', label: 'Customer Lifecycle Status', selected: true },
    { id: 'role', label: 'Role Type', selected: false },
    { id: 'address', label: 'Address', selected: false }
  ];

  public performSearch(criteria: any): void {
    if (!this.gridApi) return;

    this.gridApi.showLoadingOverlay();

    setTimeout(() => {
      const fName = (criteria.firstName || '').toLowerCase().trim();
      const lName = (criteria.lastName || '').toLowerCase().trim();
      const type = criteria.type;

      if (fName && lName) {
        this.rowData = this.allData.filter(item => {
          // These properties now exist on the type
          const matchesFirst = item.firstName.toLowerCase().includes(fName);
          const matchesLast = item.lastName.toLowerCase().includes(lName);
          const matchesType = item.type === type;

          return matchesFirst && matchesLast && matchesType;
        });
      } else {
        this.rowData = [];
      }

      this.gridApi.setGridOption('rowData', this.rowData);

      if (this.rowData.length === 0) {
        this.gridApi.showNoRowsOverlay();
      }
    }, 600);
  }

  public clearSearch(): void {
    this.rowData = [];
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', []);
      this.gridApi.deselectAll();
      this.gridApi.showNoRowsOverlay();
    }
  }


  syncColumns() {
    if (this.gridApi) {
      this.filterOptions.forEach(opt => {
        this.gridApi.setColumnVisible(opt.id, opt.selected);
      });
      this.gridApi.sizeColumnsToFit();
    }
  }
  toggleOption(option: any) {
    option.selected = !option.selected;
    this.syncColumns();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setGridOption('rowData', this.rowData);
  }

  onSelectionChanged() {
    this.selectionChanged.emit(this.gridApi.getSelectedRows());
  }

  public deselectRow(item: any): void {
    this.gridApi?.forEachNode(node => {
      if (node.data.ocifId === item.ocifId) {
        node.setSelected(false);
      }
    });
  }
};
