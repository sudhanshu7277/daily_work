import { Component } from '@angular/core';
import { PaymentGridComponent } from '../payment-grid/payment-grid.component';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-checker2',
  standalone: true,
  imports: [PaymentGridComponent],
  template: `
    <div class="checker-container">
      <h2>Authorise - Checker 2</h2>
      <app-payment-grid
        [title]="'Pending Authorisations'"
        [rowData]="checker1Data"
        [columnDefs]="columnDefs"
        authoriseButtonText="Approve for Checker 1"
        rejectButtonText="Reject for Checker 1">
      </app-payment-grid>
    </div>
  `,
  styles: [`
    .checker-container { padding: 20px; }
    h2 { color: #0056b3; margin-bottom: 16px; }
  `]
})
export class Checker2Component {
    columnDefs: ColDef[] = [
        { headerName: '', checkboxSelection: true, width: 50 },
        { headerName: 'Ref No', field: 'refNo', width: 120 },
        { headerName: 'Client', field: 'client', width: 200 },
        { headerName: 'Amount', field: 'amount', width: 140 },
        { headerName: 'Currency', field: 'ccy', width: 100 },
        { headerName: 'Status', field: 'status', width: 130 }
      ];

      checker2Data = [
        { refNo: 'REF001', client: 'Client A', amount: 320000, ccy: 'GBP', status: 'Awaiting' },
        { refNo: 'REF002', client: 'Client B', amount: 520000, ccy: 'USD', status: 'Awaiting' },
        // ...
      ];
}