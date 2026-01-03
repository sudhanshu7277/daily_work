import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authService.getCurrentUser();

    if (user) {
      const cloned = req.clone({
        setHeaders: {
          'X-User-Role': user.role
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}