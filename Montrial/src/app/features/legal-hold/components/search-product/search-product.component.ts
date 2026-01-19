import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule
  ],
  templateUrl: './search-product.component.html',
  styleUrls: ['./search-product.component.scss']
})
export class SearchProductComponent implements OnInit {
  @Output() searchTriggered = new EventEmitter<any>();
  @Output() clearTriggered = new EventEmitter<void>();

  searchForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      productName: ['', Validators.required],
      productType: ['All'],
      branchCode: ['']
    });
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.searchTriggered.emit({ 
        ...this.searchForm.value, 
        searchType: 'PRODUCT' 
      });
    }
  }

  onClear(): void {
    // Resets to initial values
    this.searchForm.reset({
      productType: 'All',
      accountNumber: '',
      productName: '',
      branchCode: ''
    });
    this.clearTriggered.emit();
  }
}