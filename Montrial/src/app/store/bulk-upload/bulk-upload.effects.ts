import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BulkUploadService } from '../../core/services/bulk-upload.service';
import { BulkUploadActions } from './bulk-upload.actions';
import { LegalHoldActions } from '../legal-hold/legal-hold.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

export const processBulkUpload$ = createEffect(
  (actions$ = inject(Actions), service = inject(BulkUploadService)) => {
    return actions$.pipe(
      ofType(BulkUploadActions.uploadFile),
      mergeMap(({ file }) => 
        service.uploadProfiles(file).pipe(
          mergeMap((newProfiles) => [
            // 1. Update the Bulk Upload status
            BulkUploadActions.uploadSuccess({ profiles: newProfiles }),
            // 2. BRIDGE: Push these into the Grid & Selection Panel
            LegalHoldActions.addSuccess({ profiles: newProfiles })
          ]),
          catchError(error => of(BulkUploadActions.uploadFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);