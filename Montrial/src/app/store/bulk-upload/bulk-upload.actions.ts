import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const BulkUploadActions = createActionGroup({
  source: 'Bulk Upload',
  events: {
    'Upload File': props<{ file: File }>(),
    'Upload Success': props<{ profiles: any[] }>(),
    'Upload Failure': props<{ error: string }>(),
    'Reset Status': emptyProps()
  }
});