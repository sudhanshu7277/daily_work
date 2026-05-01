import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { InstructionService } from '@core/services/instruction.service';
import { PaymentActions } from './payment.actions';

@Injectable()
export class PaymentEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(InstructionService);

  loadQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.loadQueue),
      switchMap(() =>
        this.service
          .list({
            status: ['payment-pending', 'payment-in-progress', 'payment-completed'],
          })
          .pipe(
            map(({ data }) => PaymentActions.loadQueueSuccess({ data })),
            catchError((err: { message?: string }) =>
              of(PaymentActions.loadQueueFailure({ error: err.message ?? 'Failed' }))
            )
          )
      )
    )
  );
}
