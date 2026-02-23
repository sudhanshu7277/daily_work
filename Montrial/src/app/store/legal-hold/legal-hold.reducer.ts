import { createReducer, on } from '@ngrx/store';
import { LegalHoldActions } from './legal-hold.actions';

export interface LegalHoldState {
  profiles: any[];
  selectedProfiles: any[];
  loading: boolean;
}

export const initialState: LegalHoldState = {
  profiles: [],
  selectedProfiles: [],
  loading: false
};

export const legalHoldReducer = createReducer(
  initialState,
  on(LegalHoldActions.loadProfiles, (state) => ({ ...state, loading: true })),
  on(LegalHoldActions.loadSuccess, (state, { profiles }) => ({
    ...state, profiles, loading: false
  })),
  on(LegalHoldActions.updateSelection, (state, { selectedProfiles }) => ({
    ...state, selectedProfiles
  })),
  // THE AUTO-SELECT BRIDGE
  on(LegalHoldActions.addSuccess, (state, { profiles }) => ({
    ...state,
    profiles: [...profiles, ...state.profiles], // Add to top of grid
    selectedProfiles: [...state.selectedProfiles, ...profiles] // Auto-check
  })),
  on(LegalHoldActions.deleteSuccess, (state, { id }) => ({
    ...state,
    profiles: state.profiles.filter(p => p.ocifId !== id),
    selectedProfiles: state.selectedProfiles.filter(p => p.ocifId !== id)
  }))
);