import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { routes } from './app.routes';
import { Observable } from 'rxjs';


export class WebTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new WebTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      MatNativeDateModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        defaultLanguage: 'en'
      })
    )
  ]
};

// NEW CODE BELOW

import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient } from '@angular/common/http';

// Reducers
import { legalHoldReducer } from './store/legal-hold/legal-hold.reducer';
// Effects
import * as legalHoldEffects from './store/legal-hold/legal-hold.effects';
import * as bulkUploadEffects from './store/bulk-upload/bulk-upload.effects';
import { bulkUploadReducer } from './store/bulk-upload/bulk-upload.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // Register the 'legalHold' feature slice
    provideStore({
      legalHold: legalHoldReducer,
      bulkUpload: bulkUploadReducer
    }),
    // Register all functional effects
    provideEffects(legalHoldEffects, bulkUploadEffects)
  ]
};