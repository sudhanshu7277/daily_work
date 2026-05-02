import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { DocumentAttachment } from '../../../../core/models/instruction.model';

@Component({
  selector: 'app-instruction-attachments',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="bg-white p-4 shadow-sm border rounded mb-4">
      <fieldset class="custom-fieldset border-0 pb-0">
        
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <legend class="custom-legend m-0 border-0 w-auto">Instruction Attachments</legend>
          <button class="btn btn-sm btn-outline-primary btn-rounded" (click)="triggerUpload()">
            <i class="lucide-upload me-1"></i> Upload Document
          </button>
        </div>

        <ag-grid-angular
          style="width: 100%; height: 320px;"
          class="ag-theme-alpine"
          [rowData]="documents"
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
export class InstructionAttachmentsComponent {
  @Input() documents: DocumentAttachment[] = [];
  @Output() uploadClicked = new EventEmitter<void>();

  columnDefs: ColDef[] = [
    { field: 'documentName', headerName: 'Document Name', flex: 2, sortable: true, filter: true },
    { field: 'documentType', headerName: 'Document Type', flex: 1.5, sortable: true },
    { field: 'region', headerName: 'Region', flex: 1, sortable: true },
    { field: 'documentDated', headerName: 'Document Dated', flex: 1.5, sortable: true },
    { 
      field: 'dmcUpload', 
      headerName: 'DMC Upload', 
      width: 120,
      cellRenderer: (params: any) => params.value ? `<span class="text-success fw-bold"><i class="lucide-check-circle me-1"></i>Yes</span>` : `<span class="text-muted">No</span>`
    },
    { field: 'uploadedBy', headerName: 'Uploaded By', flex: 1.5, sortable: true },
    { field: 'uploadedOn', headerName: 'Uploaded On', flex: 1.5, sortable: true }
  ];

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  triggerUpload() {
    this.uploadClicked.emit();
  }
}







// import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AgGridModule } from 'ag-grid-angular';
// import { ColDef, GridReadyEvent } from 'ag-grid-community';
// import { DocumentAttachment } from '../../../../core/models/instruction.model';

// @Component({
//   selector: 'app-instruction-attachments',
//   standalone: true,
//   imports: [CommonModule, AgGridModule],
//   encapsulation: ViewEncapsulation.None,
//   template: `
//     <div class="bg-white p-4 shadow-sm border rounded mb-4">
//       <fieldset class="custom-fieldset border-0 pb-0">
        
//         <!-- Header & Action Button -->
//         <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
//           <legend class="custom-legend m-0 border-0 w-auto">Instruction Attachments</legend>
//           <button class="btn btn-sm btn-outline-primary btn-rounded" (click)="triggerUpload()">
//             <i class="lucide-upload me-1"></i> Upload Document
//           </button>
//         </div>

//         <!-- Search Bar -->
//         <div class="row g-2 mb-3 align-items-center">
//           <div class="col-md-5">
//             <div class="input-group input-group-sm">
//               <span class="input-group-text bg-white"><i class="lucide-search text-muted"></i></span>
//               <input type="text" class="form-control border-start-0 ps-0" placeholder="Search instruction documents...">
//               <button class="btn btn-secondary px-3">Search</button>
//             </div>
//           </div>
//         </div>

//         <!-- AG Grid -->
//         <ag-grid-angular
//           style="width: 100%; height: 250px;"
//           class="ag-theme-alpine"
//           [rowData]="documents"
//           [columnDefs]="columnDefs"
//           [headerHeight]="40"
//           [rowHeight]="45"
//           (gridReady)="onGridReady($event)">
//         </ag-grid-angular>

//       </fieldset>
//     </div>
//   `
// })
// export class InstructionAttachmentsComponent {
//   @Input() documents: DocumentAttachment[] = [];
//   @Output() uploadClicked = new EventEmitter<void>();

//   // Column definitions matching Fig 4 UX
//   columnDefs: ColDef[] = [
//     { field: 'documentName', headerName: 'Document Name', flex: 2, sortable: true, filter: true },
//     { field: 'documentType', headerName: 'Document Type', flex: 1.5, sortable: true },
//     { field: 'region', headerName: 'Region', flex: 1, sortable: true },
//     { field: 'documentDated', headerName: 'Document Dated', flex: 1.5, sortable: true },
//     { 
//       field: 'dmcUpload', 
//       headerName: 'DMC Upload', 
//       width: 120,
//       cellRenderer: (params: any) => {
//         return params.value 
//           ? `<span class="text-success fw-bold"><i class="lucide-check-circle me-1"></i>Yes</span>` 
//           : `<span class="text-muted">No</span>`;
//       }
//     },
//     { field: 'uploadedBy', headerName: 'Uploaded By', flex: 1.5, sortable: true },
//     { field: 'uploadedOn', headerName: 'Uploaded On', flex: 1.5, sortable: true }
//   ];

//   onGridReady(params: GridReadyEvent) {
//     params.api.sizeColumnsToFit();
//   }

//   triggerUpload() {
//     // Tell the smart parent component to open the upload modal
//     this.uploadClicked.emit();
//   }
// }