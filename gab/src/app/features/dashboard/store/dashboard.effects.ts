import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardActions } from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(DashboardService);

  loadSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadSummary),
      switchMap(() =>
        this.service.getSummary().pipe(
          map((summary) => DashboardActions.loadSummarySuccess({ summary })),
          catchError((err: { message?: string }) =>
            of(DashboardActions.loadSummaryFailure({ error: err.message ?? 'Failed to load' }))
          )
        )
      )
    )
  );
}
