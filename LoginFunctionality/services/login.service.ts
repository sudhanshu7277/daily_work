import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface Credential {
  role: string;
  password: string;
}

const CREDENTIALS: Credential[] = [
  { role: 'Maker', password: 'Maker123' },
  { role: 'Checker1', password: 'Checker123' },
  { role: 'Checker2', password: 'Checker234' },
  { role: 'Checker3', password: 'Checker345' }
];

const roleRouteMapping = {
    Maker: 'input',
    Checker1: 'checker1',
    Checker2: 'checker2',
    Checker3: 'checker3'
  };

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private currentUserRole: string | null = null;

  constructor(private router: Router) {
    this.currentUserRole = localStorage.getItem('userRole');
  }

  login(role: string, password: string): boolean {
    const user = CREDENTIALS.find(
      (u) => u.role.toLowerCase() === role.toLowerCase() && u.password === password
    );
    if (user) {
      this.currentUserRole = user.role;
      localStorage.setItem('userRole', user.role);
    //   this.router.navigate(['/ppa-entry', this.currentUserRole.toLowerCase()]);

      const route = roleRouteMapping[this.currentUserRole] || 'input';
      this.router.navigate(['/ppa-entry', route]);


      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserRole = null;
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return this.currentUserRole;
  }

  isLoggedIn(): boolean {
    return this.currentUserRole !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUserRole?.toLowerCase() === role.toLowerCase();
  }
}