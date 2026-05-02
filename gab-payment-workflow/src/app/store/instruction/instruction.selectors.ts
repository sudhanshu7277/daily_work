import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InstructionState } from './instruction.reducer';

// Select the specific feature slice from the global store
export const selectInstructionFeature = createFeatureSelector<InstructionState>('instruction');

export const selectLastSavedInstruction = createSelector(
  selectInstructionFeature,
  (state) => state.savedInstructionData
);

export const selectIsInstructionLoading = createSelector(
  selectInstructionFeature,
  (state) => state.isLoading
);

export const selectInstructionError = createSelector(
  selectInstructionFeature,
  (state) => state.error
);