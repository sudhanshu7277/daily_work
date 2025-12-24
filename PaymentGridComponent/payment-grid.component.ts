import { Component, Input } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, RowDoubleClickedEvent } from 'ag-grid-community';

@Component({
  selector: 'app-payment-grid',
  standalone: true,
  templateUrl: './payment-grid.component.html',
  styleUrls: ['./payment-grid.component.scss']
})
export class PaymentGridComponent {
  @Input() title: string = 'Payments';
  @Input() rowData: any[] = []; // Dynamic row data
  @Input() columnDefs: ColDef[] = []; // Dynamic columns

  @Input() authoriseButtonText: string = 'Authorise Selected';
  @Input() rejectButtonText: string = 'Reject Selected';
  @Input() exportButtonText: string = 'Export to Excel';

  gridApi!: GridApi;

  selectedRow: any = null;
  showModal = false;

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent) {
    const colId = event.column.getColId();
    // Open modal only if double-click on first or second column
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