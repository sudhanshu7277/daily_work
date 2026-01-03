import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  role: 'Maker' | 'Checker1' | 'Checker2' | 'Checker3';
}

const CREDENTIALS = [
  { role: 'Maker' as const,    password: 'Maker123' },
  { role: 'Checker1' as const, password: 'Checker123' },
  { role: 'Checker2' as const, password: 'Checker234' },
  { role: 'Checker3' as const, password: 'Checker345' }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is already logged in (on refresh)
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  login(role: string, password: string): Observable<User> {
    const cred = CREDENTIALS.find(c => c.role === role && c.password === password);
    
    if (cred) {
      const user: User = { role: cred.role };
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return of(user).pipe(delay(500)); // simulate API delay
    } else {
      return throwError(() => new Error('Invalid role or password'));
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}