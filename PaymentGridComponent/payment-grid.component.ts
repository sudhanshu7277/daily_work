// payment-grid.component.ts

import { Component, Input } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellDoubleClickedEvent } from 'ag-grid-community';
import { TitlecasePipe } from '../../pipes/titlecase.pipe'; // if using

@Component({
  selector: 'app-payment-grid',
  standalone: true,
  imports: [AgGridModule, TitlecasePipe], // if using pipe
  templateUrl: './payment-grid.component.html',
  styleUrls: ['./payment-grid.component.scss']
})
export class PaymentGridComponent {
  @Input() title: string = 'Payments';
  @Input() rowData: any[] = [];
  @Input() columnDefs: ColDef[] = [];

  @Input() authoriseButtonText: string = 'Authorise Selected';
  @Input() rejectButtonText: string = 'Reject Selected';
  @Input() exportButtonText: string = 'Export to Excel';

  gridApi!: GridApi;

  selectedRow: any = null;
  showModal = false;

  // Enable filters, sorting, resizing
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true, // adds filter input below header
    flex: 1, // auto-size columns
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onCellDoubleClicked(event: CellDoubleClickedEvent) {
    const colId = event.column.getColId();
    // Check first or second data column (skip checkbox column)
    if (colId === this.columnDefs[1]?.field || colId === this.columnDefs[2]?.field) {
      this.selectedRow = event.data;
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedRow = null;
  }
}















// import { Component, Input } from '@angular/core';
// import { ColDef, GridApi, GridReadyEvent, RowDoubleClickedEvent } from 'ag-grid-community';
// import { CellDoubleClickedEvent } from 'ag-grid-community';

// @Component({
//   selector: 'app-payment-grid',
//   standalone: true,
//   templateUrl: './payment-grid.component.html',
//   styleUrls: ['./payment-grid.component.scss']
// })
// export class PaymentGridComponent {
//   @Input() title: string = 'Payments';
//   @Input() rowData: any[] = []; // Dynamic row data
//   @Input() columnDefs: ColDef[] = []; // Dynamic columns

//   @Input() authoriseButtonText: string = 'Authorise Selected';
//   @Input() rejectButtonText: string = 'Reject Selected';
//   @Input() exportButtonText: string = 'Export to Excel';

//   gridApi!: GridApi;

//   selectedRow: any = null;
//   showModal = false;

//   onGridReady(params: GridReadyEvent) {
//     this.gridApi = params.api;
//     params.api.sizeColumnsToFit();
//   }

//   onRowDoubleClicked(event: RowDoubleClickedEvent) {
//     const column = event.column;
//     if (!column) return; // safety check
  
//     const colId = column.getColId();
//     // Assuming your first column is checkbox (index 0), check columns 1 or 2
//     if (colId === this.columnDefs[1]?.field || colId === this.columnDefs[2]?.field) {
//       this.selectedRow = event.data;
//       this.showModal = true;
//     }
//   }


// onCellDoubleClicked(event: CellDoubleClickedEvent) {
//   const colId = event.column.getColId();
//   if (colId === this.columnDefs[1]?.field || colId === this.columnDefs[2]?.field) {
//     this.selectedRow = event.data;
//     this.showModal = true;
//   }
// }

//   closeModal() {
//     this.showModal = false;
//     this.selectedRow = null;
//   }
// }