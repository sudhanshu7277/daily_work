import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

// Angular Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

import { Checker1Service, IssueRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, 
    ToastModule, TagModule, DropdownModule, InputTextModule,
    MatDatepickerModule, MatInputModule, MatFormFieldModule, MatNativeDateModule
  ],
  providers: [MessageService],
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.scss']
})
export class Checker1Component implements OnInit {
  @ViewChild('dt') table?: Table;

  public gridData: IssueRecord[] = [];
  public selectedRecords: IssueRecord[] = [];
  public editDialog: boolean = false;
  public clonedRecord: any = {};
  public loading: boolean = true;
  
  public filterDate: Date | null = null;
  public selectedCurrency: string | null = null;
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

  onAuthorizeSelected() {
    this.selectedRecords.forEach(r => r.status = 'Approved');
    this.messageService.add({ severity: 'success', summary: 'Authorized', detail: 'Records Updated' });
    this.selectedRecords = [];
  }

  onEditRow(record: IssueRecord) {
    this.clonedRecord = { ...record };
    this.editDialog = true;
  }

  saveEdit() {
    const index = this.gridData.findIndex(r => r.id === this.clonedRecord.id);
    if (index !== -1) {
      this.gridData[index] = { ...this.clonedRecord };
      this.messageService.add({ severity: 'info', summary: 'Saved', detail: 'Record updated' });
    }
    this.editDialog = false;
  }

  resetFilters() {
    this.filterDate = null;
    this.selectedCurrency = null;
    this.table?.reset();
  }
}