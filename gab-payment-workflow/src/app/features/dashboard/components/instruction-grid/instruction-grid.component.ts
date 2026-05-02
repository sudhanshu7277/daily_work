import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-instruction-grid',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between">
        <h6 class="text-muted fw-bold mb-0">Active Instructions</h6>
        <span class="badge bg-light text-dark border"><i class="lucide-filter me-1"></i> Use column headers to search</span>
      </div>
      <div class="card-body">
        <ag-grid-angular
          style="width: 100%; height: 430px;"
          class="ag-theme-alpine"
          [rowData]="rowData"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [headerHeight]="40"
          [floatingFiltersHeight]="40"
          [rowHeight]="45"
          [pagination]="true"
          [paginationPageSize]="paginationPageSize"
          [paginationPageSizeSelector]="paginationPageSizeSelector"
          (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>
    </div>
  `
})
export class InstructionGridComponent {
  @Input() rowData: any[] = [];
  @Output() rowClicked = new EventEmitter<any>();

  // Pagination Configuration
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 25, 50, 100];

  defaultColDef: ColDef = {
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    resizable: true
  };

  columnDefs: ColDef[] = [
    { field: 'referenceId', headerName: 'Instruction ID', width: 150 },
    { field: 'client', headerName: 'Client Name', flex: 1 },
    { field: 'status', headerName: 'Status', width: 180, 
      cellRenderer: (params: any) => {
        const color = params.value === 'Authorised' ? 'success' : params.value === 'Draft' ? 'secondary' : 'warning';
        return `<span class="badge bg-${color} text-dark border">${params.value}</span>`;
      }
    },
    { field: 'currency', headerName: 'CCY', width: 90 },
    { field: 'amount', headerName: 'Amount', width: 130, filter: 'agNumberColumnFilter', valueFormatter: params => Number(params.value).toLocaleString() },
    { 
      headerName: 'Action', 
      width: 120,
      filter: false,
      cellRenderer: () => `<button class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" style="font-size: 0.75rem;">Review / Edit</button>`,
      onCellClicked: (params) => this.rowClicked.emit(params.data)
    }
  ];

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}




// import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AgGridModule } from 'ag-grid-angular';
// import { ColDef, GridReadyEvent } from 'ag-grid-community';

// @Component({
//   selector: 'app-instruction-grid',
//   standalone: true,
//   imports: [CommonModule, AgGridModule],
//   encapsulation: ViewEncapsulation.None,
//   template: `
//     <div class="card shadow-sm border-0">
//       <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between">
//         <h6 class="text-muted fw-bold mb-0">Active Instructions</h6>
//         <span class="badge bg-light text-dark border"><i class="lucide-filter me-1"></i> Use column headers to search</span>
//       </div>
//       <div class="card-body">
//         <ag-grid-angular
//           style="width: 100%; height: 350px;"
//           class="ag-theme-alpine"
//           [rowData]="rowData"
//           [columnDefs]="columnDefs"
//           [defaultColDef]="defaultColDef"
//           [headerHeight]="40"
//           [floatingFiltersHeight]="40"
//           [rowHeight]="45"
//           (gridReady)="onGridReady($event)">
//         </ag-grid-angular>
//       </div>
//     </div>
//   `
// })
// export class InstructionGridComponent {
//   @Input() rowData: any[] = [];
//   @Output() rowClicked = new EventEmitter<any>();

//   // Enable global filtering for all columns
//   defaultColDef: ColDef = {
//     sortable: true,
//     filter: 'agTextColumnFilter',
//     floatingFilter: true, // Adds the search bar under each column
//     resizable: true
//   };

//   columnDefs: ColDef[] = [
//     { field: 'referenceId', headerName: 'Instruction ID', width: 150 },
//     { field: 'client', headerName: 'Client Name', flex: 1 },
//     { field: 'status', headerName: 'Status', width: 180, 
//       cellRenderer: (params: any) => {
//         const color = params.value === 'Authorised' ? 'success' : params.value === 'Draft' ? 'secondary' : 'warning';
//         return `<span class="badge bg-${color} text-dark border">${params.value}</span>`;
//       }
//     },
//     { field: 'currency', headerName: 'CCY', width: 90 },
//     { field: 'amount', headerName: 'Amount', width: 130, filter: 'agNumberColumnFilter', valueFormatter: params => Number(params.value).toLocaleString() },
//     { 
//       headerName: 'Action', 
//       width: 120,
//       filter: false, // Disable search on action column
//       cellRenderer: () => `<button class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" style="font-size: 0.75rem;">Review / Edit</button>`,
//       onCellClicked: (params) => this.rowClicked.emit(params.data)
//     }
//   ];

//   onGridReady(params: GridReadyEvent) {
//     params.api.sizeColumnsToFit();
//   }
// }
