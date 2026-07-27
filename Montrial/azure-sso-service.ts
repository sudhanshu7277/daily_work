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
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AzureSsoService {
  public isIframe = window !== window.parent && !window.opener;
  public static accessToken: string;
  private static authSvc: MsalService;

  // 1. Reactive Stores (Signal + BehaviorSubject for backward/forward compatibility)
  private currentUserSignal = signal<AccountInfo | null>(this.getInitialUser());
  private currentUserSubject = new BehaviorSubject<AccountInfo | null>(this.getInitialUser());

  // Public readonly state for components
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isUserLoggedIn = computed(() => !!this.currentUserSignal());

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    AzureSsoService.authSvc = authService;

    // A. Sync initial user on app bootstrap
    this.syncUser();

    // B. Listen for fresh login events
    this.msalBroadcastService.msalSubject$
      .pipe(filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS))
      .subscribe((result: EventMessage) => {
        const payload = result.payload as any;
        const account = payload?.account || this.authService.instance.getAllAccounts()[0];
        if (account) {
          console.log('🟢 MSAL LOGIN_SUCCESS Event:', account);
          this.setLoginUser(account);
        }
      });

    // C. Listen for MSAL interaction complete (handles redirects & refresh cycles)
    this.msalBroadcastService.inProgress$
      .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
      .subscribe(() => {
        this.syncUser();
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
          const account = msalService.instance.getAllAccounts()[0];
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
    sessionStorage.removeItem('loggedInUser');
    this.currentUserSignal.set(null);
    this.currentUserSubject.next(null);
    this.authService.logoutRedirect();
  }

  /**
   * Reads from MSAL cache first, fallback to sessionStorage
   */
  private getInitialUser(): AccountInfo | null {
    try {
      // 1. Try MSAL Cache directly
      const accounts = this.authService?.instance?.getAllAccounts();
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
      
      // 2. Fallback to SessionStorage
      const stored = sessionStorage.getItem('loggedInUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Synchronizes MSAL active account state across application memory
   */
  private syncUser(): void {
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.setLoginUser(accounts[0]);
    } else {
      const stored = this.getInitialUser();
      if (stored) {
        this.setLoginUser(stored);
      }
    }
  }

  /**
   * Stores user state in memory and persists to sessionStorage
   */
  private setLoginUser(account: AccountInfo | null): void {
    if (account) {
      this.currentUserSignal.set(account);
      this.currentUserSubject.next(account);
      sessionStorage.setItem('loggedInUser', JSON.stringify(account));
      console.log(`👤 Active User Persisted: ${account.username} (${account.name})`);
    } else {
      this.currentUserSignal.set(null);
      this.currentUserSubject.next(null);
      sessionStorage.removeItem('loggedInUser');
    }
  }

  /**
   * Synchronous getter for non-reactive needs
   */
  public getCurrentUser(): AccountInfo | null {
    return this.currentUserSignal() || this.getInitialUser();
  }
}


// usage in other component
// readonly user = this.azureSsoService.currentUser;

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

  ngOnInit() {
    this.azureSsoService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        console.log('User in LegalHoldShell:', user.username);
      }
    });
  }
}