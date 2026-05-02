import { createReducer, on } from '@ngrx/store';
import { UiActions } from './ui.actions';

export interface NotificationState {
  id: string;
  message: string;
  toastType: 'success' | 'error' | 'info';
}

export interface UiState {
  activeNotifications: NotificationState[];
}

const initialState: UiState = {
  activeNotifications: []
};

export const uiReducer = createReducer(
  initialState,
  on(UiActions.showNotification, (state, { message, toastType }) => ({
    ...state,
    activeNotifications: [...state.activeNotifications, { id: Math.random().toString(36), message, toastType }]
  })),
  on(UiActions.dismissNotification, (state, { id }) => ({
    ...state,
    activeNotifications: state.activeNotifications.filter(n => n.id !== id)
  }))
);