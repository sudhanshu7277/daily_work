// html

<div class="filter-container">
  <label class="filter-label">Search result filter</label>
  
  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="bmo-custom-select">
    
    <mat-select multiple 
                [(ngModel)]="selectedFilterIds" 
                (selectionChange)="onFilterChange()">
      
      <mat-select-trigger>Select</mat-select-trigger>
      
      @for (opt of filterOptions; track opt.id) {
        <mat-option [value]="opt.id">
          {{opt.label}}
        </mat-option>
      }
    </mat-select>
    
  </mat-form-field>
</div>

// ts 

import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

export interface FilterOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent {
  // Input options based on image 12
  filterOptions: FilterOption[] = [
    { id: '1', label: 'File Net ID' },
    { id: '2', label: 'Legal Hold Status' },
    { id: '3', label: 'Legal Hold Name' },
    { id: '4', label: 'Customer Lifecycle Status' },
    { id: '5', label: 'Role Type' },
    { id: '6', label: 'Address' }
  ];

  // ngModel binding to store selected IDs
  selectedFilterIds: string[] = ['1']; // Initialize with 'File Net ID' checked

  @Output() filterChanged = new EventEmitter<string[]>();

  onFilterChange() {
    this.filterChanged.emit(this.selectedFilterIds);
  }
}


// scss

/* Global container/label logic */
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Space between label and input */
  width: 320px; /* Adjust width as needed */

  .filter-label {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

/* * Apply targeted overrides to the Angular Material MDC components 
 * used in modern Angular versions.
 */
::ng-deep {
  .bmo-custom-select {
    width: 100%;

    /* * 1. STYLE THE CLOSED INPUT BOX (Image 10)
     */
    .mat-mdc-text-field-wrapper {
      background-color: #fdfdfd;
      border-radius: 4px;
    }

    // Set the static border color
    .mdc-notched-outline__leading,
    .mdc-notched-outline__notch,
    .mdc-notched-outline__trailing {
      border-color: #bcbcbc !important;
    }

    // The text inside the closed input
    .mat-mdc-select-value-text {
      color: #333 !important;
      font-weight: 500;
      font-size: 15px;
    }

    /* * 2. THE BLUE CARROT (Images 10 & 11)
     */
    .mat-mdc-select-arrow {
      color: #004c97 !important; // Dark Blue color from design
      opacity: 1 !important;
      width: 12px;
      height: 12px;
      margin-top: -2px;
    }

    /* * 3. FOCUS/OPEN STATE BORDER (Image 11)
     */
    &.mat-focused {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #004c97 !important; // Match carrot blue
        border-width: 2px !important;
      }
    }
  }

  /* * 4. STYLE THE DROPDOWN PANEL (Image 12)
   * (Targets the overlay panel, not the form field)
   */
  .cdk-overlay-pane {
    transform: translateY(12px) !important; /* Gap between input and panel */
  }

  .mat-mdc-select-panel {
    background: #fff;
    border-radius: 4px;
    border: 1px solid #bcbcbc;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 0 !important;
  }

  /* * 5. CUSTOM CHECKBOXES INSIDE OPTION (Image 12)
   * This is the complex override to match the specific 
   * dark blue checked state.
   */
  .mat-mdc-option {
    font-family: 'Open Sans', sans-serif;
    color: #333 !important;
    padding: 0 16px !important;
    height: 44px !important;

    // The standard checkmark container
    .mdc-checkbox {
      margin-right: 12px;
    }

    // The inner checkbox visual logic
    .mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background,
    .mdc-checkbox__native-control:enabled:indeterminate ~ .mdc-checkbox__background {
      border-color: #004c97 !important; // Dark Blue Border
      background-color: #004c97 !important; // Dark Blue Background
    }

    .mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background .mdc-checkbox__checkmark,
    .mdc-checkbox__native-control:enabled:indeterminate ~ .mdc-checkbox__background .mdc-checkbox__checkmark {
      color: #ffffff !important; // White Checkmark
    }

    /* Hover State */
    &:hover:not(.mat-mdc-option-disabled) {
      background-color: #f5f5f5 !important;
    }
    
    /* Active/Selected State Background (Separate from checkbox color) */
    &.mdc-list-item--selected:not(.mat-mdc-option-disabled) {
      background-color: #e8f0f6 !important; // Light Blue wash
    }
  }
}