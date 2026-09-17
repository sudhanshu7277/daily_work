// Step 1: Create system-status.service.ts
// Create src/app/core/services/system-status.service.ts:

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  readonly isSystemDown = signal<boolean>(false);

  setSystemDown(state: boolean): void {
    this.isSystemDown.set(state);
  }
}


// Step 2: Update AuthTokenInterceptor
// In auth-token.interceptor.ts:

// Inject SystemStatusService.

// Wrap next.handle(...) calls with a catchError that flips 
// isSystemDown(true) whenever a 5xx or network status code (status === 0) occurs.

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MsalService } from '@azure/msal-angular';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { SystemStatusService } from '../services/system-status.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(
    private msalService: MsalService,
    private systemStatusService: SystemStatusService
  ) {}

  private handleHttpError(error: any): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      // 0 = Server offline / network unreachable / CORS block
      // >= 500 = Backend gateway or internal server failure
      if (error.status === 0 || error.status >= 500) {
        this.systemStatusService.setSystemDown(true);
      }
    }
    return throwError(() => error);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only attach token if SSO is enabled
    if (!environment.ssoEnabled) {
      return next.handle(req).pipe(
        catchError((err) => this.handleHttpError(err))
      );
    }

    // Only attach token for API requests - skip local assets (translations, etc.)
    if (!req.url.startsWith(environment.apiURL)) {
      return next.handle(req).pipe(
        catchError((err) => this.handleHttpError(err))
      );
    }

    const account = this.msalService.instance.getAllAccounts()[0];
    if (!account) {
      this.msalService.loginRedirect({ scopes: environment.azureSso.auth.scopes });
      return throwError(() => new Error('User is not authenticated'));
    }

    const scopes = environment.azureSso.auth.scopes;

    return this.msalService.acquireTokenSilent({
      account,
      scopes
    }).pipe(
      switchMap((result) => {
        if (result && result.accessToken) {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${result.accessToken}`,
              'X-User-Email': account.username ?? '',
              'X-Correlation-Id': crypto.randomUUID()
            }
          });
          return next.handle(cloned);
        } else {
          return next.handle(req);
        }
      }),
      catchError((error) => {
        if (error instanceof InteractionRequiredAuthError) {
          this.msalService.loginRedirect({ scopes });
          return throwError(() => error);
        }
        return this.handleHttpError(error);
      })
    );
  }
}


// Step 3: Create system-failure.component.ts
// Create src/app/core/components/system-failure/system-failure.component.ts:

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-failure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-failure-backdrop">
      <div class="failure-card">
        <img src="assets/maintenance-xl.svg" alt="System Error" class="failure-svg" />
        <p class="failure-text">A system error occurred. Please try again later.</p>
        <button type="button" class="btn-return" (click)="onReload()">RETURN</button>
      </div>
    </div>
  `,
  styles: [`
    .system-failure-backdrop {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: calc(100vh - 110px);
      background-color: #f4f6f8;
      box-sizing: border-box;
      padding: 40px 16px;
    }
    .failure-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 500px;
    }
    .failure-svg {
      width: 280px;
      height: auto;
      margin-bottom: 24px;
    }
    .failure-text {
      font-size: 15px;
      font-weight: 600;
      color: #212529;
      margin-bottom: 24px;
    }
    .btn-return {
      background-color: #0079c1;
      color: #ffffff;
      border: none;
      border-radius: 24px;
      padding: 8px 36px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-return:hover {
      background-color: #005a91;
    }
  `]
})
export class SystemFailureComponent {
  onReload(): void {
    window.location.reload();
  }
}


// Step 4: Wire to Root in app.ts and app.html
// In app.ts:


import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';
import { SystemFailureComponent } from './core/components/system-failure/system-failure.component';
import { SystemStatusService } from './core/services/system-status.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SystemFailureComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'bmo-legal';
  readonly systemStatus = inject(SystemStatusService);
}


//In app.html:

<a class="skip-link" href="#main-content">Skip to main content</a>
<app-header></app-header>

<main id="main-content" class="app-content" tabindex="-1">
  @if (systemStatus.isSystemDown()) {
    <app-system-failure></app-system-failure>
  } @else {
    <router-outlet></router-outlet>
  }
</main>




// Step 1: Update system-status.service.ts
// Add browser connectivity listeners so the service reacts 
// immediately to network drops without needing to wait for an HTTP request:


import { Injectable, signal, NgZone, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  private readonly ngZone = inject(NgZone);
  
  // Set initial status based on browser connectivity
  readonly isSystemDown = signal<boolean>(!navigator.onLine);

  constructor() {
    window.addEventListener('offline', () => {
      this.ngZone.run(() => {
        this.isSystemDown.set(true);
      });
    });

    window.addEventListener('online', () => {
      this.ngZone.run(() => {
        this.isSystemDown.set(false);
      });
    });
  }

  setSystemDown(state: boolean): void {
    this.isSystemDown.set(state);
  }
}



//Step 2: Ensure auth-token.interceptor.ts Catches status === 0
// When an HTTP request fires while offline, 
// the browser returns an HttpErrorResponse with status === 0. 
// Make sure your handleHttpError helper explicitly catches status 0:


private handleHttpError(error: any): Observable<never> {
  if (error instanceof HttpErrorResponse) {
    // 0 = Network drop / internet disconnected / CORS failure
    // >= 500 = Server outage
    if (error.status === 0 || error.status >= 500) {
      this.systemStatusService.setSystemDown(true);
    }
  }
  return throwError(() => error);
}



// system failure component



import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-failure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-failure-screen">
      <div class="failure-box">
        <!-- Using root-relative path + inline SVG fallback -->
        <img 
          src="/assets/maintenance-xl.svg" 
          alt="System Error" 
          class="failure-svg"
          (error)="onImgError($event)" 
        />

        <p class="failure-text">A system error occurred. Please try again later.</p>
        <button type="button" class="btn-return" (click)="onReturn()">RETURN</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .system-failure-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: calc(100vh - 120px);
      background-color: #f4f6f8;
      box-sizing: border-box;
      padding: 32px 16px;
    }
    .failure-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 440px;
    }
    .failure-svg {
      width: 240px;
      height: auto;
      margin-bottom: 24px;
    }
    .failure-text {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 20px 0;
      line-height: 1.4;
    }
    .btn-return {
      background-color: #0079c1;
      color: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 7px 32px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .btn-return:hover {
      background-color: #005a91;
    }
  `]
})
export class SystemFailureComponent {
  onReturn(): void {
    window.location.reload();
  }

  onImgError(event: Event): void {
    // If the browser blocked network fetching the file while offline,
    // ensure the broken image icon doesn't show
    (event.target as HTMLElement).style.display = 'none';
  }
}


// Step 3: Remove "Manage Legal Hold" Title When Error is Shown
// In legal-hold-shell.component.html (or wherever <h3>Manage Legal Hold</h3> 
// is located), wrap the shell content and title inside @if (!systemStatus.isSystemDown()):

@if (!systemStatus.isSystemDown()) {
  <div class="legal-hold-header">
    <h2>Manage Legal Hold</h2>
  </div>
  <!-- search and grid components -->
} @else {
  <app-system-failure></app-system-failure>
}