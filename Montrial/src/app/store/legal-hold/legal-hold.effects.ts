import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { LegalHoldService } from '../../core/services/legal-hold.service';
import { LegalHoldActions } from './legal-hold.actions';

/**
 * Functional Effects (Angular 18+ Style)
 * These handle the asynchronous API calls for the Legal Hold feature.
 */

// 1. Fetch Profiles Effect
// Listens for 'Load Profiles', calls the API, and dispatches Success or Failure
export const loadProfiles$ = createEffect(
  (actions$ = inject(Actions), service = inject(LegalHoldService)) => {
    return actions$.pipe(
      ofType(LegalHoldActions.loadProfiles),
      mergeMap(({ query }) => 
        service.getProfiles(query).pipe(
          map(profiles => LegalHoldActions.loadSuccess({ profiles })),
          catchError(error => of(LegalHoldActions.loadFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// 2. Delete Profile Effect
// Handles global deletion requests from any component in the app
export const deleteProfile$ = createEffect(
  (actions$ = inject(Actions), service = inject(LegalHoldService)) => {
    return actions$.pipe(
      ofType(LegalHoldActions.deleteProfile),
      mergeMap(({ id }) => 
        service.deleteProfile(id).pipe(
          map(() => LegalHoldActions.deleteSuccess({ id })),
          catchError(error => of(LegalHoldActions.deleteFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// 3. Add Profile Effect (Optional)
// Handles manual additions if you build an "Add Record" form in the future
export const addProfile$ = createEffect(
  (actions$ = inject(Actions), service = inject(LegalHoldService)) => {
    return actions$.pipe(
      ofType(LegalHoldActions.addProfile),
      mergeMap(({ profile }) => 
        service.addProfile(profile).pipe(
          map(newProfile => LegalHoldActions.addSuccess({ profiles: [newProfile] })),
          catchError(error => of(LegalHoldActions.loadFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

export const updateProfile$ = createEffect(
    (actions$ = inject(Actions), service = inject(LegalHoldService)) => 
      actions$.pipe(
        ofType(LegalHoldActions.updateProfile),
        mergeMap(({ id, changes }) => 
          service.updateProfile(id, changes).pipe(
            map(updatedProfile => LegalHoldActions.updateSuccess({ profile: updatedProfile })),
            catchError(err => of(LegalHoldActions.updateFailure({ error: err.message })))
          )
        )
      ), { functional: true }
  );