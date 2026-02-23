import { createReducer, on } from '@ngrx/store';
import { BulkUploadActions } from './bulk-upload.actions';

export interface BulkUploadState {
  isUploading: boolean;
  error: string | null;
  lastUploadedCount: number;
}

export const initialState: BulkUploadState = {
  isUploading: false,
  error: null,
  lastUploadedCount: 0
};

export const bulkUploadReducer = createReducer(
  initialState,
  on(BulkUploadActions.uploadFile, (state) => ({
    ...state,
    isUploading: true,
    error: null
  })),
  on(BulkUploadActions.uploadSuccess, (state, { profiles }) => ({
    ...state,
    isUploading: false,
    lastUploadedCount: profiles.length
  })),
  on(BulkUploadActions.uploadFailure, (state, { error }) => ({
    ...state,
    isUploading: false,
    error
  })),
  on(BulkUploadActions.resetStatus, () => initialState)
);