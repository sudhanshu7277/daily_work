import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles = route.data['roles'] as string[];
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to user's own dashboard
      this.router.navigate([this.getHomeRoute(user.role)]);
      return false;
    }

    return true;
  }

  private getHomeRoute(role: string): string {
    switch (role) {
      case 'Maker': return '/maker';
      case 'Checker1': return '/checker1';
      case 'Checker2': return '/checker2';
      case 'Checker3': return '/checker3';
      default: return '/login';
    }
  }
}