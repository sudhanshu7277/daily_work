// // checker/row-details-dialog.component.ts (unchanged)
// import { Component, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';

// @Component({
//   selector: 'app-row-details-dialog',
//   template: `
//     <h2 mat-dialog-title>Row Details</h2>
//     <mat-dialog-content>
//       <pre>{{ data | json }}</pre>
//     </mat-dialog-content>
//     <mat-dialog-actions>
//       <button mat-button mat-dialog-close>Close</button>
//     </mat-dialog-actions>
//   `,
// })
// export class RowDetailsDialogComponent {
//   constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
// }