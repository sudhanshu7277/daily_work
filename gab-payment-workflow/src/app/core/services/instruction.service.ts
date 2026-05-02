import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PaymentInstruction } from '../models/instruction.model';

@Injectable({ providedIn: 'root' })
export class InstructionService {
  
  // Simulates POST /api/v1/instructions/draft
  saveForLater(payload: Partial<PaymentInstruction>): Observable<PaymentInstruction> {
    const mockResponse: PaymentInstruction = {
      ...payload,
      referenceId: `GAB-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Draft',
    } as PaymentInstruction;
    
    // Simulate 800ms network latency
    return of(mockResponse).pipe(delay(800)); 
  }

  // Simulates POST /api/v1/instructions/submit
  submitInstruction(payload: PaymentInstruction): Observable<{ success: boolean, message: string }> {
    return of({ success: true, message: 'Routed to Checker Queue' }).pipe(delay(1000));
  }

  // Checker Save Draft API
  saveCheckerDraft(payload: any): Observable<any> {
    return of({ success: true, referenceId: payload.instructionId, updatedAt: new Date() }).pipe(delay(800));
  }

  // Checker Submit/Approve API
  submitCheckerApproval(payload: any): Observable<any> {
    // In reality, backend verifies the Dual Blind Amount matches the Maker's Amount
    return of({ success: true, message: 'Signature Validation Pending' }).pipe(delay(1000));
  }

  // Simulate OCR Data Extraction API
  extractDataFromDocument(file: File): Observable<any> {
    // In real life, you'd send `file` via FormData to your backend.
    // Here we simulate a 2-second processing delay, then return parsed data.
    return of({
      client: 'GLOBAL TECH LLC',
      region: 'EMEA',
      country: 'GERMANY',
      requestType: 'Payment Processing',
      source: 'Document Upload',
      valueDate: '2026-05-05',
      dueDate: '2026-05-05',
      transactionDate: '2026-05-02',
      currency: 'EUR',
      amount: 150000,
      transactionType: 'Wire Transfer',
      awsAccount: 'AWS-10029',
      debitAccountNumber: 'DE1029384756',
      exception: 'None'
    }).pipe(delay(2000));
  }
}