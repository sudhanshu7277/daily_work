import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

// Shared UI & Child Components
import { WorkflowStepperComponent, WorkflowStep } from '../../../shared/ui/workflow-stepper/workflow-stepper.component';
import { InstructionAttachmentsComponent } from '../components/instruction-attachments/instruction-attachments.component';
import { CommentsLogComponent } from '../components/comments-log/comments-log.component';

// State Actions
import { InstructionApiActions } from '../../../store/instruction/instruction.actions';
import { UiActions } from '../../../store/ui/ui.actions';
import { SignatureValidationComponent } from '../components/signature-validation/ignature-validation.component';

@Component({
  selector: 'app-checker-view',
  standalone: true,
  imports: [
    CommonModule, 
    CurrencyPipe, 
    DatePipe, 
    ReactiveFormsModule,
    WorkflowStepperComponent, 
    SignatureValidationComponent, 
    InstructionAttachmentsComponent, 
    CommentsLogComponent
  ],
  templateUrl: './checker-view.component.html',
  styleUrls: ['./checker-view.component.scss']
})
export class CheckerViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  instructionId: string = 'GAB-XXXX';
  checkerForm!: FormGroup;
  
  // Modal toggles
  showSaveModal = false;
  showRejectModal = false;

  // Visual workflow stepper
  currentSteps: WorkflowStep[] = [
    { label: 'Admin Maker', status: 'completed' },
    { label: 'Admin Checker', status: 'active' },
    { label: 'Signature Validation', status: 'pending' },
    { label: 'Callback', status: 'pending' }
  ];

  // Dummy Data representing the original Maker submission
  makerData = {
    client: 'MSU ENERGY SA',
    region: 'LATAM',
    country: 'ARGENTINA',
    requestType: 'Administrative Transaction',
    source: 'Email',
    valueDate: '2026-05-12',
    dueDate: '2026-05-15',
    currency: 'USD',
    originalAmount: 500000 // In a real app, this is validated on the backend
  };

  // Mock AG Grid Data
  mockDocuments = [
    { documentName: 'Auth_Signatures.pdf', documentType: 'Client Authorization', region: 'LATAM', documentDated: '07 Sep 2025', dmcUpload: false, uploadedBy: 'Oliver Sally', uploadedOn: '08 Sep 2025 9:15 AM' }
  ];
  mockComments = [
    { commentType: 'Admin Maker', comment: 'Initial documents uploaded.', commentedBy: 'Oliver Sally', commentedOn: '08 Sep 2025 9:20 AM' }
  ];

  ngOnInit(): void {
    this.instructionId = this.route.snapshot.paramMap.get('id') || 'GAB-0000';
    this.initHybridForm();
  }

  private initHybridForm() {
    // 1. Build the form with Maker Data + the Dual Blind Field
    this.checkerForm = this.fb.group({
      client: [this.makerData.client],
      region: [this.makerData.region],
      valueDate: [this.makerData.valueDate],
      currency: [this.makerData.currency],
      
      // Dual Blind Keying Field - Must be greater than 0
      amountEntered: [null, [Validators.required, Validators.min(1)]] 
    });

    // 2. Disable the entire form to make it strictly read-only
    this.checkerForm.disable();

    // 3. Re-enable ONLY the Amount field for the Checker to input
    this.checkerForm.get('amountEntered')?.enable();
  }

  // --- Workflow Actions ---

  cancel() {
    this.router.navigate(['/instruction/queue']);
  }

  saveForLater() {
    this.showSaveModal = true;
  }

  confirmSave() {
    this.showSaveModal = false;
    this.store.dispatch(InstructionApiActions.saveCheckerDraft({ 
      payload: { instructionId: this.instructionId, amount: this.checkerForm.get('amountEntered')?.value } 
    }));
    this.store.dispatch(UiActions.showNotification({ message: 'Checker draft saved successfully.', toastType: 'info' }));
  }

  rejectInstruction() {
    this.showRejectModal = true;
  }

  confirmReject() {
    this.showRejectModal = false;
    this.store.dispatch(UiActions.showNotification({ message: `Instruction ${this.instructionId} routed back to Maker for rework.`, toastType: 'error' }));
    this.router.navigate(['/instruction/queue']);
  }

  submitApproval() {
    if (this.checkerForm.get('amountEntered')?.valid) {
      this.store.dispatch(InstructionApiActions.submitCheckerApproval({ 
        payload: { 
          instructionId: this.instructionId, 
          verifiedAmount: this.checkerForm.get('amountEntered')?.value 
        } 
      }));
    } else {
      this.checkerForm.get('amountEntered')?.markAsTouched();
    }
  }

  handleDocumentUpload() {
    this.store.dispatch(UiActions.showNotification({ message: 'Upload Document triggered.', toastType: 'info' }));
  }
}