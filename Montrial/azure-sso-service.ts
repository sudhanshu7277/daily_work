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
import { BehaviorSubject, Observable } from 'rxjs';

const USER_CACHE_KEY = 'app_user_login_info';

@Injectable({
  providedIn: 'root',
})
export class AzureSsoService {
  public isIframe = window !== window.parent && !window.opener;
  public static accessToken: string;
  private static authSvc: MsalService;

  // 1. Reactive Signal initialized synchronously from cache
  private currentUserSignal = signal<AccountInfo | null>(this.getInitialCachedUser());
  private currentUserSubject = new BehaviorSubject<AccountInfo | null>(this.getInitialCachedUser());

  // Public readonly state for all components
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly currentUser$: Observable<AccountInfo | null> = this.currentUserSubject.asObservable();
  readonly isUserLoggedIn = computed(() => !!this.currentUserSignal());

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    AzureSsoService.authSvc = authService;

    // A. Listen for ANY successful auth / account added event (handles deployed redirect edge cases)
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.LOGIN_SUCCESS ||
            msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
            msg.eventType === EventType.ACCOUNT_ADDED
        )
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as any;
        const account = payload?.account || this.authService.instance.getActiveAccount() || this.authService.instance.getAllAccounts()[0];

        if (account) {
          console.log('🟢 MSAL Event Captured - User:', account);
          this.setLoginUser(account);
        }
      });

    // B. Re-sync session when MSAL interaction completes
    this.msalBroadcastService.inProgress$
      .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
      .subscribe(() => {
        this.syncUserSession();
      });
  }

  public static initUserAuthentication(): () => any {
    const msalService = inject(MsalService);
    return () =>
      msalService.handleRedirectObservable().subscribe((response) => {
        if (!response && msalService.instance.getAllAccounts().length === 0) {
          msalService.loginRedirect({
            scopes: environment.azureSso.auth.scopes,
          });
        } else {
          // Set active account immediately upon redirect completion
          const account = response?.account || msalService.instance.getAllAccounts()[0];
          if (account) {
            msalService.instance.setActiveAccount(account);
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(account));
            console.log('🟢 MSAL Redirect Handled - Active Account Set:', account);
          }

          const scopes: any = environment.azureSso.auth.scopes;
          AzureSsoService.authSvc
            .acquireTokenSilent({
              scopes,
              account,
            })
            .subscribe((val) => {
              AzureSsoService.accessToken = val?.accessToken;
            });
        }
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

  /**
   * Reads cached user synchronously on app start
   */
  private getInitialCachedUser(): AccountInfo | null {
    try {
      // 1. Try MSAL Active Account
      const activeAccount = this.authService?.instance?.getActiveAccount();
      if (activeAccount) return activeAccount;

      // 2. Try MSAL Accounts array
      const accounts = this.authService?.instance?.getAllAccounts();
      if (accounts && accounts.length > 0) return accounts[0];

      // 3. Fallback to localStorage
      const cached = localStorage.getItem(USER_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  /**
   * Syncs active MSAL account into memory & storage
   */
  private syncUserSession(): void {
    let account = this.authService.instance.getActiveAccount();

    if (!account) {
      const accounts = this.authService.instance.getAllAccounts();
      if (accounts.length > 0) {
        account = accounts[0];
        this.authService.instance.setActiveAccount(account);
      }
    }

    if (account) {
      this.setLoginUser(account);
    } else {
      const fallback = this.getInitialCachedUser();
      if (fallback) {
        this.setLoginUser(fallback);
      }
    }
  }

  /**
   * Persists active user details across memory and browser cache
   */
  private setLoginUser(account: AccountInfo | null): void {
    if (account) {
      this.authService.instance.setActiveAccount(account);
      this.currentUserSignal.set(account);
      this.currentUserSubject.next(account);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(account));
      console.log(`👤 Active User Persisted: ${account.username} (${account.name})`);
    } else {
      this.clearUserCache();
    }
  }

  private clearUserCache(): void {
    this.currentUserSignal.set(null);
    this.currentUserSubject.next(null);
    localStorage.removeItem(USER_CACHE_KEY);
  }

  /**
   * Direct synchronous readout for components & services
   */
  public getCurrentUser(): AccountInfo | null {
    return this.currentUserSignal() || this.getInitialCachedUser();
  }
}



//////////

fetchRecords(): void {
    // Read instant cached user
    const user = this.azureSsoService.getCurrentUser();
    const userId = user?.username || user?.name || '';
  
    console.log('Fetching history records for user ID:', userId);
  
    // Send userId in your API call
    this.historyService.getHistoryRecords(start, end, userId).subscribe(...);
  }