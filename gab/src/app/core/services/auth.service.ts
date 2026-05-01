import { Injectable, signal } from '@angular/core';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Stub user for foundation phase. Real auth swaps in here without
  // affecting consumers — they read from currentUser() / getToken().
  private readonly _currentUser = signal<User | null>({
    id: 'u-001',
    name: 'Swathi Iharra',
    email: 'swathi.iharra@example.com',
    role: 'maker',
  });

  readonly currentUser = this._currentUser.asReadonly();

  isAuthenticated(): boolean { return this._currentUser() !== null; }

  hasRole(role: User['role'] | User['role'][]): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  }

  getToken(): string | null {
    return this._currentUser() ? 'mock-bearer-token' : null;
  }

  setUser(user: User | null): void { this._currentUser.set(user); }

  logout(): void { this._currentUser.set(null); }
}
