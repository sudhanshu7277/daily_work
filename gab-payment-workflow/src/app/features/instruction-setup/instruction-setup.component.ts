import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';

// NgRx Actions & Selectors
import { InstructionApiActions } from '../../store/instruction/instruction.actions';
import { UiActions } from '../../store/ui/ui.actions';
import { selectLastSavedInstruction } from '../../store/instruction/instruction.selectors';

@Component({
  selector: 'app-instruction-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './instruction-setup.component.html',
  styleUrls: ['./instruction-setup.component.scss']
})
export class InstructionSetupComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  instructionForm!: FormGroup;
  showCancelModal = false;
  saveSuccessData: any = null;

  // Edit/Rework Mode Flags
  isEditMode = false;
  editInstructionId: string | null = null;

  // Smart Extraction State (Selecting directly from the feature slice)
  isExtracting$ = this.store.select(state => (state as any).instruction.isExtracting);

  // Mock Dropdown Data
  clients = ['MSU ENERGY SA', 'CAMORIM SERVICOS', 'GLOBAL TECH LLC', 'ALPHA HOLDINGS'];
  currencies = ['USD', 'EUR', 'BRL', 'GBP'];
  regions = ['LATAM', 'EMEA', 'APAC', 'NAM'];
  mppOptions = ['Yes', 'No'];
  exceptionOptions = ['Internal', 'External', 'None'];

  ngOnInit() {
    this.initForm();

    // 1. Check for Rework Mode via Query Params
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.editInstructionId = params['edit'];
        if (this.editInstructionId) {
          this.loadDataForRework(this.editInstructionId);
        }
      }
    });

    // 2. Listen for Extracted OCR Data (Only apply if NOT in edit mode)
    this.store.select(state => (state as any).instruction.extractedData).subscribe(data => {
      if (data && !this.isEditMode) {
        this.instructionForm.patchValue(data);
        this.instructionForm.markAsDirty(); // Highlights to the user that form state changed
      }
    });

    // 3. Listen for Save Success
    this.store.select(selectLastSavedInstruction).subscribe(data => {
      if (data) this.saveSuccessData = data;
    });
  }

  ngOnDestroy() {
    this.store.dispatch(InstructionApiActions.resetSavedState());
    this.store.dispatch(InstructionApiActions.clearExtractedData());
  }

  private initForm() {
    this.instructionForm = this.fb.group({
      region: ['', Validators.required],
      country: ['', Validators.required],
      client: ['', Validators.required],
      requestType: ['Administrative Transaction', Validators.required],
      source: ['Email', Validators.required],
      valueDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      transactionDate: ['', Validators.required],
      awsAccount: [''],
      debitAccountNumber: [''],
      transactionSystem: [''],
      currency: ['USD', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      transactionType: [''],
      releaseRequired: [true],
      mppRequired: ['No', Validators.required],
      exception: ['Internal', Validators.required]
    });
  }

  private loadDataForRework(id: string) {
    setTimeout(() => {
      const mockRejectedData = {
        region: 'LATAM',
        country: 'ARGENTINA',
        client: 'MSU ENERGY SA',
        requestType: 'Administrative Transaction',
        source: 'Email',
        valueDate: '2026-05-12', 
        dueDate: '2026-05-15',
        transactionDate: '2026-05-10',
        awsAccount: 'AWS-90210',
        debitAccountNumber: '10029938475',
        transactionSystem: 'CitiDirect',
        currency: 'EUR', 
        amount: 85000,
        transactionType: 'Wire',
        releaseRequired: true,
        mppRequired: 'No',
        exception: 'Internal'
      };

      this.instructionForm.patchValue(mockRejectedData);
      
      this.store.dispatch(UiActions.showNotification({ 
        message: `Loaded ${id} for Admin Rework. Fix issues and resubmit.`, 
        toastType: 'info' 
      }));
    }, 400);
  }

  // --- Document Upload Logic ---
  
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      if (file.type !== 'application/pdf') {
        this.store.dispatch(UiActions.showNotification({ message: 'Please upload a PDF document.', toastType: 'error' }));
        return;
      }

      if (file.size > 1536000) { // 1500KB
        this.store.dispatch(UiActions.showNotification({ message: 'File size exceeds the 1500KB limit.', toastType: 'error' }));
        return;
      }

      this.store.dispatch(InstructionApiActions.extractDocument({ file }));
      event.target.value = ''; // Reset input
    }
  }

  // --- UI Actions ---

  triggerCancel() {
    this.showCancelModal = true;
  }

  confirmCancel() {
    this.showCancelModal = false;
    this.instructionForm.reset();
    const routeTarget = this.isEditMode ? ['/instruction/maker-queue'] : ['/dashboard'];
    this.router.navigate(routeTarget);
  }

  triggerSave() {
    if (this.instructionForm.valid) {
      this.store.dispatch(InstructionApiActions.saveDraft({ payload: this.instructionForm.value }));
    } else {
      this.instructionForm.markAllAsTouched();
      this.store.dispatch(UiActions.showNotification({ message: 'Please fill out all required fields (*)', toastType: 'error' }));
    }
  }

  triggerSubmit() {
    if (this.instructionForm.valid) {
      const finalPayload = {
        ...this.instructionForm.value,
        instructionId: this.isEditMode ? this.editInstructionId : null
      };
      this.store.dispatch(InstructionApiActions.submitInstruction({ payload: finalPayload }));
    } else {
      this.instructionForm.markAllAsTouched();
      this.store.dispatch(UiActions.showNotification({ message: 'Please complete all required fields before proceeding.', toastType: 'error' }));
    }
  }
}