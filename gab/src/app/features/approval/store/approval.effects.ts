import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { InstructionService } from '@core/services/instruction.service';
import { ApprovalActions } from './approval.actions';

@Injectable()
export class ApprovalEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(InstructionService);

  loadQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalActions.loadQueue),
      switchMap(() =>
        this.service
          .list({
            status: [
              'admin-maker',
              'admin-checker',
              'signature-validation',
              'operations-callback',
            ],
          })
          .pipe(
            map(({ data }) => ApprovalActions.loadQueueSuccess({ data })),
            catchError((err: { message?: string }) =>
              of(ApprovalActions.loadQueueFailure({ error: err.message ?? 'Failed' }))
            )
          )
      )
    )
  );

  advance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalActions.advance),
      switchMap(({ id }) =>
        this.service.advance(id).pipe(
          map((instruction) => ApprovalActions.advanceSuccess({ instruction })),
          catchError((err: { message?: string }) =>
            of(ApprovalActions.advanceFailure({ error: err.message ?? 'Failed' }))
          )
        )
      )
    )
  );
}
