import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import { ROOT_REDUCERS, META_REDUCERS } from './store';

import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

/**
 * Root NgModule.
 *
 * Hybrid architecture:
 *   - AppComponent is the only component declared here (non-standalone).
 *   - Every other component, directive, and pipe in the app is standalone
 *     and is either lazy-loaded via the router or imported directly by the
 *     consumer that needs it.
 *
 * Standalone APIs (provideHttpClient, provideStore-style interceptor wiring)
 * coexist fine inside an NgModule's providers — the only constraint is that
 * AppComponent itself uses imports via this module rather than its own
 * `imports` array.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    // Routing — features are lazy-loaded via APP_ROUTES.
    RouterModule.forRoot(APP_ROUTES, {
      bindToComponentInputs: true,
      paramsInheritanceStrategy: 'always',
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
    }),

    // NgRx root setup. Feature slices register themselves via
    // provideState / provideEffects in their lazy-loaded routes files.
    StoreModule.forRoot(ROOT_REDUCERS, { metaReducers: META_REDUCERS }),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
  providers: [
    // Functional HTTP interceptors — order matters:
    //   1. loading  → toggles the global spinner
    //   2. auth     → attaches bearer token
    //   3. mock-api → intercepts /api/* in development
    //   4. error    → catches & logs failures last
    provideHttpClient(
      withFetch(),
      withInterceptors([loadingInterceptor, authInterceptor, mockApiInterceptor, errorInterceptor])
    ),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
