import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { InstructionService } from '../../core/services/instruction.service';
import { InstructionApiActions } from './instruction.actions';
import { UiActions } from '../ui/ui.actions';

@Injectable()
export class InstructionEffects {
  private actions$ = inject(Actions);
  private apiService = inject(InstructionService);
  private router = inject(Router);

  // 1. Intercept 'Save Draft' and call the API
  saveDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.saveDraft),
      // Fix: Add (action: any)
      mergeMap((action: any) => 
        this.apiService.saveForLater(action.payload).pipe(
          // Fix: Add (response: any)
          map((response: any) => InstructionApiActions.saveDraftSuccess({ response })),
          catchError((error: any) => of(InstructionApiActions.submitFailure({ error: error.message })))
        )
      )
    )
  );

  // 2. On successful save, trigger a global success toast notification
  submitSuccessNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.submitSuccess),
      // Fix: Add (action: any)
      map((action: any) => UiActions.showNotification({ 
        message: `Success: ${action.message}`, 
        toastType: 'success' 
      }))
    )
  );

  // 3. Intercept 'Submit Instruction' and call the API
  submitInstruction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.submitInstruction),
      // Fix: Add (action: any)
      mergeMap((action: any) => 
        this.apiService.submitInstruction(action.payload).pipe(
          // Fix: Add (response: any)
          map((response: any) => InstructionApiActions.submitSuccess({ message: response.message })),
          catchError((error: any) => of(InstructionApiActions.submitFailure({ error: error.message })))
        )
      )
    )
  );

  // 4. On successful submit, route the user to the queue AND show a notification
  submitSuccessRouting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.submitSuccess),
      tap(() => {
        // Navigate the user away from the form to the Checker Queue
        this.router.navigate(['/instruction/queue']);
      }),
      map(action => UiActions.showNotification({ 
        message: `Success: ${action.message}`, 
        toastType: 'success' 
      }))
    )
  );

  // 5. Global Error Handler: Show an error toast for any API failure
  handleFailures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.saveDraftFailure, InstructionApiActions.submitFailure),
      map(action => UiActions.showNotification({ 
        message: `Error: ${action.error}`, 
        toastType: 'error' 
      }))
    )
  );

  saveCheckerDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.saveCheckerDraft),
      mergeMap(action => this.apiService.saveCheckerDraft(action.payload).pipe(
          map(response => InstructionApiActions.saveCheckerDraftSuccess({ response })),
          catchError(error => of(InstructionApiActions.submitFailure({ error: error.message })))
      ))
    )
  );

  submitCheckerApproval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.submitCheckerApproval),
      mergeMap(action => this.apiService.submitCheckerApproval(action.payload).pipe(
          tap(() => this.router.navigate(['/dashboard'])),
          map(response => UiActions.showNotification({ message: `Success: ${response.message}`, toastType: 'success' })),
          catchError(error => of(InstructionApiActions.submitFailure({ error: error.message })))
      ))
    )
  );

  extractDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.extractDocument),
      // Fix: Add (action: any)
      mergeMap((action: any) =>
        this.apiService.extractDataFromDocument(action.file).pipe(
          // Fix: Add (data: any)
          map((data: any) => InstructionApiActions.extractDocumentSuccess({ data })),
          catchError((error: any) => of(InstructionApiActions.extractDocumentFailure({ error: error.message })))
        )
      )
    )
  );

  extractSuccessNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.extractDocumentSuccess),
      map(() => UiActions.showNotification({ 
        message: 'Document analyzed! Form populated successfully.', 
        toastType: 'success' 
      }))
    )
  );

  saveDraftSuccessNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionApiActions.saveDraftSuccess),
      // Fix: Add (action: any)
      map((action: any) => UiActions.showNotification({ 
        message: `Draft saved successfully! Ref: ${action.response.referenceId}`, 
        toastType: 'info' 
      }))
    )
  );
}