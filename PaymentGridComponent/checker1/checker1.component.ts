import { Component } from '@angular/core';
import { PaymentGridComponent } from '../payment-grid/payment-grid.component';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [PaymentGridComponent],
  template: `
    <div class="checker-container">
      <h2>Authorise - Checker 1</h2>
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
export class Checker1Component {
  columnDefs: ColDef[] = [
    { headerName: '', checkboxSelection: true, width: 50 },
    { headerName: 'Security Id', field: 'securityId', width: 130 },
    { headerName: 'Security Name', field: 'securityName', width: 200 },
    { headerName: 'Beneficiary', field: 'beneficiaryName', width: 180 },
    { headerName: 'Amount', field: 'netPaymentAmount', width: 140 },
    { headerName: 'Currency', field: 'paymentCcy', width: 100 },
    { headerName: 'Status', field: 'paymentStatus', width: 130 }
  ];

  checker1Data = [
    { securityId: 'SEC001', securityName: 'Bond A', beneficiaryName: 'Bank X', netPaymentAmount: 150000, paymentCcy: 'USD', paymentStatus: 'Pending' },
    { securityId: 'SEC002', securityName: 'Fund B', beneficiaryName: 'Corp Y', netPaymentAmount: 85000, paymentCcy: 'EUR', paymentStatus: 'Review' }
    // Add more
  ];
}