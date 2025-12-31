import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { RoleService } from '../services/auth/role.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(private roleService: RoleService, private router: Router) {}

  canActivate: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const requiredScreen = route.data['screen'] as string;

    if (this.roleService.hasAccess(requiredScreen)) {
      return true;
    }

    // Redirect to default or unauthorized page
    this.router.navigate(['/unauthorized']);
    return false;
  };
}