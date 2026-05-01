import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { PaymentInstruction } from '@core/models';

export const INSTRUCTION_FEATURE_KEY = 'instructions';

export const instructionAdapter = createEntityAdapter<PaymentInstruction>({
  selectId: (i) => i.id,
  sortComparer: (a, b) => (a.updatedOn < b.updatedOn ? 1 : -1),
});

export interface InstructionState extends EntityState<PaymentInstruction> {
  selectedId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  total: number;
}

export const initialInstructionState: InstructionState = instructionAdapter.getInitialState({
  selectedId: null,
  loading: false,
  saving: false,
  error: null,
  total: 0,
});
