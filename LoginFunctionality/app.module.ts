import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

// In bootstrapApplication or AppModule providers
provideHttpClient(withInterceptors([authInterceptor])),