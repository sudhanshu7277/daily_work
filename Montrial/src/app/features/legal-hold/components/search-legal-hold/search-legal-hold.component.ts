import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-legal-hold',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './search-legal-hold.component.html',
  styleUrls: ['./search-legal-hold.component.scss']
})
export class SearchLegalHoldComponent implements OnInit {
  @Output() searchTriggered = new EventEmitter<any>();
  @Output() clearTriggered = new EventEmitter<void>();

  searchForm!: FormGroup;

  // Status options for the dropdown
  statusOptions = ['Active', 'Released', 'Pending', 'All'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      holdName: ['', Validators.required],
      holdId: [''],
      status: ['Active'],
      dateInitiated: ['']
    });
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.searchTriggered.emit({ 
        ...this.searchForm.value, 
        searchType: 'LEGAL_HOLD' 
      });
    }
  }

  onClear(): void {
    this.searchForm.reset({
      status: 'Active',
      holdName: '',
      holdId: '',
      dateInitiated: ''
    });
    this.clearTriggered.emit();
  }
}