import { createReducer, on } from '@ngrx/store';
import { InstructionActions } from './instruction.actions';
import { initialInstructionState, instructionAdapter } from './instruction.state';

export const instructionReducer = createReducer(
  initialInstructionState,

  // List
  on(InstructionActions.loadList, (state) => ({ ...state, loading: true, error: null })),
  on(InstructionActions.loadListSuccess, (state, { data, total }) =>
    instructionAdapter.setAll(data, { ...state, loading: false, total })
  ),
  on(InstructionActions.loadListFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Detail
  on(InstructionActions.loadOne, (state, { id }) => ({
    ...state,
    selectedId: id,
    loading: true,
    error: null,
  })),
  on(InstructionActions.loadOneSuccess, (state, { instruction }) =>
    instructionAdapter.upsertOne(instruction, {
      ...state,
      loading: false,
      selectedId: instruction.id,
    })
  ),
  on(InstructionActions.loadOneFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create
  on(InstructionActions.create, (state) => ({ ...state, saving: true, error: null })),
  on(InstructionActions.createSuccess, (state, { instruction }) =>
    instructionAdapter.addOne(instruction, {
      ...state,
      saving: false,
      selectedId: instruction.id,
      total: state.total + 1,
    })
  ),
  on(InstructionActions.createFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  // Update
  on(InstructionActions.update, (state) => ({ ...state, saving: true, error: null })),
  on(InstructionActions.updateSuccess, (state, { instruction }) =>
    instructionAdapter.upsertOne(instruction, { ...state, saving: false })
  ),
  on(InstructionActions.updateFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  // Selection
  on(InstructionActions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(InstructionActions.clearSelection, (state) => ({ ...state, selectedId: null }))
);
