import { createFeatureSelector, createSelector } from '@ngrx/store';
import { INSTRUCTION_FEATURE_KEY, InstructionState, instructionAdapter } from './instruction.state';

const selectInstructionState = createFeatureSelector<InstructionState>(INSTRUCTION_FEATURE_KEY);
const { selectAll, selectEntities, selectIds, selectTotal } = instructionAdapter.getSelectors();

export const selectAllInstructions = createSelector(selectInstructionState, selectAll);
export const selectInstructionEntities = createSelector(selectInstructionState, selectEntities);
export const selectInstructionIds = createSelector(selectInstructionState, selectIds);
export const selectInstructionCount = createSelector(selectInstructionState, selectTotal);
export const selectInstructionTotal = createSelector(selectInstructionState, (s) => s.total);

export const selectInstructionLoading = createSelector(selectInstructionState, (s) => s.loading);
export const selectInstructionSaving = createSelector(selectInstructionState, (s) => s.saving);
export const selectInstructionError = createSelector(selectInstructionState, (s) => s.error);

export const selectSelectedId = createSelector(selectInstructionState, (s) => s.selectedId);
export const selectSelectedInstruction = createSelector(
  selectInstructionEntities,
  selectSelectedId,
  (entities, id) => (id ? entities[id] ?? null : null)
);
