import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select'; // v18+ Select replaces Dropdown
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker'; // v18+ replaces Calendar
import { MessageService } from 'primeng/api';
import { Checker1Service, IssueRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, 
    DialogModule, ToastModule, TagModule, SelectModule, 
    InputTextModule, DatePickerModule
  ],
  providers: [MessageService],
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.scss']
})
export class Checker1Component implements OnInit {
  public gridData: IssueRecord[] = [];
  public selectedRecords: IssueRecord[] = []; // Checkboxes require an array
  public editDialog: boolean = false;
  public clonedRecord: any = {};
  public loading: boolean = true;
  
  public currencies = [
    { label: 'USD', value: 'USD' }, { label: 'CAD', value: 'CAD' },
    { label: 'EUR', value: 'EUR' }, { label: 'GBP', value: 'GBP' }
  ];

  constructor(private service: Checker1Service, private messageService: MessageService) {}

  ngOnInit() {
    this.service.getIssueRecords().subscribe(data => {
      this.gridData = data;
      this.loading = false;
    });
  }

  // Authorize selected rows
  onAuthorizeSelected() {
    if (this.selectedRecords.length > 0) {
      this.selectedRecords.forEach(record => record.status = 'Approved');
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Authorized', 
        detail: `${this.selectedRecords.length} records processed` 
      });
      this.selectedRecords = []; // Clear checkboxes
    }
  }

  // Row-level Edit
  onEditRow(record: IssueRecord) {
    this.clonedRecord = { ...record }; // Deep copy
    this.editDialog = true;
  }

  saveEdit() {
    const index = this.gridData.findIndex(r => r.id === this.clonedRecord.id);
    if (index !== -1) {
      this.gridData[index] = { ...this.clonedRecord };
      this.messageService.add({ severity: 'info', summary: 'Saved', detail: 'Update successful' });
    }
    this.editDialog = false;
  }
}