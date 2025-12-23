// CHECKER COMPONENT WITHOUT MATERIAL DIALOG
// checker/checker.component.ts
import { Component, OnInit } from '@angular/core';
import { ColDef, CellClickedEvent } from 'ag-grid-community';
import { DataService } from '../data.service';

@Component({
  selector: 'app-checker',
  template: `
    <ag-grid-angular
      style="width: 100%; height: 400px;"
      class="ag-theme-alpine custom-grid"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [pagination]="true"
      [paginationPageSize]="10"
      [domLayout]="'autoHeight'"
      (cellClicked)="onCellClicked($event)"
    ></ag-grid-angular>

    <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>Row Details</h2>
        <pre>{{ selectedData | json }}</pre>
        <button (click)="closeModal()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .custom-grid {
      --ag-foreground-color: #333;
      --ag-background-color: #fff;
      --ag-header-background-color: #f0f0f0;
      --ag-odd-row-background-color: #f9f9f9;
      --ag-row-hover-color: #ddeeff;
      --ag-selected-row-background-color: #bbdefb;
      --ag-border-color: #ddd;
      font-family: Arial, sans-serif;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
      width: 80%;
      max-height: 80%;
      overflow: auto;
    }
    .modal-content h2 {
      margin-top: 0;
    }
    .modal-content pre {
      white-space: pre-wrap;
      word-break: break-word;
    }
    .modal-content button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .modal-content button:hover {
      background: #0056b3;
    }
  `]
})
export class CheckerComponent implements OnInit {
  rowData: any[] = [];
  showModal: boolean = false;
  selectedData: any = null;

  columnDefs: ColDef[] = [
    { field: 'securityNumber', headerName: 'Security Number', sortable: true, filter: true },
    { field: 'eventType', headerName: 'Event Type', sortable: true, filter: true },
    { field: 'eventValueDate', headerName: 'Event Value Date', sortable: true, filter: true },
    { field: 'eventRecordDate', headerName: 'Event Record Date', sortable: true, filter: true },
    { field: 'entitlement', headerName: 'Entitlement', sortable: true, filter: true },
    { field: 'paymentType', headerName: 'Payment Type', sortable: true, filter: true },
  ];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getData().subscribe(data => {
      this.rowData = data;
    });
  }

  onCellClicked(event: CellClickedEvent) {
    if (event.colDef.field === 'securityNumber' || event.colDef.field === 'eventType') {
      this.selectedData = event.data;
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedData = null;
  }
}




// // checker/checker.component.ts (unchanged)
// import { Component, OnInit } from '@angular/core';
// import { ApiService } from '../api.service';
// import { ColDef, CellClickedEvent } from 'ag-grid-community';
// import { MatDialog } from '@angular/material/dialog';
// import { RowDetailsDialogComponent } from './row-details-dialog.component';
// import { interval } from 'rxjs';
// import { switchMap } from 'rxjs/operators';

// @Component({
//   selector: 'app-checker',
//   template: `
//     <ag-grid-angular
//       style="width: 100%; height: 400px;"
//       class="ag-theme-alpine"
//       [rowData]="rowData"
//       [columnDefs]="columnDefs"
//       [pagination]="true"
//       [paginationPageSize]="10"
//       [domLayout]="'autoHeight'"
//       (cellClicked)="onCellClicked($event)"
//     ></ag-grid-angular>
//   `,
// })
// export class CheckerComponent implements OnInit {
//   rowData: any[] = [];
//   columnDefs: ColDef[] = [
//     { field: 'securityNumber', headerName: 'Security Number', sortable: true, filter: true },
//     { field: 'eventType', headerName: 'Event Type', sortable: true, filter: true },
//     { field: 'eventValueDate', headerName: 'Event Value Date', sortable: true, filter: true },
//     { field: 'eventRecordDate', headerName: 'Event Record Date', sortable: true, filter: true },
//     { field: 'entitlement', headerName: 'Entitlement', sortable: true, filter: true },
//     { field: 'paymentType', headerName: 'Payment Type', sortable: true, filter: true },
//   ];

//   constructor(private api: ApiService, private dialog: MatDialog) {}

//   ngOnInit() {
//     this.loadData();
//     // Poll every 5 seconds
//     interval(5000).pipe(
//       switchMap(() => this.api.getData())
//     ).subscribe(data => this.rowData = data);
//   }

//   loadData() {
//     this.api.getData().subscribe(data => this.rowData = data);
//   }

//   onCellClicked(event: CellClickedEvent) {
//     if (event.colDef.field === 'securityNumber' || event.colDef.field === 'eventType') {
//       this.dialog.open(RowDetailsDialogComponent, {
//         data: event.data,
//         width: '600px'
//       });
//     }
//   }
// }