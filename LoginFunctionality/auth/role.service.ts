import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserRole {
  role: string;
  soeid: string;
  allowedScreens: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private userSubject = new BehaviorSubject<UserRole | null>(null);
  user$ = this.userSubject.asObservable();

  // Dummy data based on your conditions (replace with backend API in production)
  private roleMappings: { [soeid: string]: { role: string; allowedScreens: string[] } } = {
    'ss71872': { role: 'Checker1', allowedScreens: ['Input', 'Checker1'] },
    'sj81534': { role: 'Maker', allowedScreens: ['Checker1'] },
    'vj97973': { role: 'Checker3', allowedScreens: ['Checker2'] },
    'vs21245': { role: 'Maker', allowedScreens: ['Checker3'] }
  };

  login(soeid: string, role: string): boolean {
    const mapping = this.roleMappings[soeid];
    if (mapping && mapping.role === role) {
      this.setUser({ role: mapping.role, soeid, allowedScreens: mapping.allowedScreens });
      return true;
    }
    return false;
  }

  setUser(user: UserRole) {
    this.userSubject.next(user);
    localStorage.setItem('userRole', JSON.stringify(user));
  }

  getUser(): UserRole | null {
    const stored = localStorage.getItem('userRole');
    if (stored) {
      return JSON.parse(stored);
    }
    return this.userSubject.value;
  }

  hasAccess(screen: string): boolean {
    const user = this.getUser();
    return !!user && user.allowedScreens.includes(screen);
  }

  logout() {
    this.userSubject.next(null);
    localStorage.removeItem('userRole');
  }
}