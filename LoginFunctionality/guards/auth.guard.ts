import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    if (!this.loginService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRole && !this.loginService.hasRole(expectedRole)) {
      // redirect to allowed route based on user role
      const userRole = this.loginService.getRole();
      this.router.navigate(['/ppa-entry', userRole?.toLowerCase() || 'input']);
      return false;
    }
    return true;
  }
}