import { createReducer, on } from '@ngrx/store';
import { InstructionApiActions } from './instruction.actions';
import { PaymentInstruction } from '../../core/models/instruction.model';

export interface InstructionState {
  savedInstructionData: PaymentInstruction | null;
  isLoading: boolean;
  error: string | null;
  isExtracting: boolean;
  extractedData: any | null;
}

const initialState: InstructionState = {
  savedInstructionData: null,
  isLoading: false,
  error: null,
  isExtracting: false,
  extractedData: null
};

export const instructionReducer = createReducer(
  initialState,
  
  // --- Save Draft Reducers ---
  on(InstructionApiActions.saveDraft, (state) => ({ 
    ...state, 
    isLoading: true, 
    error: null 
  })),
  on(InstructionApiActions.saveDraftSuccess, (state, { response }) => ({ 
    ...state, 
    isLoading: false, 
    savedInstructionData: response 
  })),
  on(InstructionApiActions.saveDraftFailure, (state, { error }) => ({ 
    ...state, 
    isLoading: false, 
    error 
  })),
  on(InstructionApiActions.resetSavedState, (state) => ({ 
    ...state, 
    savedInstructionData: null 
  })),

  // --- Submit Instruction Reducers ---
  on(InstructionApiActions.submitInstruction, (state) => ({ 
    ...state, 
    isLoading: true, 
    error: null 
  })),
  on(InstructionApiActions.submitSuccess, (state) => ({ 
    ...state, 
    isLoading: false, 
    savedInstructionData: null // Clear form data once successfully submitted
  })),
  on(InstructionApiActions.submitFailure, (state, { error }) => ({ 
    ...state, 
    isLoading: false, 
    error 
  })),
  on(InstructionApiActions.extractDocument, (state) => ({ ...state, isExtracting: true })),
  on(InstructionApiActions.extractDocumentSuccess, (state, { data }) => ({ ...state, isExtracting: false, extractedData: data })),
  on(InstructionApiActions.extractDocumentFailure, (state) => ({ ...state, isExtracting: false })),
  on(InstructionApiActions.clearExtractedData, (state) => ({ ...state, extractedData: null }))
);