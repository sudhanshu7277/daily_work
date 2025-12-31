import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { RoleService } from '../services/auth/role.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(private roleService: RoleService, private router: Router) {}

  // Place the code here:
  canActivate: CanActivateFn = (route, state) => {
    const requiredScreen = route.data['screen'] as string;
    console.log('Guard check for screen:', requiredScreen);
    if (this.roleService.hasAccess(requiredScreen)) {
      console.log('Access granted');
      return true;
    }
    console.log('Access denied, redirecting');
    this.router.navigate(['/unauthorized']);
    return false;
  };
}