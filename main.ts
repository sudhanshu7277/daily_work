// update 

// main.ts
import { authInterceptor } from './app/shared/interceptors/auth.interceptor'; // ← this is now the function

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])), // ← now correct
    // other providers...
  ]
}).catch(err => console.error(err));