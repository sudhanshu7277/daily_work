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
// import { ApplicationConfig, importProvidersFrom } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { MatNativeDateModule } from '@angular/material/core';
// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideAnimations(), 
//     importProvidersFrom(MatNativeDateModule)
//   ]
// };
