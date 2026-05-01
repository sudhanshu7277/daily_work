import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { environment } from '@env/environment';

export interface AppState {
  router: RouterReducerState;
}

export const ROOT_REDUCERS: ActionReducerMap<AppState> = {
  router: routerReducer,
};

/** Logs all dispatched actions in dev. Strip in prod. */
const logger = (reducer: any) => (state: any, action: any) => {
  // eslint-disable-next-line no-console
  console.groupCollapsed(`%c[ngrx] ${action.type}`, 'color:#3071b3;font-weight:600');
  // eslint-disable-next-line no-console
  console.log('payload', action);
  // eslint-disable-next-line no-console
  console.log('prev', state);
  const next = reducer(state, action);
  // eslint-disable-next-line no-console
  console.log('next', next);
  // eslint-disable-next-line no-console
  console.groupEnd();
  return next;
};

export const META_REDUCERS: MetaReducer<AppState>[] = environment.production ? [] : [logger];
