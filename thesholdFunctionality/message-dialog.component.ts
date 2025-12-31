import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-message-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 400px;
    }
  `]
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}
}

ng generate component message-dialog