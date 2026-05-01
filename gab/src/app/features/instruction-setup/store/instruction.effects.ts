import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { InstructionService } from '@core/services/instruction.service';
import { InstructionActions } from './instruction.actions';

@Injectable()
export class InstructionEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(InstructionService);
  private readonly router = inject(Router);

  loadList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionActions.loadList),
      switchMap(({ filters, pagination }) =>
        this.service.list(filters, pagination).pipe(
          map(({ data, total }) => InstructionActions.loadListSuccess({ data, total })),
          catchError((err: { message?: string }) =>
            of(InstructionActions.loadListFailure({ error: err.message ?? 'Failed to load' }))
          )
        )
      )
    )
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionActions.loadOne),
      switchMap(({ id }) =>
        this.service.getById(id).pipe(
          map((instruction) => InstructionActions.loadOneSuccess({ instruction })),
          catchError((err: { message?: string }) =>
            of(InstructionActions.loadOneFailure({ error: err.message ?? 'Not found' }))
          )
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionActions.create),
      switchMap(({ payload }) =>
        this.service.create(payload).pipe(
          map((instruction) => InstructionActions.createSuccess({ instruction })),
          catchError((err: { message?: string }) =>
            of(InstructionActions.createFailure({ error: err.message ?? 'Create failed' }))
          )
        )
      )
    )
  );

  /** Navigate to detail after successful create. */
  createSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InstructionActions.createSuccess),
        tap(({ instruction }) => this.router.navigate(['/instructions', instruction.id]))
      ),
    { dispatch: false }
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstructionActions.update),
      switchMap(({ id, payload }) =>
        this.service.update(id, payload).pipe(
          map((instruction) => InstructionActions.updateSuccess({ instruction })),
          catchError((err: { message?: string }) =>
            of(InstructionActions.updateFailure({ error: err.message ?? 'Update failed' }))
          )
        )
      )
    )
  );
}
