import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular'; // If using AG Grid

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes'; // Your root routes
import { authInterceptor } from './app/shared/interceptors/auth.interceptor'; // Functional interceptor
import { RoleService } from './app/shared/services/auth/role.service'; // Example service
import { RoleGuard } from './app/shared/guards/role.guard'; // Guard
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    RoleService, // Global service
    RoleGuard, // Guard (providedIn: 'root' if Injectable)
    importProvidersFrom(AgGridModule) // For AG Grid (if needed, since it's not standalone)
    // Add other providers, e.g., provideAnimations() if using animations
  ]
}).catch(err => console.error(err));







// // main.ts (standalone app)
// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { authInterceptor } from './app/shared/interceptors/auth.interceptor';
// import { appRoutes } from './app/app.routes';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(appRoutes),
//     provideHttpClient(withInterceptors([authInterceptor])), // ← functional
//   ]
// }).catch(err => console.error(err));