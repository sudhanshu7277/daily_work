import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CreatePaymentInstructionPayload,
  InstructionFilters,
  PaginationParams,
  PaymentInstruction,
  UpdateInstructionPayload,
} from '@core/models';

export const InstructionActions = createActionGroup({
  source: 'Instructions',
  events: {
    // List
    'Load List': props<{ filters?: InstructionFilters; pagination?: PaginationParams }>(),
    'Load List Success': props<{ data: PaymentInstruction[]; total: number }>(),
    'Load List Failure': props<{ error: string }>(),

    // Detail
    'Load One': props<{ id: string }>(),
    'Load One Success': props<{ instruction: PaymentInstruction }>(),
    'Load One Failure': props<{ error: string }>(),

    // Create
    'Create': props<{ payload: CreatePaymentInstructionPayload }>(),
    'Create Success': props<{ instruction: PaymentInstruction }>(),
    'Create Failure': props<{ error: string }>(),

    // Update
    'Update': props<{ id: string; payload: UpdateInstructionPayload }>(),
    'Update Success': props<{ instruction: PaymentInstruction }>(),
    'Update Failure': props<{ error: string }>(),

    // Selection
    'Select': props<{ id: string | null }>(),
    'Clear Selection': emptyProps(),
  },
});
