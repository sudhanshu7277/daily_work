import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

// Material Date functionality requires these providers
import { MatNativeDateModule } from '@angular/material/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Required for Material animations (ripples, transitions)
    provideAnimations(), 
    // Required for the MatDatepicker to parse and format dates
    importProvidersFrom(MatNativeDateModule)
  ]
};




// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }), 
//     provideRouter(routes),
//     provideAnimations()
//   ]
// };