import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { INSTRUCTION_FEATURE_KEY } from './store/instruction.state';
import { instructionReducer } from './store/instruction.reducer';
import { InstructionEffects } from './store/instruction.effects';

export const INSTRUCTION_SETUP_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(INSTRUCTION_FEATURE_KEY, instructionReducer),
      provideEffects(InstructionEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./instruction-list.component').then((m) => m.InstructionListPageComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./instruction-setup.component').then((m) => m.InstructionSetupPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./instruction-setup.component').then((m) => m.InstructionSetupPageComponent),
      },
    ],
  },
];
