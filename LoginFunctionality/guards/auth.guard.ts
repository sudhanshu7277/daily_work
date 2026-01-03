import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('AuthGuard canActivate called'); // Add this to verify it triggers
  
    const expectedRole = route.data['role'];
    console.log('Expected Role:', expectedRole);
  
    if (!this.loginService.isLoggedIn()) {
      console.log('Not logged in, redirecting...');
      this.router.navigate(['/login']);
      return false;
    }
  
    if (!this.loginService.hasRole(expectedRole)) {
      console.log('Role mismatch, redirecting...');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}