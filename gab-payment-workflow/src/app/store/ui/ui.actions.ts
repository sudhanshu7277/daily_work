import { createActionGroup, props } from '@ngrx/store';

export const UiActions = createActionGroup({
  source: 'UI',
  events: {
    'Show Notification': props<{ message: string; toastType: 'success' | 'error' | 'info' }>(),
    'Dismiss Notification': props<{ id: string }>()
  }
});