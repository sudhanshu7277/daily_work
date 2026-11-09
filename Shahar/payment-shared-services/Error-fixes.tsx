//1. purge-pause.component.ts

import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface PurgePauseRecord {
  id?: string;
  classActionProject: string;
  pauseRequestDate: string;
  pauseLiftDate?: string;
  pauseStatus: 'Active (Paused)' | 'Lifted' | 'Failed';
  ediscoveryProjectManager: string;
  responsibleLawyerEmail: string;
  fileName?: string;
  uploadDate?: string;
  status?: string;
}

export type SortColumn =
  | 'classActionProject'
  | 'pauseRequestDate'
  | 'pauseLiftDate'
  | 'pauseStatus'
  | 'ediscoveryProjectManager'
  | 'responsibleLawyerEmail';

export type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-purge-pause',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './purge-pause.component.html',
  styleUrls: ['./purge-pause.component.scss']
})
export class PurgePauseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  @ViewChild('submitConfirmDialog') submitConfirmDialog!: TemplateRef<any>;
  private dialogRef?: MatDialogRef<any>;

  // Form instances
  pauseForm!: FormGroup;
  searchForm!: FormGroup;

  // Max-length tracking flags for Pause form
  isPauseClassActionMaxExceeded = false;
  isPauseManagerMaxExceeded = false;
  isPauseEmailMaxExceeded = false;

  // Max-length tracking flags for Search form
  isSearchClassActionMaxExceeded = false;
  isSearchManagerMaxExceeded = false;
  isSearchEmailMaxExceeded = false;

  // Edit record state
  isEditing = false;
  editingRecordId: string | null = null;

  // Table state (preserved from bulk-upload)
  records: PurgePauseRecord[] = [];
  displayedRecords: PurgePauseRecord[] = [];
  isLoading = false;

  currentPage = 1;
  pageSize = 10;
  pageSizeOpts = [10, 20, 50];
  totalRows = 0;
  totalPages = 0;
  pageNumbers: (number | string)[] = [];
  sortColumn: SortColumn = 'pauseRequestDate';
  sortDirection: SortDirection = 'desc';

  // Pause Status dropdown options
  statusOptions = [
    { value: '', label: 'Select' },
    { value: 'Active (Paused)', label: 'Active (Paused)' },
    { value: 'Lifted', label: 'Lifted' },
    { value: 'Failed', label: 'Failed' }
  ];

  ngOnInit(): void {
    this.initForms();
    this.fetchPurgePauseRecords();
  }

  private initForms(): void {
    // 1. Pause Form (All 3 fields mandatory)
    this.pauseForm = this.fb.group({
      classActionProject: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[^*,<>]*$/)
      ]],
      ediscoveryProjectManager: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)
      ]],
      responsibleLawyerEmail: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
      ]]
    });

    // 2. Search Form (All 4 fields optional)
    this.searchForm = this.fb.group({
      classActionProject: ['', [Validators.maxLength(100), Validators.pattern(/^[^*,<>]*$/)]],
      ediscoveryProjectManager: ['', [Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      responsibleLawyerEmail: ['', [Validators.email, Validators.maxLength(50)]],
      pauseStatus: ['']
    });
  }

  // --- Character Filtering & Limit Checks ---
  onBeforeInputCheck(event: Event, formType: 'pause' | 'search', controlName: string, maxLen: number): void {
    const inputEvent = event as InputEvent;

    // Handle Backspace / Delete
    if (inputEvent.inputType === 'deleteContentBackward' || inputEvent.inputType === 'deleteContentForward') {
      const target = inputEvent.target as HTMLInputElement;
      const currentVal = target.value || '';
      const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
      const remainingLength = selectedLength > 0 ? currentVal.length - selectedLength : currentVal.length - 1;

      if (remainingLength < maxLen) {
        this.setLimitFlag(formType, controlName, false);
        this.cdr.markForCheck();
      }
      return;
    }

    if (!inputEvent.data) return;

    // Prohibited characters filtering
    if (controlName === 'classActionProject') {
      if (/[*,<>]/.test(inputEvent.data)) {
        inputEvent.preventDefault();
        return;
      }
    } else if (controlName === 'ediscoveryProjectManager') {
      if (!/^[a-zA-Z0-9\s.'\-]+$/.test(inputEvent.data)) {
        inputEvent.preventDefault();
        return;
      }
    }

    // Max length enforcement
    const target = inputEvent.target as HTMLInputElement;
    const currentVal = target.value || '';
    const selectedLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
    const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;

    if (newTotalLength > maxLen) {
      inputEvent.preventDefault();
      this.setLimitFlag(formType, controlName, true);
      this.cdr.markForCheck();
    }
  }

  onInputChange(formType: 'pause' | 'search', controlName: string, maxLen: number): void {
    const form = formType === 'pause' ? this.pauseForm : this.searchForm;
    const val = form.get(controlName)?.value || '';

    if (val.length < maxLen) {
      this.setLimitFlag(formType, controlName, false);
      this.cdr.markForCheck();
    }
  }

  private setLimitFlag(formType: 'pause' | 'search', controlName: string, value: boolean): void {
    if (formType === 'pause') {
      if (controlName === 'classActionProject') this.isPauseClassActionMaxExceeded = value;
      if (controlName === 'ediscoveryProjectManager') this.isPauseManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isPauseEmailMaxExceeded = value;
    } else {
      if (controlName === 'classActionProject') this.isSearchClassActionMaxExceeded = value;
      if (controlName === 'ediscoveryProjectManager') this.isSearchManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isSearchEmailMaxExceeded = value;
    }
  }

  // --- Pause Actions & Modal Flow ---
  onPauseClick(): void {
    if (
      this.pauseForm.invalid ||
      this.isPauseClassActionMaxExceeded ||
      this.isPauseManagerMaxExceeded ||
      this.isPauseEmailMaxExceeded
    ) {
      this.pauseForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.dialogRef = this.dialog.open(this.submitConfirmDialog, {
      width: '460px',
      panelClass: 'bmo-confirmation-dialog'
    });
  }

  onConfirmSubmit(): void {
    this.dialogRef?.close();

    const payload = {
      classActionProject: this.pauseForm.value.classActionProject?.trim(),
      ediscoveryProjectManager: this.pauseForm.value.ediscoveryProjectManager?.trim(),
      responsibleLawyerEmail: this.pauseForm.value.responsibleLawyerEmail?.trim(),
      recordId: this.editingRecordId
    };

    console.log(this.isEditing ? 'Updating Pause Record:' : 'Creating Pause Record:', payload);
    this.onClearPause();
  }

  onCancelDialog(): void {
    this.dialogRef?.close();
  }

  onClearPause(): void {
    this.isPauseClassActionMaxExceeded = false;
    this.isPauseManagerMaxExceeded = false;
    this.isPauseEmailMaxExceeded = false;
    this.isEditing = false;
    this.editingRecordId = null;
    this.pauseForm.reset();
  }

  // --- Search Actions ---
  onSearch(): void {
    if (
      this.searchForm.invalid ||
      this.isSearchClassActionMaxExceeded ||
      this.isSearchManagerMaxExceeded ||
      this.isSearchEmailMaxExceeded
    ) {
      this.searchForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.currentPage = 1;
    this.fetchPurgePauseRecords();
  }

  onClearSearch(): void {
    this.isSearchClassActionMaxExceeded = false;
    this.isSearchManagerMaxExceeded = false;
    this.isSearchEmailMaxExceeded = false;
    this.searchForm.reset({
      classActionProject: '',
      ediscoveryProjectManager: '',
      responsibleLawyerEmail: '',
      pauseStatus: ''
    });
    this.onSearch();
  }

  // --- Table Data, Sorting & Pagination Methods ---
  fetchPurgePauseRecords(): void {
    this.isLoading = true;
    this.updatePagination();
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  onSort(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortRecords();
    this.updatePagination();
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn !== column) return 'none';
    return this.sortDirection;
  }

  private sortRecords(): void {
    this.records.sort((a, b) => {
      const valA = (a[this.sortColumn] || '').toString().toLowerCase();
      const valB = (b[this.sortColumn] || '').toString().toLowerCase();
      const cmp = valA.localeCompare(valB, undefined, { numeric: true });
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  updatePagination(): void {
    this.totalRows = this.records.length;
    this.totalPages = Math.ceil(this.totalRows / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedRecords = this.records.slice(start, start + this.pageSize);
    this.buildPageNumbers();
  }

  goPage(page: number | string): void {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    if (isNaN(pageNum) || pageNum < 1 || pageNum > this.totalPages) return;
    this.currentPage = pageNum;
    this.updatePagination();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  private buildPageNumbers(): void {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...', this.totalPages);
      } else if (this.currentPage >= this.totalPages - 3) {
        pages.push(1, '...');
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
      }
    }
    this.pageNumbers = pages;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active (Paused)':
        return 'status-active-paused';
      case 'Lifted':
        return 'status-lifted';
      case 'Failed':
        return 'status-failed';
      default:
        return '';
    }
  }

  formatDate(value?: string | null): string {
    if (!value) return '';
    const trimmed = String(value).trim();
    if (!trimmed) return '';

    const ddMmYyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const ddMmYyyyMatch = trimmed.match(ddMmYyyy);
    if (ddMmYyyyMatch) {
      const day = ddMmYyyyMatch[1].padStart(2, '0');
      const month = ddMmYyyyMatch[2].padStart(2, '0');
      const year = ddMmYyyyMatch[3];
      return `${day}/${month}/${year}`;
    }

    const yyyyMmDd = /^(\d{4})-(\d{2})-(\d{2})/;
    const yyyyMmDdMatch = trimmed.match(yyyyMmDd);
    if (yyyyMmDdMatch) {
      const year = yyyyMmDdMatch[1];
      const month = yyyyMmDdMatch[2];
      const day = yyyyMmDdMatch[3];
      return `${day}/${month}/${year}`;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const day = String(parsed.getUTCDate()).padStart(2, '0');
      const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      const year = String(parsed.getUTCFullYear());
      return `${day}/${month}/${year}`;
    }

    return trimmed;
  }

  // --- Edit Hook: Populates Pause Form ---
  onEditRecord(record: any): void {
    this.isEditing = true;
    this.editingRecordId = record?.id || null;

    this.pauseForm.patchValue({
      classActionProject: record.classActionProject || record.fileName || '',
      ediscoveryProjectManager: record.ediscoveryProjectManager || '',
      responsibleLawyerEmail: record.responsibleLawyerEmail || ''
    });

    this.isPauseClassActionMaxExceeded = false;
    this.isPauseManagerMaxExceeded = false;
    this.isPauseEmailMaxExceeded = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  paginationFrom(): number {
    return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRows);
  }
}



//2. purge-pause.component.html

<div class="purge-pause-wrapper">
  <!-- Page Header -->
  <div class="page-header">
    <h2 class="page-title">{{ 'Manage Purge Pause' | translate }}</h2>
  </div>

  <!-- ============================================== -->
  <!-- 1. PAUSE FORM CARD (All 3 Mandatory)          -->
  <!-- ============================================== -->
  <div class="purge-pause-content-section-one">
    <div class="purge-heading">
      <h2>{{ 'Pause' | translate }}</h2>
    </div>

    <form [formGroup]="pauseForm" class="purge-pausing-form-container" aria-live="polite">
      <div class="purge-form-grid">
        <!-- 1. Class Action / Project -->
        <div class="form-field-group">
          <label class="input-label" for="pause-class-action-project">
            {{ 'Class Action / Project' | translate }}
            <span class="required-star" aria-hidden="true">*</span>
          </label>
          <input
            id="pause-class-action-project"
            class="class-action-project-name"
            [class.input-error]="(pauseForm.get('classActionProject')?.invalid && pauseForm.get('classActionProject')?.touched) || isPauseClassActionMaxExceeded"
            type="text"
            formControlName="classActionProject"
            placeholder="Name"
            aria-required="true"
            (beforeinput)="onBeforeInputCheck($event, 'pause', 'classActionProject', 100)"
            (input)="onInputChange('pause', 'classActionProject', 100)"
          />

          @if (pauseForm.get('classActionProject')?.touched && pauseForm.get('classActionProject')?.hasError('required')) {
            <small class="error-text">Enter Class Action / Project Name</small>
          }
          @if (pauseForm.get('classActionProject')?.hasError('pattern')) {
            <small class="error-text">Special characters are not allowed</small>
          }
          @if (isPauseClassActionMaxExceeded || pauseForm.get('classActionProject')?.hasError('maxlength')) {
            <small class="error-text">Class Action / Project Name exceeds maximum allowed length</small>
          }
        </div>

        <!-- 2. eDiscovery Project Manager -->
        <div class="form-field-group">
          <label class="input-label" for="pause-ediscovery-manager">
            {{ 'eDiscovery Project Manager' | translate }}
            <span class="required-star" aria-hidden="true">*</span>
          </label>
          <input
            id="pause-ediscovery-manager"
            class="ediscovery-manager-name"
            [class.input-error]="(pauseForm.get('ediscoveryProjectManager')?.invalid && pauseForm.get('ediscoveryProjectManager')?.touched) || isPauseManagerMaxExceeded"
            type="text"
            formControlName="ediscoveryProjectManager"
            placeholder="Name"
            aria-required="true"
            (beforeinput)="onBeforeInputCheck($event, 'pause', 'ediscoveryProjectManager', 50)"
            (input)="onInputChange('pause', 'ediscoveryProjectManager', 50)"
          />

          @if (pauseForm.get('ediscoveryProjectManager')?.touched && pauseForm.get('ediscoveryProjectManager')?.hasError('required')) {
            <small class="error-text">Enter eDiscovery Project Manager Name</small>
          }
          @if (pauseForm.get('ediscoveryProjectManager')?.hasError('pattern')) {
            <small class="error-text">Special characters are not allowed</small>
          }
          @if (isPauseManagerMaxExceeded || pauseForm.get('ediscoveryProjectManager')?.hasError('maxlength')) {
            <small class="error-text">eDiscovery Project Manager Name exceeds maximum allowed length</small>
          }
        </div>

        <!-- 3. Responsible Lawyer Email -->
        <div class="form-field-group">
          <label class="input-label" for="pause-lawyer-email">
            {{ 'Responsible Lawyer Email' | translate }}
            <span class="required-star" aria-hidden="true">*</span>
          </label>
          <input
            id="pause-lawyer-email"
            class="lawyer-email"
            [class.input-error]="(pauseForm.get('responsibleLawyerEmail')?.invalid && pauseForm.get('responsibleLawyerEmail')?.touched) || isPauseEmailMaxExceeded"
            type="email"
            formControlName="responsibleLawyerEmail"
            placeholder="example@bmo.com"
            aria-required="true"
            (beforeinput)="onBeforeInputCheck($event, 'pause', 'responsibleLawyerEmail', 50)"
            (input)="onInputChange('pause', 'responsibleLawyerEmail', 50)"
          />

          @if (pauseForm.get('responsibleLawyerEmail')?.touched && pauseForm.get('responsibleLawyerEmail')?.hasError('required')) {
            <small class="error-text">Enter Responsible Lawyer Email</small>
          }
          @if (pauseForm.get('responsibleLawyerEmail')?.hasError('email')) {
            <small class="error-text">Enter a valid email address</small>
          }
          @if (isPauseEmailMaxExceeded || pauseForm.get('responsibleLawyerEmail')?.hasError('maxlength')) {
            <small class="error-text">Responsible Lawyer Email exceeds maximum allowed length</small>
          }
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="purge-form-actions">
        <button type="button" class="clear-text-btn-blue" (click)="onClearPause()">
          {{ 'CLEAR' | translate }}
        </button>
        <button type="button" class="search-pill-btn pause-btn" (click)="onPauseClick()">
          {{ (isEditing ? 'UPDATE' : 'PAUSE') | translate }}
        </button>
      </div>
    </form>
  </div>

  <!-- ============================================== -->
  <!-- 2. SEARCH FORM CARD (All 4 Optional)          -->
  <!-- ============================================== -->
  <div class="purge-pause-content-section-two">
    <div class="purge-search-heading">
      <h2>{{ 'Search' | translate }}</h2>
    </div>

    <form [formGroup]="searchForm" class="purge-pausing-form-container" aria-live="polite">
      <div class="purge-form-grid search-grid">
        <!-- 1. Class Action / Project -->
        <div class="form-field-group">
          <label class="input-label" for="search-class-action-project">
            {{ 'Class Action / Project' | translate }}
          </label>
          <input
            id="search-class-action-project"
            class="class-action-project-name"
            [class.input-error]="searchForm.get('classActionProject')?.invalid || isSearchClassActionMaxExceeded"
            type="text"
            formControlName="classActionProject"
            placeholder="Name"
            (beforeinput)="onBeforeInputCheck($event, 'search', 'classActionProject', 100)"
            (input)="onInputChange('search', 'classActionProject', 100)"
          />

          @if (searchForm.get('classActionProject')?.hasError('pattern')) {
            <small class="error-text">Special characters are not allowed</small>
          }
          @if (isSearchClassActionMaxExceeded || searchForm.get('classActionProject')?.hasError('maxlength')) {
            <small class="error-text">Class Action / Project Name exceeds maximum allowed length</small>
          }
        </div>

        <!-- 2. eDiscovery Project Manager -->
        <div class="form-field-group">
          <label class="input-label" for="search-ediscovery-manager">
            {{ 'eDiscovery Project Manager' | translate }}
          </label>
          <input
            id="search-ediscovery-manager"
            class="ediscovery-manager-name"
            [class.input-error]="searchForm.get('ediscoveryProjectManager')?.invalid || isSearchManagerMaxExceeded"
            type="text"
            formControlName="ediscoveryProjectManager"
            placeholder="Name"
            (beforeinput)="onBeforeInputCheck($event, 'search', 'ediscoveryProjectManager', 50)"
            (input)="onInputChange('search', 'ediscoveryProjectManager', 50)"
          />

          @if (searchForm.get('ediscoveryProjectManager')?.hasError('pattern')) {
            <small class="error-text">Special characters are not allowed</small>
          }
          @if (isSearchManagerMaxExceeded || searchForm.get('ediscoveryProjectManager')?.hasError('maxlength')) {
            <small class="error-text">eDiscovery Project Manager Name exceeds maximum allowed length</small>
          }
        </div>

        <!-- 3. Responsible Lawyer Email -->
        <div class="form-field-group">
          <label class="input-label" for="search-lawyer-email">
            {{ 'Responsible Lawyer Email' | translate }}
          </label>
          <input
            id="search-lawyer-email"
            class="lawyer-email"
            [class.input-error]="searchForm.get('responsibleLawyerEmail')?.invalid || isSearchEmailMaxExceeded"
            type="email"
            formControlName="responsibleLawyerEmail"
            placeholder="example@bmo.com"
            (beforeinput)="onBeforeInputCheck($event, 'search', 'responsibleLawyerEmail', 50)"
            (input)="onInputChange('search', 'responsibleLawyerEmail', 50)"
          />

          @if (searchForm.get('responsibleLawyerEmail')?.hasError('email')) {
            <small class="error-text">Enter a valid email address</small>
          }
          @if (isSearchEmailMaxExceeded || searchForm.get('responsibleLawyerEmail')?.hasError('maxlength')) {
            <small class="error-text">Responsible Lawyer Email exceeds maximum allowed length</small>
          }
        </div>

        <!-- 4. Pause Status (Dropdown) -->
        <div class="form-field-group">
          <label class="input-label" for="search-pause-status">
            {{ 'Pause Status' | translate }}
          </label>
          <select id="search-pause-status" class="pause-status-select" formControlName="pauseStatus">
            @for (opt of statusOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Action Buttons (Fixed string literal for search button) -->
      <div class="purge-form-actions">
        <button type="button" class="clear-text-btn-blue" (click)="onClearSearch()">
          {{ 'CLEAR' | translate }}
        </button>
        <button type="button" class="search-pill-btn" (click)="onSearch()">
          {{ 'SEARCH' | translate }}
        </button>
      </div>
    </form>

    <!-- Results Count & Title -->
    <div class="results-header-container">
      <p class="results-count-text">Showing {{ totalRows }} results</p>
      <h3 class="results-title">{{ 'Results' | translate }}</h3>
    </div>

    <!-- ============================================== -->
    <!-- 3. RESULTS TABLE (7 Figma Columns)             -->
    <!-- ============================================== -->
    <div class="pp-table-container">
      <table class="pp-table">
        <thead>
          <tr>
            <!-- 1. Class Action / Project -->
            <th class="col-class-action sortable" tabindex="0"
                [attr.aria-sort]="sortColumn === 'classActionProject' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                (click)="onSort('classActionProject')" (keydown.enter)="onSort('classActionProject')">
              {{ 'Class Action / Project' | translate }}
              <span class="sort-icon" [attr.data-dir]="getSortIcon('classActionProject')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path class="sort-asc" d="M7 20V4M7 4L3 8M7 4L11 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path class="sort-desc" d="M17 4V20M17 20L13 16M17 20L21 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </th>

            <!-- 2. Pause Request Date -->
            <th class="col-request-date sortable" tabindex="0"
                [attr.aria-sort]="sortColumn === 'pauseRequestDate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                (click)="onSort('pauseRequestDate')" (keydown.enter)="onSort('pauseRequestDate')">
              {{ 'Pause Request Date' | translate }}
              <span class="sort-icon" [attr.data-dir]="getSortIcon('pauseRequestDate')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path class="sort-asc" d="M7 20V4M7 4L3 8M7 4L11 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path class="sort-desc" d="M17 4V20M17 20L13 16M17 20L21 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </th>

            <!-- 3. Pause Lift Date -->
            <th class="col-lift-date sortable" tabindex="0"
                [attr.aria-sort]="sortColumn === 'pauseLiftDate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                (click)="onSort('pauseLiftDate')" (keydown.enter)="onSort('pauseLiftDate')">
              {{ 'Pause Lift Date' | translate }}
              <span class="sort-icon" [attr.data-dir]="getSortIcon('pauseLiftDate')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path class="sort-asc" d="M7 20V4M7 4L3 8M7 4L11 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path class="sort-desc" d="M17 4V20M17 20L13 16M17 20L21 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </th>

            <!-- 4. Pause Status -->
            <th class="col-status sortable" tabindex="0"
                [attr.aria-sort]="sortColumn === 'pauseStatus' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                (click)="onSort('pauseStatus')" (keydown.enter)="onSort('pauseStatus')">
              {{ 'Pause Status' | translate }}
              <span class="sort-icon" [attr.data-dir]="getSortIcon('pauseStatus')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path class="sort-asc" d="M7 20V4M7 4L3 8M7 4L11 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path class="sort-desc" d="M17 4V20M17 20L13 16M17 20L21 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </th>

            <!-- 5. eDiscovery Project Manager -->
            <th class="col-manager sortable" tabindex="0"
                [attr.aria-sort]="sortColumn === 'ediscoveryProjectManager' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                (click)="onSort('ediscoveryProjectManager')" (keydown.enter)="onSort('ediscoveryProjectManager')">
              {{ 'eDiscovery Project Manager' | translate }}
              <span class="sort-icon" [attr.data-dir]="getSortIcon('ediscoveryProjectManager')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path class="sort-asc" d="M7 20V4M7 4L3 8M7 4L11 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path class="sort-desc" d="M17 4V20M17 20L13 16M17 20L21 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </th>

            <!-- 6. Responsible Lawyer Email -->
            <th class="col-lawyer-email sortable" tabindex="0"
                [attr.aria-sort]="sortColumn === 'responsibleLawyerEmail' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                (click)="onSort('responsibleLawyerEmail')" (keydown.enter)="onSort('responsibleLawyerEmail')">
              {{ 'Responsible Lawyer Email' | translate }}
              <span class="sort-icon" [attr.data-dir]="getSortIcon('responsibleLawyerEmail')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path class="sort-asc" d="M7 20V4M7 4L3 8M7 4L11 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path class="sort-desc" d="M17 4V20M17 20L13 16M17 20L21 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </th>

            <!-- 7. Edit Action -->
            <th class="col-edit-action">{{ 'Edit' | translate }}</th>
          </tr>
        </thead>

        <tbody>
          @if (isLoading) {
            <tr>
              <td colspan="7" class="loading-cell">
                <div class="spinner"></div>
                <span>Loading...</span>
              </td>
            </tr>
          } @else if (displayedRecords.length === 0) {
            <tr>
              <td colspan="7" class="no-records-cell" style="text-align: center; padding: 24px; color: #555555;">
                No records found
              </td>
            </tr>
          } @else {
            @for (record of displayedRecords; track record.id || $index) {
              <tr>
                <td>{{ record.classActionProject || record.fileName }}</td>
                <td>{{ formatDate(record.pauseRequestDate || record.uploadDate) }}</td>
                <td>{{ formatDate(record.pauseLiftDate) || '-' }}</td>
                <td>
                  <span class="status-indicator" [ngClass]="getStatusClass(record.pauseStatus || record.status || '')">
                    <span class="status-dot"></span>
                    {{ record.pauseStatus || record.status }}
                  </span>
                </td>
                <td>{{ record.ediscoveryProjectManager || '-' }}</td>
                <td>{{ record.responsibleLawyerEmail || '-' }}</td>
                <td class="col-edit-action">
                  <button type="button" class="edit-icon-btn" (click)="onEditRecord(record)" aria-label="Edit record">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls (Preserved from bulk-upload) -->
    @if (!isLoading && totalRows > 0) {
      <div class="cs-pagination">
        <div class="cs-pagination_left">
          <span class="cs-pg-count">{{ paginationFrom() }}-{{ paginationTo() }} of {{ totalRows }}</span>
          <label for="pp-page-size-select" class="cs-pg-label">Items per page</label>
          <select
            id="pp-page-size-select"
            class="cs-pg-select"
            [(ngModel)]="pageSize"
            [ngModelOptions]="{ standalone: true }"
            (change)="onPageSizeChange()"
          >
            @for (opt of pageSizeOpts; track opt) {
              <option [value]="opt">{{ opt }}</option>
            }
          </select>
        </div>

        <nav class="cs-pagination_right" aria-label="Pagination">
          <button
            type="button"
            class="cs-pg-nav"
            [disabled]="currentPage === 1"
            (click)="goPage(currentPage - 1)"
            aria-label="Previous page"
          >
            Previous
          </button>

          @for (p of pageNumbers; track $index) {
            @if (p === '...') {
              <span class="cs-pg-dots">...</span>
            } @else {
              <button
                type="button"
                class="cs-pg-num"
                [class.cs-pg-active]="p === currentPage"
                (click)="goPage(p)"
              >
                {{ p }}
              </button>
            }
          }

          <button
            type="button"
            class="cs-pg-nav"
            [disabled]="currentPage === totalPages"
            (click)="goPage(currentPage + 1)"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      </div>
    }
  </div>
</div>

<!-- ============================================== -->
<!-- 4. "SUBMIT PURGE PAUSE?" CONFIRMATION MODAL    -->
<!-- ============================================== -->
<ng-template #submitConfirmDialog>
  <div class="bmo-modal-container">
    <div class="bmo-modal-header">
      <h3 class="bmo-modal-title">Submit Purge Pause?</h3>
      <button type="button" class="bmo-modal-close-btn" (click)="onCancelDialog()" aria-label="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <div class="bmo-modal-body">
      <p class="bmo-modal-message">
        You have requested to pause the purge cycle. Click &ldquo;Submit&rdquo; to continue or &ldquo;Cancel&rdquo; to discard the request.
      </p>
    </div>
    <div class="bmo-modal-actions">
      <button type="button" class="bmo-btn-link" (click)="onCancelDialog()">
        CANCEL
      </button>
      <button type="button" class="bmo-btn-primary" (click)="onConfirmSubmit()">
        SUBMIT
      </button>
    </div>
  </div>
</ng-template>


//3. purge-pause.component.scss

// ==========================================================================
// 1. Theme Variables & Subheading Bar
// ==========================================================================
$bmo-blue: #0079c1;
$bmo-blue-hover: #005a91;
$bmo-white: #ffffff;
$bmo-black: #000000;
$bmo-text: #1a1a1a;
$bmo-grey: #a0a0a0;
$bmo-border-grey: #767676;
$border-lightgrey: #d3d3d3;
$bmo-error-red: #a12000;

.purge-pause-wrapper {
  width: 100%;
  margin-top: -25px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  background-color: $bmo-white;
  border-bottom: 2px solid $border-lightgrey;
  margin: 0 -32px 30px -32px;
  padding: 0 57px;

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: $bmo-black;
    margin: 0;
  }
}

// ==========================================================================
// 2. Card Containers & Forms
// ==========================================================================
.purge-pause-content-section-one,
.purge-pause-content-section-two {
  background: $bmo-white;
  border: 1px solid $border-lightgrey;
  border-radius: 4px;
  padding: 24px 32px 32px 32px;
  margin-bottom: 30px;

  .purge-heading,
  .purge-search-heading {
    margin-bottom: 20px;

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: $bmo-text;
      margin: 0;
    }
  }
}

.purge-pausing-form-container {
  display: flex;
  flex-direction: column;
  font-family: 'BMO Sans', Arial, sans-serif;

  .purge-form-grid {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: flex-start;
    width: 100%;

    &.search-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      align-items: flex-start;
    }
  }

  .form-field-group {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 180px;
    padding-bottom: 30px; // Reserves vertical space for the error message

    .input-label {
      font-size: 14px;
      font-weight: 500;
      color: #333333;
      margin-bottom: 6px;
      display: flex;
      align-items: center;

      .required-star {
        color: $bmo-error-red;
        margin-left: 2px;
        font-weight: bold;
      }
    }

    // Force Pure White background for all text, email, and select inputs
    input[type="text"],
    input[type="email"],
    select.pause-status-select {
      background-color: #ffffff !important;
      border: 1px solid $bmo-border-grey;
      border-radius: 4px;
      height: 42px;
      padding: 8px 12px;
      font-size: 14px;
      color: $bmo-text;
      box-sizing: border-box;
      width: 100%;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &::placeholder {
        color: #767676;
      }

      &:focus {
        border-color: $bmo-blue;
        box-shadow: 0 0 0 1px $bmo-blue;
      }

      &.input-error {
        border-color: $bmo-error-red !important;
        box-shadow: 0 0 0 1px $bmo-error-red;
      }
    }

    select.pause-status-select {
      cursor: pointer;
      appearance: auto;
    }

    // Error Message: Positioned cleanly below the input border with a comfortable gap
    .error-text {
      position: absolute;
      top: calc(100% - 24px + 6px); // Clean gap down from bottom border
      left: 0;
      color: $bmo-error-red;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.3;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      pointer-events: none;
      animation: fadeInError 0.15s ease-in-out forwards;

      &::before {
        content: '';
        display: inline-block;
        width: 14px;
        height: 14px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a12000'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: contain;
        flex-shrink: 0;
      }
    }
  }

  // Action Buttons
  .purge-form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 18px;
    margin-top: 6px;

    .clear-text-btn-blue {
      background: none;
      border: none;
      color: $bmo-blue;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      padding: 0 16px;
      height: 40px;
      letter-spacing: 0.2px;
      text-transform: uppercase;

      &:hover {
        text-decoration: underline;
      }
    }

    .search-pill-btn {
      background-color: $bmo-blue;
      color: $bmo-white;
      border: none;
      border-radius: 25px;
      padding: 0 28px;
      height: 40px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: background-color 0.2s ease;
      text-transform: uppercase;

      &:hover {
        background-color: $bmo-blue-hover;
      }
    }
  }
}

@keyframes fadeInError {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ==========================================================================
// 3. Results Table (Preserved bulk-upload structure)
// ==========================================================================
.results-header-container {
  margin-top: 32px;
  margin-bottom: 16px;

  .results-count-text {
    font-size: 13px;
    color: #555555;
    margin: 0 0 4px 0;
  }

  .results-title {
    font-size: 18px;
    font-weight: 600;
    color: $bmo-text;
    margin: 0;
  }
}

.pp-table-container {
  overflow-x: auto !important;
  border-radius: 4px;
  background: $bmo-white;

  .pp-table {
    width: 100%;
    border-collapse: collapse;

    thead {
      tr {
        border-bottom: 2px solid #d8e4e6;
      }

      th {
        text-align: left;
        font-size: 13px;
        font-weight: 700;
        color: #1c2333;
        padding: 14px 20px;
        white-space: nowrap;
        background: $bmo-white;

        &:last-child {
          border-right: none;
        }

        &.sortable {
          cursor: pointer;
          user-select: none;
        }

        &.col-class-action { width: 22%; }
        &.col-request-date { width: 14%; }
        &.col-lift-date    { width: 14%; }
        &.col-status       { width: 15%; }
        &.col-manager      { width: 16%; }
        &.col-lawyer-email { width: 14%; }
        &.col-edit-action  { width: 5%; text-align: center; }
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid #d8e4e6;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #f5f9fa;
        }

        td {
          font-size: 13px;
          color: #1c2333;
          padding: 14px 20px;
          vertical-align: middle;

          &.col-edit-action {
            text-align: center;
          }
        }
      }
    }
  }
}

// Sort Icon Styling (Preserved from bulk-upload)
.sort-icon {
  display: inline-flex;
  margin-left: 6px;
  vertical-align: middle;

  svg path {
    opacity: 0.35;
    transition: opacity 0.15s;
  }

  &[data-dir="asc"] .sort-asc {
    opacity: 1;
    color: #5a6474;
  }

  &[data-dir="desc"] .sort-desc {
    opacity: 1;
    color: #5a6474;
  }

  &[data-dir="none"] svg path {
    opacity: 0.65;
  }
}

// Loading Cell & Spinner
.loading-cell {
  text-align: center;
  padding: 40px 20px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
  color: #6b7a8a;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #d4e6ea;
  border-top-color: $bmo-blue;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Status Dots matching Figma
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;

  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    vertical-align: middle;
  }

  &.status-active-paused {
    color: #1a1a1a;
    .status-dot {
      background-color: #1a1a1a;
    }
  }

  &.status-lifted {
    color: #555555;
    .status-dot {
      background-color: #767676;
    }
  }

  &.status-failed {
    color: $bmo-error-red;
    .status-dot {
      background-color: $bmo-error-red;
    }
  }
}

// Edit Icon Button
.edit-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #555555;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: $bmo-blue;
    background-color: #f0f7fb;
  }

  mat-icon {
    font-size: 18px;
    width: 18px;
    height: 18px;
  }
}

// ==========================================================================
// 4. Pagination (Preserved from bulk-upload)
// ==========================================================================
.cs-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: 52px;
  padding: 0 20px;
  border-top: 1px solid #d8e4e6;
  background: $bmo-white;

  &_left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &_right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.cs-pg-count {
  font-size: 13px;
  font-weight: 600;
  color: #1c2333;
  white-space: nowrap;
}

.cs-pg-label {
  font-size: 13px;
  color: $bmo-black;
  white-space: nowrap;
  font-family: 'BMO Sans', Arial, sans-serif;
  font-weight: bold;
}

.cs-pg-select {
  height: 32px;
  padding: 0 26px 0 10px;
  border: 1px solid #c5d0d3;
  border-radius: 4px;
  background-color: $bmo-white;
  font-size: 13px;
  color: #1c2333;
  cursor: pointer;
  font-weight: bold;

  &:focus {
    outline: 2px solid $bmo-blue;
    outline-offset: 1px;
  }
}

.cs-pg-nav {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 4px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #1c2333;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.12s;
  outline: none;
  font-family: 'BMO Sans', Arial, sans-serif;
  color: $bmo-blue;
  font-weight: bold;

  &:hover:not(.cs-pg-nav--disabled) {
    color: $bmo-blue;
  }

  &:disabled,
  &--disabled {
    color: #b0bec5;
    cursor: default;
    pointer-events: none;
  }
}

.cs-pg-active {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $bmo-blue;
  color: $bmo-white;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  user-select: none;
}

.cs-pg-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 32px;
  padding: 0 4px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #1c2333;
  cursor: pointer;
  border-radius: 50%;
  outline: none;
  font-family: 'BMO Sans', Arial, sans-serif;
  font-weight: bold;

  &:hover {
    background: #e8f4fd;
    color: $bmo-blue;
  }
}

.cs-pg-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 32px;
  font-size: 13px;
  color: #6b7a8a;
}

// ==========================================================================
// 5. "Submit Purge Pause?" Confirmation Modal
// ==========================================================================
.bmo-modal-container {
  padding: 24px;
  background: $bmo-white;
  border-radius: 4px;

  .bmo-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .bmo-modal-title {
      font-size: 18px;
      font-weight: 600;
      color: $bmo-text;
      margin: 0;
    }

    .bmo-modal-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #555555;
      padding: 0;
      display: flex;
      align-items: center;
    }
  }

  .bmo-modal-body {
    margin-bottom: 24px;

    .bmo-modal-message {
      font-size: 14px;
      line-height: 1.4;
      color: #555555;
      margin: 0;
    }
  }

  .bmo-modal-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;

    .bmo-btn-link {
      background: none;
      border: none;
      color: $bmo-blue;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;
      padding: 8px 16px;
    }

    .bmo-btn-primary {
      background-color: $bmo-blue;
      color: $bmo-white;
      border: none;
      border-radius: 20px;
      padding: 8px 24px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;

      &:hover {
        background-color: $bmo-blue-hover;
      }
    }
  }
}