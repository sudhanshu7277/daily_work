//2. Complete Updated Code
// purge-pause.component.ts


import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface PurgePauseRecord {
  id: string;
  classActionProject: string;
  pauseRequestDate: string;
  pauseLiftDate?: string;
  pauseStatus: 'Active (Paused)' | 'Lifted' | 'Failed' | 'Submitted';
  ediscoveryProjectManager: string;
  responsibleLawyerEmail: string;
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

  // Modal Templates
  @ViewChild('submitConfirmDialog') submitConfirmDialog!: TemplateRef<any>;
  @ViewChild('submittedSuccessDialog') submittedSuccessDialog!: TemplateRef<any>;
  @ViewChild('editClassActionDialog') editClassActionDialog!: TemplateRef<any>;
  @ViewChild('editSuccessDialog') editSuccessDialog!: TemplateRef<any>;

  private dialogRef?: MatDialogRef<any>;

  // Form Groups
  pauseForm!: FormGroup;
  searchForm!: FormGroup;
  editForm!: FormGroup;

  // Character limit guards
  isPauseClassActionMaxExceeded = false;
  isPauseManagerMaxExceeded = false;
  isPauseEmailMaxExceeded = false;

  isSearchClassActionMaxExceeded = false;
  isSearchManagerMaxExceeded = false;
  isSearchEmailMaxExceeded = false;

  isEditManagerMaxExceeded = false;
  isEditEmailMaxExceeded = false;

  // Edit State & Modal Error Banner
  editingRecordId: string | null = null;
  editModalErrorMessage: string | null = null;
  submittedDateDisplay = '';

  // API Criteria Payload Blueprint
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

  // Table & Pagination
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

  statusOptions = [
    { value: '', label: 'Select' },
    { value: 'Active (Paused)', label: 'Active (Paused)' },
    { value: 'Lifted', label: 'Lifted' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Submitted', label: 'Submitted' }
  ];

  // Mock data matching Figma rows
  private MOCK_DATA: PurgePauseRecord[] = [
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
    }
  ];

  ngOnInit(): void {
    this.initForms();
    this.fetchPurgePauseRecords();
  }

  private initForms(): void {
    // 1. Pause Form
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

    // 2. Search Form
    this.searchForm = this.fb.group({
      classActionProject: ['', [Validators.maxLength(100), Validators.pattern(/^[^*,<>]*$/)]],
      ediscoveryProjectManager: ['', [Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      responsibleLawyerEmail: ['', [Validators.email, Validators.maxLength(50)]],
      pauseStatus: ['']
    });

    // 3. Edit Form (Project is disabled / read-only)
    this.editForm = this.fb.group({
      classActionProject: [{ value: '', disabled: true }],
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
  }

  // --- Input Filtering & Limit Checks ---
  onBeforeInputCheck(event: Event, formType: 'pause' | 'search' | 'edit', controlName: string, maxLen: number): void {
    const inputEvent = event as InputEvent;

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

  onInputChange(formType: 'pause' | 'search' | 'edit', controlName: string, maxLen: number): void {
    let form: FormGroup;
    if (formType === 'pause') form = this.pauseForm;
    else if (formType === 'search') form = this.searchForm;
    else form = this.editForm;

    const val = form.get(controlName)?.value || '';
    if (val.length < maxLen) {
      this.setLimitFlag(formType, controlName, false);
      this.cdr.markForCheck();
    }
  }

  private setLimitFlag(formType: 'pause' | 'search' | 'edit', controlName: string, value: boolean): void {
    if (formType === 'pause') {
      if (controlName === 'classActionProject') this.isPauseClassActionMaxExceeded = value;
      if (controlName === 'ediscoveryProjectManager') this.isPauseManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isPauseEmailMaxExceeded = value;
    } else if (formType === 'search') {
      if (controlName === 'classActionProject') this.isSearchClassActionMaxExceeded = value;
      if (controlName === 'ediscoveryProjectManager') this.isSearchManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isSearchEmailMaxExceeded = value;
    } else {
      if (controlName === 'ediscoveryProjectManager') this.isEditManagerMaxExceeded = value;
      if (controlName === 'responsibleLawyerEmail') this.isEditEmailMaxExceeded = value;
    }
  }

  // ========================================================
  // FLOW 1: APPLY PURGE PAUSE
  // ========================================================
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

  onConfirmSubmitPause(): void {
    this.dialogRef?.close();

    const formValues = this.pauseForm.value;
    const now = new Date();
    this.submittedDateDisplay = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    // Provision for Future POST API:
    // this.purgePauseService.createPause(formValues).subscribe(...)
    console.log('API CALL PROVISION: [POST] /purge-pause', formValues);

    const newId = String(Date.now());
    const newRecord: PurgePauseRecord = {
      id: newId,
      classActionProject: formValues.classActionProject.trim(),
      pauseRequestDate: this.submittedDateDisplay,
      pauseLiftDate: '',
      pauseStatus: 'Submitted',
      ediscoveryProjectManager: formValues.ediscoveryProjectManager.trim(),
      responsibleLawyerEmail: formValues.responsibleLawyerEmail.trim()
    };
    this.MOCK_DATA.unshift(newRecord);

    this.dialogRef = this.dialog.open(this.submittedSuccessDialog, {
      width: '460px',
      panelClass: 'bmo-confirmation-dialog'
    });

    // Auto-transition to Active (Paused) in UI
    setTimeout(() => {
      const createdItem = this.MOCK_DATA.find(r => r.id === newId);
      if (createdItem && createdItem.pauseStatus === 'Submitted') {
        createdItem.pauseStatus = 'Active (Paused)';
        this.fetchPurgePauseRecords();
        this.cdr.markForCheck();
      }
    }, 6000);
  }

  onCloseSuccessDialog(): void {
    this.dialogRef?.close();
    this.onClearPause();
    this.fetchPurgePauseRecords();
  }

  onCancelDialog(): void {
    this.dialogRef?.close();
    this.editModalErrorMessage = null;
  }

  onClearPause(): void {
    this.isPauseClassActionMaxExceeded = false;
    this.isPauseManagerMaxExceeded = false;
    this.isPauseEmailMaxExceeded = false;
    this.pauseForm.reset();
  }

  // ========================================================
  // FLOW 2: EDIT CLASS ACTION (Modal & Confirmation)
  // ========================================================
  onEditRecord(record: PurgePauseRecord): void {
    this.editingRecordId = record.id;
    this.editModalErrorMessage = null;
    this.isEditManagerMaxExceeded = false;
    this.isEditEmailMaxExceeded = false;

    this.editForm.patchValue({
      classActionProject: record.classActionProject,
      ediscoveryProjectManager: record.ediscoveryProjectManager,
      responsibleLawyerEmail: record.responsibleLawyerEmail
    });

    this.dialogRef = this.dialog.open(this.editClassActionDialog, {
      width: '840px',
      panelClass: 'bmo-wide-modal-panel'
    });
  }

  onSaveEdit(): void {
    if (this.editForm.invalid || this.isEditManagerMaxExceeded || this.isEditEmailMaxExceeded) {
      this.editForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const editValues = this.editForm.getRawValue();

    // Provision for Future PATCH API:
    // this.purgePauseService.updateRecord(this.editingRecordId, editValues).subscribe(...)
    console.log(`API CALL PROVISION: [PATCH] /purge-pause/${this.editingRecordId}`, editValues);

    const target = this.MOCK_DATA.find(r => r.id === this.editingRecordId);
    if (target) {
      target.ediscoveryProjectManager = editValues.ediscoveryProjectManager.trim();
      target.responsibleLawyerEmail = editValues.responsibleLawyerEmail.trim();
    }

    this.dialogRef?.close();

    // Show Confirmation Modal after save
    this.dialogRef = this.dialog.open(this.editSuccessDialog, {
      width: '460px',
      panelClass: 'bmo-confirmation-dialog'
    });

    this.fetchPurgePauseRecords();
    this.cdr.markForCheck();
  }

  onCloseEditSuccessDialog(): void {
    this.dialogRef?.close();
    this.fetchPurgePauseRecords();
  }

  // ========================================================
  // SEARCH & TABLE DATA
  // ========================================================
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
    console.log('API CALL PROVISION: [POST] /purge-pause/search', this.buildSearchPayload());
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
      case 'Submitted':
        return 'status-submitted';
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

  paginationFrom(): number {
    return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRows);
  }
}


//purge-pause.component.html

<div class="purge-pause-wrapper">
  <!-- Page Header -->
  <div class="page-header">
    <h2 class="page-title">{{ 'Manage Purge Pause' | translate }}</h2>
  </div>

  <!-- ============================================== -->
  <!-- 1. PAUSE FORM CARD (Apply a Purge Pause)       -->
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
          {{ 'PAUSE' | translate }}
        </button>
      </div>
    </form>
  </div>

  <!-- ============================================== -->
  <!-- 2. SEARCH FORM CARD                            -->
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

        <!-- 4. Pause Status -->
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

      <!-- Action Buttons -->
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
            @for (record of displayedRecords; track record.id) {
              <tr>
                <td>{{ record.classActionProject }}</td>
                <td>{{ formatDate(record.pauseRequestDate) }}</td>
                <td>{{ formatDate(record.pauseLiftDate) || '-' }}</td>
                <td>
                  <span class="status-indicator" [ngClass]="getStatusClass(record.pauseStatus)">
                    <span class="status-dot"></span>
                    {{ record.pauseStatus }}
                  </span>
                </td>
                <td>{{ record.ediscoveryProjectManager }}</td>
                <td>{{ record.responsibleLawyerEmail }}</td>
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

    <!-- Pagination Controls -->
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

<!-- ======================================================== -->
<!-- MODAL 1: "SUBMIT PURGE PAUSE?" CONFIRMATION DIALOG       -->
<!-- ======================================================== -->
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
      <button type="button" class="bmo-btn-primary" (click)="onConfirmSubmitPause()">
        SUBMIT
      </button>
    </div>
  </div>
</ng-template>

<!-- ======================================================== -->
<!-- MODAL 2: "PURGE PAUSE REQUEST SUBMITTED" SUCCESS DIALOG   -->
<!-- ======================================================== -->
<ng-template #submittedSuccessDialog>
  <div class="bmo-modal-container">
    <div class="bmo-modal-header">
      <h3 class="bmo-modal-title">Purge pause request submitted</h3>
      <button type="button" class="bmo-modal-close-btn" (click)="onCloseSuccessDialog()" aria-label="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <div class="bmo-modal-body">
      <p class="bmo-modal-message">
        Purge Pause request has been submitted on {{ submittedDateDisplay }}.<br>
        Purge Pause status will be updated to 'Active (Paused)' within the following weekly purge cycle.
      </p>
    </div>
    <div class="bmo-modal-actions">
      <button type="button" class="bmo-btn-primary" (click)="onCloseSuccessDialog()">
        CLOSE
      </button>
    </div>
  </div>
</ng-template>

<!-- ======================================================== -->
<!-- MODAL 3: EDIT CLASS ACTION (3 Horizontal Columns)        -->
<!-- ======================================================== -->
<ng-template #editClassActionDialog>
  <div class="bmo-modal-container bmo-wide-edit-modal">
    <div class="bmo-modal-header">
      <h3 class="bmo-modal-title">Editing Purge Pause Request</h3>
      <button type="button" class="bmo-modal-close-btn" (click)="onCancelDialog()" aria-label="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- In-Modal Alert Banner (From Error Handling Screens) -->
    @if (editModalErrorMessage) {
      <div class="modal-error-alert-banner">
        <mat-icon class="alert-icon">error</mat-icon>
        <span class="alert-text">{{ editModalErrorMessage }}</span>
      </div>
    }

    <form [formGroup]="editForm" class="edit-modal-form">
      <div class="edit-modal-grid">
        <!-- 1. Class Action / Project (Read-Only) -->
        <div class="edit-field-col">
          <label class="modal-input-label">Class Action / Project *</label>
          <input
            type="text"
            class="modal-input modal-input-disabled"
            formControlName="classActionProject"
          />
        </div>

        <!-- 2. eDiscovery Project Manager -->
        <div class="edit-field-col">
          <label class="modal-input-label">eDiscovery Project Manager *</label>
          <input
            type="text"
            class="modal-input"
            [class.input-error]="(editForm.get('ediscoveryProjectManager')?.invalid && editForm.get('ediscoveryProjectManager')?.touched) || isEditManagerMaxExceeded"
            formControlName="ediscoveryProjectManager"
            (beforeinput)="onBeforeInputCheck($event, 'edit', 'ediscoveryProjectManager', 50)"
            (input)="onInputChange('edit', 'ediscoveryProjectManager', 50)"
          />
          @if (editForm.get('ediscoveryProjectManager')?.touched && editForm.get('ediscoveryProjectManager')?.hasError('required')) {
            <small class="modal-error-text">Enter eDiscovery Project Manager Name</small>
          }
          @if (editForm.get('ediscoveryProjectManager')?.hasError('pattern')) {
            <small class="modal-error-text">Special characters are not allowed</small>
          }
          @if (isEditManagerMaxExceeded || editForm.get('ediscoveryProjectManager')?.hasError('maxlength')) {
            <small class="modal-error-text">Name exceeds maximum allowed length</small>
          }
        </div>

        <!-- 3. Responsible Lawyer Email -->
        <div class="edit-field-col">
          <label class="modal-input-label">Responsible Lawyer Email *</label>
          <input
            type="email"
            class="modal-input"
            [class.input-error]="(editForm.get('responsibleLawyerEmail')?.invalid && editForm.get('responsibleLawyerEmail')?.touched) || isEditEmailMaxExceeded"
            formControlName="responsibleLawyerEmail"
            (beforeinput)="onBeforeInputCheck($event, 'edit', 'responsibleLawyerEmail', 50)"
            (input)="onInputChange('edit', 'responsibleLawyerEmail', 50)"
          />
          @if (editForm.get('responsibleLawyerEmail')?.touched && editForm.get('responsibleLawyerEmail')?.hasError('required')) {
            <small class="modal-error-text">Enter Responsible Lawyer Email</small>
          }
          @if (editForm.get('responsibleLawyerEmail')?.hasError('email')) {
            <small class="modal-error-text">Enter a valid email address</small>
          }
          @if (isEditEmailMaxExceeded || editForm.get('responsibleLawyerEmail')?.hasError('maxlength')) {
            <small class="modal-error-text">Email exceeds maximum allowed length</small>
          }
        </div>
      </div>

      <div class="bmo-modal-actions">
        <button type="button" class="bmo-btn-link" (click)="onCancelDialog()">
          CANCEL
        </button>
        <button type="button" class="bmo-btn-primary" (click)="onSaveEdit()">
          SAVE
        </button>
      </div>
    </form>
  </div>
</ng-template>

<!-- ======================================================== -->
<!-- MODAL 4: EDIT SUCCESS CONFIRMATION DIALOG                -->
<!-- ======================================================== -->
<ng-template #editSuccessDialog>
  <div class="bmo-modal-container">
    <div class="bmo-modal-header">
      <h3 class="bmo-modal-title">Purge pause request updated</h3>
      <button type="button" class="bmo-modal-close-btn" (click)="onCloseEditSuccessDialog()" aria-label="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <div class="bmo-modal-body">
      <p class="bmo-modal-message">
        Your changes to the Purge Pause record have been successfully updated.
      </p>
    </div>
    <div class="bmo-modal-actions">
      <button type="button" class="bmo-btn-primary" (click)="onCloseEditSuccessDialog()">
        CLOSE
      </button>
    </div>
  </div>
</ng-template>


// purge-pause.component.scss

// Wide Edit Modal Card (~840px)
.bmo-wide-edit-modal {
  width: 100%;
  max-width: 840px;
  padding: 28px 32px;
  box-sizing: border-box;

  .edit-modal-form {
    display: flex;
    flex-direction: column;
    margin-top: 16px;
  }

  // 3-Column horizontal grid matching Figma
  .edit-modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    align-items: flex-start;
    margin-bottom: 24px;

    .edit-field-col {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-bottom: 22px; // Reserves vertical space for error messages

      .modal-input-label {
        font-size: 14px;
        font-weight: 500;
        color: #333333;
        margin-bottom: 6px;
      }

      .modal-input {
        background-color: #ffffff !important;
        border: 1px solid #767676;
        border-radius: 4px;
        height: 42px;
        padding: 8px 12px;
        font-size: 14px;
        color: #1a1a1a;
        width: 100%;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
          border-color: #0079c1;
          box-shadow: 0 0 0 1px #0079c1;
        }

        &.modal-input-disabled {
          background-color: #f4f4f4 !important;
          color: #555555;
          border-color: #d3d3d3;
          cursor: not-allowed;
        }

        &.input-error {
          border-color: #a12000 !important;
          box-shadow: 0 0 0 1px #a12000;
        }
      }

      .modal-error-text {
        position: absolute;
        top: calc(100% - 18px);
        left: 0;
        color: #a12000;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }
    }
  }
}

// In-Modal System/Duplicate Error Alert Banner (from Error Handling Figma)
.modal-error-alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #fdf2f2;
  border: 1px solid #f5c2c7;
  border-left: 4px solid #a12000;
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 16px;

  .alert-icon {
    color: #a12000;
    font-size: 20px;
    width: 20px;
    height: 20px;
  }

  .alert-text {
    font-size: 13px;
    font-weight: 500;
    color: #842029;
  }
}



///Step 1: Open with the Exact Width in purge-pause.component.ts
//Make sure the dialog open call explicitly specifies width: '740px' and maxWidth: '90vw', 
// and handles the post-save confirmation modal:


// --- In purge-pause.component.ts ---

onEditRecord(record: PurgePauseRecord): void {
  this.editingRecordId = record.id;
  this.editModalErrorMessage = null;
  this.isEditManagerMaxExceeded = false;
  this.isEditEmailMaxExceeded = false;

  this.editForm.patchValue({
    classActionProject: record.classActionProject,
    ediscoveryProjectManager: record.ediscoveryProjectManager,
    responsibleLawyerEmail: record.responsibleLawyerEmail
  });

  // Pass 740px width and panelClass
  this.dialogRef = this.dialog.open(this.editClassActionDialog, {
    width: '740px',
    maxWidth: '90vw',
    panelClass: 'bmo-edit-dialog-panel'
  });
}

onSaveEdit(): void {
  if (this.editForm.invalid || this.isEditManagerMaxExceeded || this.isEditEmailMaxExceeded) {
    this.editForm.markAllAsTouched();
    this.cdr.markForCheck();
    return;
  }

  const editValues = this.editForm.getRawValue();

  // Mock row update
  const target = this.MOCK_DATA.find(r => r.id === this.editingRecordId);
  if (target) {
    target.ediscoveryProjectManager = editValues.ediscoveryProjectManager.trim();
    target.responsibleLawyerEmail = editValues.responsibleLawyerEmail.trim();
  }

  // Close edit modal
  this.dialogRef?.close();

  // Open post-save confirmation modal
  this.dialogRef = this.dialog.open(this.editSuccessDialog, {
    width: '460px',
    panelClass: 'bmo-confirmation-dialog'
  });

  this.fetchPurgePauseRecords();
  this.cdr.markForCheck();
}

onCloseEditSuccessDialog(): void {
  this.dialogRef?.close();
}


//Step 2: Clean Template for the Edit Modal in purge-pause.component.html
//Replace the #editClassActionDialog and #editSuccessDialog blocks with the exact 
// Figma layout (also ensuring the search button has a plain string literal):


<!-- Search button fix to permanently eliminate [OBJECT OBJECT] -->
<button type="button" class="search-pill-btn" (click)="onSearch()">
  {{ 'SEARCH' | translate }}
</button>

<!-- ======================================================== -->
<!-- MODAL 3: "EDITING PURGE PAUSE REQUEST" (Matching Figma)  -->
<!-- ======================================================== -->
<ng-template #editClassActionDialog>
  <div class="edit-modal-wrapper">
    <!-- Header -->
    <div class="edit-modal-header">
      <h3 class="edit-modal-title">Editing Purge Pause Request</h3>
      <button type="button" class="edit-modal-close-btn" (click)="onCancelDialog()" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Optional In-Modal Error Alert -->
    @if (editModalErrorMessage) {
      <div class="modal-error-alert-banner">
        <mat-icon class="alert-icon">error</mat-icon>
        <span class="alert-text">{{ editModalErrorMessage }}</span>
      </div>
    }

    <!-- Form: 3 Equal Horizontal Columns -->
    <form [formGroup]="editForm" class="edit-modal-form" (ngSubmit)="onSaveEdit()">
      <div class="edit-modal-grid">
        <!-- 1. Class Action / Project (Read-only / disabled) -->
        <div class="edit-col">
          <label class="edit-label" for="edit-class-action">Class Action / Project *</label>
          <input
            id="edit-class-action"
            type="text"
            class="edit-input edit-input-readonly"
            formControlName="classActionProject"
            readonly
          />
        </div>

        <!-- 2. eDiscovery Project Manager -->
        <div class="edit-col">
          <label class="edit-label" for="edit-manager">eDiscovery Project Manager *</label>
          <input
            id="edit-manager"
            type="text"
            class="edit-input"
            [class.input-error]="(editForm.get('ediscoveryProjectManager')?.invalid && editForm.get('ediscoveryProjectManager')?.touched) || isEditManagerMaxExceeded"
            formControlName="ediscoveryProjectManager"
            (beforeinput)="onBeforeInputCheck($event, 'edit', 'ediscoveryProjectManager', 50)"
            (input)="onInputChange('edit', 'ediscoveryProjectManager', 50)"
          />
          @if (editForm.get('ediscoveryProjectManager')?.touched && editForm.get('ediscoveryProjectManager')?.hasError('required')) {
            <small class="edit-field-error">Enter eDiscovery Project Manager Name</small>
          }
          @if (editForm.get('ediscoveryProjectManager')?.hasError('pattern')) {
            <small class="edit-field-error">Special characters are not allowed</small>
          }
          @if (isEditManagerMaxExceeded || editForm.get('ediscoveryProjectManager')?.hasError('maxlength')) {
            <small class="edit-field-error">Name exceeds maximum allowed length</small>
          }
        </div>

        <!-- 3. Responsible Lawyer Email -->
        <div class="edit-col">
          <label class="edit-label" for="edit-email">Responsible Lawyer Email *</label>
          <input
            id="edit-email"
            type="email"
            class="edit-input"
            [class.input-error]="(editForm.get('responsibleLawyerEmail')?.invalid && editForm.get('responsibleLawyerEmail')?.touched) || isEditEmailMaxExceeded"
            formControlName="responsibleLawyerEmail"
            (beforeinput)="onBeforeInputCheck($event, 'edit', 'responsibleLawyerEmail', 50)"
            (input)="onInputChange('edit', 'responsibleLawyerEmail', 50)"
          />
          @if (editForm.get('responsibleLawyerEmail')?.touched && editForm.get('responsibleLawyerEmail')?.hasError('required')) {
            <small class="edit-field-error">Enter Responsible Lawyer Email</small>
          }
          @if (editForm.get('responsibleLawyerEmail')?.hasError('email')) {
            <small class="edit-field-error">Enter a valid email address</small>
          }
          @if (isEditEmailMaxExceeded || editForm.get('responsibleLawyerEmail')?.hasError('maxlength')) {
            <small class="edit-field-error">Email exceeds maximum allowed length</small>
          }
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="edit-modal-actions">
        <button type="button" class="btn-cancel" (click)="onCancelDialog()">
          CANCEL
        </button>
        <button type="submit" class="btn-save">
          SAVE
        </button>
      </div>
    </form>
  </div>
</ng-template>

<!-- ======================================================== -->
<!-- MODAL 4: EDIT SUCCESS CONFIRMATION DIALOG                -->
<!-- ======================================================== -->
<ng-template #editSuccessDialog>
  <div class="bmo-modal-container">
    <div class="bmo-modal-header">
      <h3 class="bmo-modal-title">Purge pause request updated</h3>
      <button type="button" class="bmo-modal-close-btn" (click)="onCloseEditSuccessDialog()" aria-label="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <div class="bmo-modal-body">
      <p class="bmo-modal-message">
        Your changes to the Purge Pause record have been successfully updated.
      </p>
    </div>
    <div class="bmo-modal-actions">
      <button type="button" class="bmo-btn-primary" (click)="onCloseEditSuccessDialog()">
        CLOSE
      </button>
    </div>
  </div>
</ng-template>


//Step 3: Exact SCSS for the Edit Modal in purge-pause.component.scss
//Add these styles to purge-pause.component.scss (including 
// ::ng-deep on .bmo-edit-dialog-panel


// Override Angular Material's panel constraints for the wide edit dialog
::ng-deep .bmo-edit-dialog-panel {
  .mat-mdc-dialog-container,
  .mdc-dialog__surface {
    max-width: 760px !important;
    width: 740px !important;
    border-radius: 4px !important;
    padding: 0 !important;
    background-color: #ffffff !important;
    overflow: visible !important;
  }
}

// Edit Modal Content Styles
.edit-modal-wrapper {
  padding: 24px 28px 20px 28px;
  background-color: #ffffff;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: 'BMO Sans', Arial, sans-serif;

  .edit-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .edit-modal-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }

    .edit-modal-close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #666666;
      padding: 0;
      display: inline-flex;
      align-items: center;

      &:hover {
        color: #1a1a1a;
      }
    }
  }

  // Horizontal 3-column row matching Figma
  .edit-modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 24px;

    .edit-col {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-bottom: 20px; // Space for validation error text

      .edit-label {
        font-size: 13px;
        font-weight: 600;
        color: #333333;
        margin-bottom: 6px;
        white-space: nowrap; // Keeps labels on a single clean line
      }

      .edit-input {
        background-color: #ffffff !important;
        border: 1px solid #767676;
        border-radius: 4px;
        height: 38px;
        padding: 6px 12px;
        font-size: 13px;
        color: #1a1a1a;
        box-sizing: border-box;
        width: 100%;
        outline: none;

        &:focus {
          border-color: #0079c1;
          box-shadow: 0 0 0 1px #0079c1;
        }

        &.edit-input-readonly {
          background-color: #f4f4f4 !important;
          color: #555555;
          border-color: #d3d3d3;
          cursor: not-allowed;
        }

        &.input-error {
          border-color: #a12000 !important;
          box-shadow: 0 0 0 1px #a12000;
        }
      }

      .edit-field-error {
        position: absolute;
        top: calc(100% - 16px);
        left: 0;
        color: #a12000;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
      }
    }
  }

  // Footer Actions
  .edit-modal-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;

    .btn-cancel {
      background: transparent;
      border: none;
      color: #0079c1;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 8px 14px;
      letter-spacing: 0.3px;
      text-transform: uppercase;

      &:hover {
        text-decoration: underline;
      }
    }

    .btn-save {
      background-color: #0079c1;
      color: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 8px 24px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        background-color: #005a91;
      }
    }
  }
}
