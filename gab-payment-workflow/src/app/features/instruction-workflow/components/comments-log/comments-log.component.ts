import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { InstructionComment } from '../../../../core/models/instruction.model';

@Component({
  selector: 'app-comments-log',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="bg-white p-4 shadow-sm border rounded mb-4">
      <fieldset class="custom-fieldset border-0 pb-0">
        
        <div class="border-bottom pb-2 mb-3">
          <legend class="custom-legend m-0 border-0">Comments / Audit Log</legend>
        </div>

        <ag-grid-angular
          style="width: 100%; height: 320px;"
          class="ag-theme-alpine"
          [rowData]="comments"
          [columnDefs]="columnDefs"
          [headerHeight]="40"
          [rowHeight]="45"
          [pagination]="true"
          [paginationPageSize]="5"
          [paginationPageSizeSelector]="[5, 10, 20]"
          (gridReady)="onGridReady($event)">
        </ag-grid-angular>

      </fieldset>
    </div>
  `
})
export class CommentsLogComponent {
  @Input() comments: InstructionComment[] = [];

  columnDefs: ColDef[] = [
    { field: 'commentType', headerName: 'Comment Type', flex: 1, sortable: true, filter: true },
    { field: 'comment', headerName: 'Comments', flex: 3, wrapText: true, autoHeight: true },
    { 
      field: 'commentedBy', 
      headerName: 'Commented By', 
      flex: 1.5,
      cellRenderer: (params: any) => {
        const data = params.data;
        if (!data) return '';
        return `
          <div class="lh-sm py-1">
            <span class="d-block fw-bold text-dark">${data.commentedBy}</span>
            <span class="d-block text-muted small">${data.commentedOn}</span>
          </div>
        `;
      }
    }
  ];

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}







// import { Component, Input, ViewEncapsulation } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AgGridModule } from 'ag-grid-angular';
// import { ColDef, GridReadyEvent } from 'ag-grid-community';
// import { InstructionComment } from '../../../../core/models/instruction.model';

// @Component({
//   selector: 'app-comments-log',
//   standalone: true,
//   imports: [CommonModule, AgGridModule],
//   encapsulation: ViewEncapsulation.None,
//   template: `
//     <div class="bg-white p-4 shadow-sm border rounded mb-4">
//       <fieldset class="custom-fieldset border-0 pb-0">
        
//         <div class="border-bottom pb-2 mb-3">
//           <legend class="custom-legend m-0 border-0">Comments</legend>
//         </div>

//         <ag-grid-angular
//           style="width: 100%; height: 200px;"
//           class="ag-theme-alpine"
//           [rowData]="comments"
//           [columnDefs]="columnDefs"
//           [headerHeight]="40"
//           [rowHeight]="45"
//           (gridReady)="onGridReady($event)">
//         </ag-grid-angular>

//       </fieldset>
//     </div>
//   `
// })
// export class CommentsLogComponent {
//   @Input() comments: InstructionComment[] = [];

//   columnDefs: ColDef[] = [
//     { field: 'commentType', headerName: 'Comment Type', flex: 1, sortable: true },
//     { field: 'comment', headerName: 'Comments', flex: 3, wrapText: true, autoHeight: true },
//     { 
//       field: 'commentedBy', 
//       headerName: 'Commented By', 
//       flex: 1.5,
//       // Custom renderer to format the user and date nicely, matching the UX
//       cellRenderer: (params: any) => {
//         const data = params.data;
//         if (!data) return '';
//         return `
//           <div class="lh-sm py-1">
//             <span class="d-block fw-bold text-dark">${data.commentedBy}</span>
//             <span class="d-block text-muted small">${data.commentedOn}</span>
//           </div>
//         `;
//       }
//     }
//   ];

//   onGridReady(params: GridReadyEvent) {
//     params.api.sizeColumnsToFit();
//   }
// }