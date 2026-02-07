import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Checker1Service, IssueRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, 
    DialogModule, ToastModule, TagModule, DropdownModule, InputTextModule
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
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getIssueRecords().subscribe(data => {
      this.gridData = data;
      this.loading = false;
    });
  }

  // Action Panel
  public onApprove() {
    if (!this.selectedRecord) return;
    this.selectedRecord.status = 'Approved';
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record Approved' });
  }

  // Modal Logic
  public openEditModal() {
    if (this.selectedRecord) {
      this.clonedRecord = { ...this.selectedRecord }; // Deep clone to avoid mutating grid before save
      this.editDialog = true;
    }
  }

  public saveEdit() {
    this.service.updateRecord(this.clonedRecord).subscribe(() => {
      const index = this.gridData.findIndex(r => r.id === this.clonedRecord.id);
      this.gridData[index] = { ...this.clonedRecord };
      this.selectedRecord = this.gridData[index]; // Update selection
      this.editDialog = false;
      this.messageService.add({ severity: 'info', summary: 'Updated', detail: 'Record saved successfully' });
    });
  }

  public getSeverity(status: string): any {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'info';
    }
  }
}