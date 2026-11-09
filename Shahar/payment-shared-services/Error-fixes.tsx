//purge-pause.component.ts

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

  // Max-length tracking flags for Pause form (Top card)
  isPauseClassActionMaxExceeded = false;
  isPauseManagerMaxExceeded = false;
  isPauseEmailMaxExceeded = false;

  // Max-length tracking flags for Search form (Middle card)
  isSearchClassActionMaxExceeded = false;
  isSearchManagerMaxExceeded = false;
  isSearchEmailMaxExceeded = false;

  // Edit record state
  isEditing = false;
  editingRecordId: string | null = null;

  // Search Criteria Object (replaces legacy customer-search criteria)
  criteria = {
    originatorData: {
      applicationCatalogueId: '92735',
      country: 'CAD',
      locationId: 'OCT132643',
      locationType: 'workstation number',
      channel: 'LHUI',
      employeeUserId: 'tnoymsn',
      transitNumber: 'string'
    },
    purgePauseSearchCriteria: {
      classActionProject: '',
      ediscoveryProjectManager: '',
      responsibleLawyerEmail: '',
      pauseStatus: ''
    },
    requestPaginationInfo: {
      returnAvailableResultCount: 'true',
      pageStartIndex: '1',
      pageEndIndex: '10'
    }
  };

  // Table state (matching bulk-upload pagination & sorting logic)
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

  // Dropdown options
  statusOptions = [
    { value: '', label: 'Select' },
    { value: 'Active (Paused)', label: 'Active (Paused)' },
    { value: 'Lifted', label: 'Lifted' },
    { value: 'Failed', label: 'Failed' }
  ];

  // Master mock dataset directly matching Figma UI
  private readonly MOCK_DATA: PurgePauseRecord[] = [
    {
      id: '1',
      classActionProject: 'Legal Hold Re 789',
      pauseRequestDate: '1/12/2025',
      pauseLiftDate: '',
      pauseStatus: 'Failed',
      ediscoveryProjectManager: 'Mayank Garg',
      responsibleLawyerEmail: 'mayankgarg@bmo.com'
    },
    {
      id: '2',
      classActionProject: 'Legal Hold Re 456',
      pauseRequestDate: '11/12/2025',
      pauseLiftDate: '',
      pauseStatus: 'Active (Paused)',
      ediscoveryProjectManager: 'Mayank Garg',
      responsibleLawyerEmail: 'mayankgarg@bmo.com'
    },
    {
      id: '3',
      classActionProject: 'Legal Hold Re 456',
      pauseRequestDate: '11/12/2025',
      pauseLiftDate: '',
      pauseStatus: 'Active (Paused)',
      ediscoveryProjectManager: 'Mayank Garg',
      responsibleLawyerEmail: 'mayankgarg@bmo.com'
    },
    {
      id: '4',
      classActionProject: 'Legal Hold Re 123',
      pauseRequestDate: '11/12/2025',
      pauseLiftDate: '11/12/2026',
      pauseStatus: 'Lifted',
      ediscoveryProjectManager: 'Mayank Garg',
      responsibleLawyerEmail: 'mayankgarg@bmo.com'
    },
    {
      id: '5',
      classActionProject: 'Legal Hold Re 123',
      pauseRequestDate: '11/12/2025',
      pauseLiftDate: '11/12/2026',
      pauseStatus: 'Lifted',
      ediscoveryProjectManager: 'Mayank Garg',
      responsibleLawyerEmail: 'mayankgarg@bmo.com'
    },
    {
      id: '6',
      classActionProject: 'Class Action Alpha 001',
      pauseRequestDate: '02/15/2025',
      pauseLiftDate: '',
      pauseStatus: 'Active (Paused)',
      ediscoveryProjectManager: 'Sarah Jenkins',
      responsibleLawyerEmail: 's.jenkins@bmo.com'
    },
    {
      id: '7',
      classActionProject: 'Project Beta Risk Hold',
      pauseRequestDate: '03/20/2025',
      pauseLiftDate: '09/10/2025',
      pauseStatus: 'Lifted',
      ediscoveryProjectManager: 'Alex Chen',
      responsibleLawyerEmail: 'achen@bmo.com'
    }
  ];

  ngOnInit(): void {
    this.initForms();
    this.fetchPurgePauseRecords();
  }

  private initForms(): void {
    // 1. Pause Form (Top card - all 3 fields required)
    this.pauseForm = this.fb.group({
      classActionProject: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[^*,<>]*\$/)
      ]],
      ediscoveryProjectManager: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\s.'\-]*\$/)
      ]],
      responsibleLawyerEmail: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
      ]]
    });

    // 2. Search Form (Middle card - all 4 fields optional)
    this.searchForm = this.fb.group({
      classActionProject: ['', [Validators.maxLength(100), Validators.pattern(/^[^*,<>]*\$/)]],
      ediscoveryProjectManager: ['', [Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*\$/)]],
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

    // Prohibited characters filter
    if (controlName === 'classActionProject') {
      if (/[*,<>]/.test(inputEvent.data)) {
        inputEvent.preventDefault();
        return;
      }
    } else if (controlName === 'ediscoveryProjectManager') {
      if (!/^[a-zA-Z0-9\s.'\-]+\$/.test(inputEvent.data)) {
        inputEvent.preventDefault();
        return;
      }
    }

    // Max length check
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

    const formValues = this.pauseForm.value;

    if (this.isEditing && this.editingRecordId) {
      const target = this.MOCK_DATA.find(r => r.id === this.editingRecordId);
      if (target) {
        target.classActionProject = formValues.classActionProject.trim();
        target.ediscoveryProjectManager = formValues.ediscoveryProjectManager.trim();
        target.responsibleLawyerEmail = formValues.responsibleLawyerEmail.trim();
      }
    } else {
      const newRecord: PurgePauseRecord = {
        id: String(Date.now()),
        classActionProject: formValues.classActionProject.trim(),
        pauseRequestDate: new Date().toLocaleDateString('en-GB'),
        pauseLiftDate: '',
        pauseStatus: 'Active (Paused)',
        ediscoveryProjectManager: formValues.ediscoveryProjectManager.trim(),
        responsibleLawyerEmail: formValues.responsibleLawyerEmail.trim()
      };
      this.MOCK_DATA.unshift(newRecord);
    }

    this.onClearPause();
    this.fetchPurgePauseRecords();
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

  // --- Search Criteria Payload Builder ---
  buildSearchPayload(): any {
    const rawValues = this.searchForm.value;

    return {
      originatorData: { ...this.criteria.originatorData },
      purgePauseSearchCriteria: {
        classActionProject: rawValues.classActionProject?.trim() || '',
        ediscoveryProjectManager: rawValues.ediscoveryProjectManager?.trim() || '',
        responsibleLawyerEmail: rawValues.responsibleLawyerEmail?.trim() || '',
        pauseStatus: rawValues.pauseStatus?.trim() || ''
      },
      requestPaginationInfo: {
        returnAvailableResultCount: 'true',
        pageStartIndex: String((this.currentPage - 1) * this.pageSize + 1),
        pageEndIndex: String(this.currentPage * this.pageSize)
      }
    };
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
    const payload = this.buildSearchPayload();
    console.log('Purge Pause Search Criteria Payload:', payload);

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

    const filters = this.searchForm.value;
    const projectFilter = (filters.classActionProject || '').trim().toLowerCase();
    const managerFilter = (filters.ediscoveryProjectManager || '').trim().toLowerCase();
    const emailFilter = (filters.responsibleLawyerEmail || '').trim().toLowerCase();
    const statusFilter = (filters.pauseStatus || '').trim();

    this.records = this.MOCK_DATA.filter(item => {
      const matchProject = !projectFilter || item.classActionProject.toLowerCase().includes(projectFilter);
      const matchManager = !managerFilter || item.ediscoveryProjectManager.toLowerCase().includes(managerFilter);
      const matchEmail = !emailFilter || item.responsibleLawyerEmail.toLowerCase().includes(emailFilter);
      const matchStatus = !statusFilter || item.pauseStatus === statusFilter;
      return matchProject && matchManager && matchEmail && matchStatus;
    });

    this.sortRecords();
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

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10) || 10;
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

    const ddMmYyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\$/;
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



// purge-pause.component.html


<div class="purge-pause-wrapper">
  <!-- Page Header -->
  <div class="page-header">
    <h2 class="page-title">{{ 'Manage Purge Pause' | translate }}</h2>
  </div>

  <!-- ============================================== -->
  <!-- 1. PAUSE FORM CARD (Top Creation Section)      -->
  <!-- ============================================== -->
  <div class="purge-pause-content-section-one">
    <div class="purge-heading">
      <h2>{{ 'Pause' | translate }}</h2>
    </div>

    <form [formGroup]="pauseForm" class="purge-pausing-form-container" aria-live="polite">
      <div class="purge-form-grid">
        <!-- 1. Class Action / Project (Required, max 100) -->
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

        <!-- 2. eDiscovery Project Manager (Required, max 50) -->
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

        <!-- 3. Responsible Lawyer Email (Required, max 50) -->
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

      <!-- Action Buttons (Hardcoded 'SEARCH' literal prevents [object Object] errors) -->
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

    <!-- Pagination Controls (Standard [value] + (change) binding) -->
    @if (!isLoading && totalRows > 0) {
      <div class="cs-pagination">
        <div class="cs-pagination_left">
          <span class="cs-pg-count">{{ paginationFrom() }}-{{ paginationTo() }} of {{ totalRows }}</span>
          <label for="pp-page-size-select" class="cs-pg-label">Items per page</label>
          <select
            id="pp-page-size-select"
            class="cs-pg-select"
            [value]="pageSize"
            (change)="onPageSizeChange($event)"
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