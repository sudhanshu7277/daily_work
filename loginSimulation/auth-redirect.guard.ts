import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    let targetPath: string;
    switch (user.role) {
      case 'Maker':
        targetPath = 'input';       // Maker uses the input tab
        break;
      case 'Checker1':
        targetPath = 'checker1';
        break;
      case 'Checker2':
        targetPath = 'checker2';
        break;
      case 'Checker3':
        targetPath = 'checker3';
        break;
      default:
        this.router.navigate(['/login']);
        return false;
    }

    this.router.navigate(['/ppa-entry', targetPath]);
    return false; // Prevent access to empty path
  }
}