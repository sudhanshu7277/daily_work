import { Injectable } from '@angular/core';
import { CanLoad, Router, Route } from '@angular/router';
import { RoleService } from '../services/auth/role.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(private roleService: RoleService, private router: Router) {}

  canLoad(route: Route): boolean {
    if (this.roleService.getUser()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}