// Updated azure-sso.service.ts with Persistent Caching

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

const USER_CACHE_KEY = 'app_user_login_info';

@Injectable({
  providedIn: 'root',
})
export class AzureSsoService {
  public isIframe = window !== window.parent && !window.opener;
  public static accessToken: string;
  private static authSvc: MsalService;

  // 1. Reactive state initialized directly from persistent cache
  private currentUserSignal = signal<AccountInfo | null>(this.getCachedUser());
  private currentUserSubject = new BehaviorSubject<AccountInfo | null>(this.getCachedUser());

  // Public state exposed to components
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isUserLoggedIn = computed(() => !!this.currentUserSignal());

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    AzureSsoService.authSvc = authService;

    // A. Sync user on app bootstrap
    this.syncUserSession();

    // B. Cache user info on successful login event
    this.msalBroadcastService.msalSubject$
      .pipe(filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS))
      .subscribe((result: EventMessage) => {
        const payload = result.payload as any;
        const account = payload?.account || this.authService.instance.getAllAccounts()[0];
        if (account) {
          console.log('🟢 MSAL LOGIN_SUCCESS Event - Caching User:', account);
          this.setLoginUser(account);
        }
      });

    // C. Re-sync session when MSAL completes background token checks
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
    // Clear persistent cache on logout
    this.clearUserCache();
    this.authService.logoutRedirect();
  }

  /**
   * 🟢 READ FROM CACHE: Pulls user info directly from localStorage or MSAL account store
   */
  private getCachedUser(): AccountInfo | null {
    try {
      // 1. Try reading from custom localStorage cache
      const cachedData = localStorage.getItem(USER_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // 2. Fallback to MSAL instance cache if available
      const accounts = this.authService?.instance?.getAllAccounts();
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
    } catch (e) {
      console.error('Error reading user cache:', e);
    }
    return null;
  }

  /**
   * 🟢 WRITE TO CACHE: Updates signals, RxJS streams, and localStorage
   */
  private setLoginUser(account: AccountInfo | null): void {
    if (account) {
      this.currentUserSignal.set(account);
      this.currentUserSubject.next(account);
      try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(account));
        console.log(`👤 User cached in localStorage: ${account.username}`);
      } catch (e) {
        console.error('Error saving user to localStorage:', e);
      }
    } else {
      this.clearUserCache();
    }
  }

  /**
   * 🟢 CLEAR CACHE: Removes cached data from memory and storage
   */
  private clearUserCache(): void {
    this.currentUserSignal.set(null);
    this.currentUserSubject.next(null);
    try {
      localStorage.removeItem(USER_CACHE_KEY);
    } catch (e) {
      console.error('Error clearing user cache:', e);
    }
  }

  /**
   * Syncs active MSAL accounts with the local cache
   */
  private syncUserSession(): void {
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.setLoginUser(accounts[0]);
    } else {
      const cached = this.getCachedUser();
      if (cached) {
        this.setLoginUser(cached);
      }
    }
  }

  /**
   * Direct synchronous access for non-reactive needs
   */
  public getCurrentUser(): AccountInfo | null {
    return this.currentUserSignal() || this.getCachedUser();
  }
}

// HISTORY COMPONENT CHANGES


import { Component, ChangeDetectionStrategy, OnInit, DestroyRef, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HistoryService } from '../shared/services/history.service';
import { AzureSsoService } from '../shared/services/azure-sso.service'; // 1. Import AzureSsoService

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly historyService = inject(HistoryService);
  private readonly azureSsoService = inject(AzureSsoService); // 2. Inject AzureSsoService
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isLoading = signal(false);
  readonly records = signal<any[]>([]);
  readonly displayedRecords = signal<any[]>([]);
  readonly showApiError = signal(false);

  // Pagination state
  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly totalRows = signal(0);
  readonly totalPages = signal(1);
  readonly pageNumbers = signal<(number | string)[]>([]);

  ngOnInit(): void {
    this.fetchRecords();
  }

  fetchRecords(): void {
    this.isLoading.set(true);
    this.showApiError.set(false);

    // 🟢 3. Get the cached user directly from AzureSsoService
    const currentUser = this.azureSsoService.getCurrentUser();
    const userId = currentUser?.username || currentUser?.name || '';

    console.log(`Fetching history records for user: ${userId}`);

    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = this.currentPage() * this.pageSize();

    // 🟢 4. Pass userId (or currentUser object) into historyService
    this.historyService.getHistoryRecords(start, end, userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const fetchedRecords = response?.records || [];
          const count = response?.totalCount ?? fetchedRecords.length;

          this.records.set(fetchedRecords);
          this.totalRows.set(count);

          const calcPages = Math.ceil(count / this.pageSize());
          this.totalPages.set(calcPages > 0 ? calcPages : 1);

          this.displayedRecords.set(fetchedRecords);
          this.pageNumbers.set(this.buildPageNumbers());

          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to fetch history records:', err);
          this.isLoading.set(false);
          this.showApiError.set(true);
          this.cdr.markForCheck();
        }
      });
  }

  private buildPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }
}