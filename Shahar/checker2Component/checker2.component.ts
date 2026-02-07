import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select'; // Use SelectModule for v18+ instead of Dropdown
import { MessageService } from 'primeng/api';
import { Checker1Service, IssueRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, 
    ToastModule, TagModule, DialogModule, InputTextModule, SelectModule
  ],
  providers: [MessageService],
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.scss']
})
export class Checker1Component implements OnInit {
  public gridData: IssueRecord[] = [];
  public selectedRecord: IssueRecord | null = null;
  public editDialog: boolean = false;
  public clonedRecord: IssueRecord = {} as IssueRecord;
  public loading: boolean = true;
  
  public currencies = [
    { label: 'USD', value: 'USD' },
    { label: 'CAD', value: 'CAD' },
    { label: 'JPY', value: 'JPY' },
    { label: 'GBP', value: 'GBP' }
  ];

  constructor(private service: Checker1Service, private messageService: MessageService) {}

  ngOnInit(): void {
    this.service.getIssueRecords().subscribe(data => {
      // Ensure data mapping for Dates happens in service or here
      this.gridData = data;
      this.loading = false;
    });
  }

  public getSeverity(status: string) {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  }

  public openEdit() {
    this.clonedRecord = { ...this.selectedRecord! };
    this.editDialog = true;
  }

  public saveEdit() {
    this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Record Saved' });
    this.editDialog = false;
  }
}