import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaymentInstruction } from '../../core/models/instruction.model';

export const InstructionApiActions = createActionGroup({
  source: 'Instruction API',
  events: {
    // Save Draft Flow
    'Save Draft': props<{ payload: Partial<PaymentInstruction> }>(),
    'Save Draft Success': props<{ response: any }>(),
    'Save Draft Failure': props<{ error: string }>(),
    'Reset Saved State': emptyProps(),

    // Submit Instruction Flow
    'Submit Instruction': props<{ payload: PaymentInstruction }>(),
    'Submit Success': props<{ message: string }>(),
    'Submit Failure': props<{ error: string }>(),

    // Checker Specific Actions
    'Save Checker Draft': props<{ payload: any }>(),
    'Save Checker Draft Success': props<{ response: any }>(),
    'Submit Checker Approval': props<{ payload: any }>(),
    'Submit Checker Success': props<{ message: string }>(),

    // Document Extraction Actions
    'Extract Document': props<{ file: File }>(),
    'Extract Document Success': props<{ data: any }>(),
    'Extract Document Failure': props<{ error: string }>(),
    'Clear Extracted Data': emptyProps(),
  }
});