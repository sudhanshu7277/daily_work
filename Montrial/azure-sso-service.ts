//Step 1: Update azure-sso.service.ts

import { Inject, inject, Injectable, signal, computed } from '@angular/core';
import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';
import {
  AccountInfo,
  EventMessage,
  EventType,
  InteractionStatus,
  RedirectRequest,
} from '@azure/msal-browser';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';

const USER_CACHE_KEY = 'app_user_login_info';

@Injectable({
  providedIn: 'root',
})
export class AzureSsoService {
  public isIframe = window !== window.parent && !window.opener;
  public static accessToken: string;
  private static authSvc: MsalService;

  // Reactive state initialized from cache
  private currentUserSubject = new BehaviorSubject<AccountInfo | null>(this.getInitialCachedUser());
  private currentUserSignal = signal<AccountInfo | null>(this.getInitialCachedUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly currentUser$: Observable<AccountInfo | null> = this.currentUserSubject.asObservable();
  readonly isUserLoggedIn = computed(() => !!this.currentUserSignal());

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    AzureSsoService.authSvc = authService;

    // Listen for MSAL authentication events
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.LOGIN_SUCCESS ||
            msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
            msg.eventType === EventType.HANDLE_REDIRECT_END
        )
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as any;
        const account =
          payload?.account ||
          this.authService.instance.getActiveAccount() ||
          this.authService.instance.getAllAccounts()[0];

        if (account) {
          this.setLoginUser(account);
        }
      });

    // Re-sync when interaction status goes to None
    this.msalBroadcastService.inProgress$
      .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
      .subscribe(() => {
        this.syncUserSession();
      });
  }

  /**
   * APP_INITIALIZER factory to handle MSAL Redirects before components render
   */
  public static initUserAuthentication(): () => Promise<void> {
    const msalService = inject(MsalService);
    
    return () =>
      new Promise<void>((resolve) => {
        msalService.handleRedirectObservable().subscribe({
          next: (response) => {
            let account: AccountInfo | null = null;

            if (response && response.account) {
              account = response.account;
            } else if (msalService.instance.getAllAccounts().length > 0) {
              account = msalService.instance.getAllAccounts()[0];
            }

            if (account) {
              msalService.instance.setActiveAccount(account);
              sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(account));
              localStorage.setItem(USER_CACHE_KEY, JSON.stringify(account));
              console.log('🟢 MSAL APP_INITIALIZER: Redirect handled, active user set:', account.username);
            }

            // Silent token acquisition if account exists
            if (account) {
              const scopes: any = environment.azureSso.auth.scopes;
              msalService
                .acquireTokenSilent({ scopes, account })
                .subscribe({
                  next: (val) => {
                    AzureSsoService.accessToken = val?.accessToken;
                    resolve();
                  },
                  error: () => resolve()
                });
            } else {
              resolve();
            }
          },
          error: (err) => {
            console.error('🔴 MSAL Handle Redirect Error:', err);
            resolve();
          }
        });
      });
  }

  public login(): void {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  public logout(): void {
    this.clearUserCache();
    this.authService.logoutRedirect();
  }

  public getInitialCachedUser(): AccountInfo | null {
    try {
      // 1. Check MSAL Active Account
      const active = this.authService?.instance?.getActiveAccount();
      if (active) return active;

      // 2. Check MSAL All Accounts
      const accounts = this.authService?.instance?.getAllAccounts();
      if (accounts && accounts.length > 0) return accounts[0];

      // 3. Fallback to storage
      const sessionData = sessionStorage.getItem(USER_CACHE_KEY);
      if (sessionData) return JSON.parse(sessionData);

      const localData = localStorage.getItem(USER_CACHE_KEY);
      if (localData) return JSON.parse(localData);
    } catch {
      return null;
    }
    return null;
  }

  public syncUserSession(): void {
    let account = this.authService.instance.getActiveAccount();
    if (!account) {
      const accounts = this.authService.instance.getAllAccounts();
      if (accounts.length > 0) {
        account = accounts[0];
      }
    }

    if (account) {
      this.setLoginUser(account);
    } else {
      const cached = this.getInitialCachedUser();
      if (cached) {
        this.setLoginUser(cached);
      }
    }
  }

  private setLoginUser(account: AccountInfo | null): void {
    if (account) {
      this.authService.instance.setActiveAccount(account);
      this.currentUserSignal.set(account);
      this.currentUserSubject.next(account);
      sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(account));
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(account));
    } else {
      this.clearUserCache();
    }
  }

  private clearUserCache(): void {
    this.currentUserSignal.set(null);
    this.currentUserSubject.next(null);
    sessionStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
  }

  /**
   * Synchronous readout for any component
   */
  public getCurrentUser(): AccountInfo | null {
    return this.currentUserSignal() || this.getInitialCachedUser();
  }
}

//Step 2: Ensure APP_INITIALIZER is properly registered
//In your app.module.ts or app.config.ts, make sure AzureSsoService.initUserAuthentication() is bound to APP_INITIALIZER:

// If using app.module.ts:

import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AzureSsoService } from './shared/services/azure-sso.service';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: AzureSsoService.initUserAuthentication,
      multi: true
    }
  ]
})
export class AppModule {}

// If using app.config.ts (Standalone):

import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { AzureSsoService } from './shared/services/azure-sso.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: AzureSsoService.initUserAuthentication,
      multi: true
    }
  ]
};

// Step 3: Access User Info in LegalHoldShellComponent & HistoryComponent
// Now, whenever any component loads after redirection, subscribe to currentUser$ or use getCurrentUser():

// In legal-hold-shell.component.ts:

import { Component, OnInit, inject } from '@angular/core';
import { AzureSsoService } from '../shared/services/azure-sso.service';
import { AccountInfo } from '@azure/msal-browser';

@Component({
  selector: 'app-legal-hold-shell',
  templateUrl: './legal-hold-shell.component.html'
})
export class LegalHoldShellComponent implements OnInit {
  private azureSsoService = inject(AzureSsoService);
  currentUser: AccountInfo | null = null;

  ngOnInit(): void {
    // 🟢 Subscribe to reactive stream (receives value immediately after redirect initialization)
    this.azureSsoService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        console.log('🟢 LegalHoldShell Component User:', user.username, user.name);
      }
    });
  }
}

// In history.component.ts:

fetchRecords(): void {
    // Read synchronous cached user value
    const user = this.azureSsoService.getCurrentUser();
    const userId = user?.username || user?.name || '';
  
    console.log('Fetching history records for user:', userId);
  
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = this.currentPage() * this.pageSize();
  
    this.historyService.getHistoryRecords(start, end, userId).subscribe({ ... });
  }