//1. In purge-pause.component.ts
//Replace the customer-search and bulk-upload debris with the 
// two distinct forms, the confirmation modal handlers, and the edit handler:


import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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

  // Two Separate Forms
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

  // Track editing state
  isEditing = false;
  editingRecordId: string | null = null;

  // Pause Status dropdown options for Search form
  statusOptions = [
    { value: '', label: 'Select' },
    { value: 'Active (Paused)', label: 'Active (Paused)' },
    { value: 'Lifted', label: 'Lifted' },
    { value: 'Failed', label: 'Failed' }
  ];

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    // 1. Pause Form (All 3 fields Mandatory)
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

    // 2. Search Form (Optional filter fields)
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

    // Backspace / Delete
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

    // Open "Submit Purge Pause?" confirmation dialog
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

    // Ready for future API integration
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

    console.log('Searching Purge Pause records:', this.searchForm.value);
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

  // --- Edit Functionality Hook ---
  onEditRecord(record: any): void {
    this.isEditing = true;
    this.editingRecordId = record?.id || null;

    // Prefill the top Pause form with the selected row's data
    this.pauseForm.patchValue({
      classActionProject: record.classActionProject || record.fileName || '',
      ediscoveryProjectManager: record.ediscoveryProjectManager || '',
      responsibleLawyerEmail: record.responsibleLawyerEmail || ''
    });

    // Reset error flags
    this.isPauseClassActionMaxExceeded = false;
    this.isPauseManagerMaxExceeded = false;
    this.isPauseEmailMaxExceeded = false;

    // Smooth scroll back up to the Pause form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }
}


//2. In purge-pause.component.htmlReplace the forms 
// section (lines 1 to ~307) with this clean markup, and 
// attach onEditRecord(record) to the edit icon in the existing table:   

<div class="purge-pause-wrapper">
  <!-- Page Header -->
  <div class="page-header">
    <h2 class="page-title">{{ 'Manage Purge Pause' | translate }}</h2>
  </div>

  <!-- ============================================== -->
  <!-- 1. PAUSE FORM CARD                             -->
  <!-- ============================================== -->
  <div class="purge-pause-content-section-one">
    <div class="purge-heading">
      <h2>{{ 'Pause' | translate }}</h2>
    </div>

    <form [formGroup]="pauseForm" class="purge-pausing-form-container" aria-live="polite">
      <div class="purge-form-grid">
        <!-- 1. Class Action / Project (Mandatory) -->
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

        <!-- 2. eDiscovery Project Manager (Mandatory) -->
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

        <!-- 3. Responsible Lawyer Email (Mandatory) -->
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

  <br><br>

  <!-- ============================================== -->
  <!-- 2. SEARCH FORM CARD                            -->
  <!-- ============================================== -->
  <div class="purge-pause-content-section-two">
    <div class="purge-search-heading">
      <h2>{{ 'Search' | translate }}</h2>
    </div>

    <form [formGroup]="searchForm" class="purge-pausing-form-container" aria-live="polite">
      <div class="purge-form-grid search-grid">
        <!-- 1. Class Action / Project (Optional) -->
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

        <!-- 2. eDiscovery Project Manager (Optional) -->
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

        <!-- 3. Responsible Lawyer Email (Optional) -->
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

        <!-- 4. Pause Status (Dropdown Filter) -->
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

    <!-- [LEAVE YOUR EXISTING GRID / TABLE / PAGINATION CODE RIGHT HERE] -->
    <!-- Inside your existing table rows, wire the edit button: -->
    <!-- (click)="onEditRecord(record)" -->

  </div>
</div>

<!-- ============================================== -->
<!-- 3. "SUBMIT PURGE PAUSE?" CONFIRMATION MODAL    -->
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


//3. Modal Styling in purge-pause.component.scss
// Add styles to match the Figma popup in i

.bmo-modal-container {
  padding: 24px;
  background: #ffffff;
  border-radius: 4px;

  .bmo-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .bmo-modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
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
      color: #0079c1;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;
      padding: 8px 16px;
    }

    .bmo-btn-primary {
      background-color: #0079c1;
      color: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 8px 24px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;

      &:hover {
        background-color: #005a91;
      }
    }
  }
}
