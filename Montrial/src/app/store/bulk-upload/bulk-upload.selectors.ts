import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BulkUploadState } from './bulk-upload.reducer';

export const selectBulkUploadState = createFeatureSelector<BulkUploadState>('bulkUpload');

export const selectIsUploading = createSelector(
  selectBulkUploadState,
  (state) => state.isUploading
);

export const selectUploadError = createSelector(
  selectBulkUploadState,
  (state) => state.error
);