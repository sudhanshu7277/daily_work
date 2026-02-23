import { createActionGroup, props } from '@ngrx/store';

export const LegalHoldActions = createActionGroup({
  source: 'Legal Hold API',
  events: {
    'Load Profiles': props<{ query?: string }>(),
    'Load Success': props<{ profiles: any[] }>(),
    'Load Failure': props<{ error: string }>(),
    'Update Selection': props<{ selectedProfiles: any[] }>(),
    // Logic for Bulk Upload Bridge
    'Add Success': props<{ profiles: any[] }>(),
    // Future CRUD
    'Delete Profile': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),

    'Update Profile': props<{ id: string, changes: any }>(),
    'Update Success': props<{ profile: any }>(),
    'Update Failure': props<{ error: string }>()
  }
});