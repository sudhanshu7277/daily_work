import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    console.log('AuthRedirectGuard triggered - current user:', user);

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    let targetPath: string;
    switch (user.role) {
      case 'Maker':
        targetPath = 'input';
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

    // Relative navigation — prevents re-triggering parent guards
    this.router.navigate([targetPath], { relativeTo: this.route });
    return false;
  }
}