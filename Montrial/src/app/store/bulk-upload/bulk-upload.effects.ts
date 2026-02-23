import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BulkUploadActions } from './bulk-upload.actions';
import { LegalHoldActions } from '../legal-hold/legal-hold.actions';
import { BulkUploadService } from '../../core/services/bulk-upload.service';
import { map, mergeMap, catchError, of } from 'rxjs';

export const processBulkUpload$ = createEffect(
  (actions$ = inject(Actions), service = inject(BulkUploadService)) => {
    return actions$.pipe(
      ofType(BulkUploadActions.uploadFile),
      mergeMap(({ file }) => service.uploadProfiles(file).pipe(
        mergeMap((newProfiles) => [
          BulkUploadActions.uploadSuccess({ profiles: newProfiles }),
          // BRIDGE: Add to Grid AND Selection Panel simultaneously
          LegalHoldActions.addSuccess({ profiles: newProfiles })
        ]),
        catchError(err => of(BulkUploadActions.uploadFailure({ error: err.message })))
      ))
    );
  }, { functional: true }
);