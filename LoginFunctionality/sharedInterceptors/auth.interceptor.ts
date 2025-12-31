import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleService } from '../services/auth/role.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private roleService: RoleService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.roleService.getUser();

    if (user) {
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${user.soeid}`, // or real token
          'X-Role': user.role
        }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}