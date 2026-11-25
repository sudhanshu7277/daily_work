Change 1: UI/src/environments/environment.perf.ts
Add mockUserEmail:


export const environment = {
  production: false,
  ssoEnabled: false,
  useMock: false,
  apiURL: 'https://LEGALHOLD-ECS-NETWLB-perf1-cc1-7626e69add191d8b.elb.ca-central-1.amazonaws.com',
  mockUserEmail: 'dinesh.manivannan@nesbittburns.com',
  azureSso: {
    auth: {
      clientId: '7d4650a5-3622-4b46-a878-7c1b699c54b2',
      cloudInstanceId: 'https://login.microsoftonline.com',
      tenantId: '4adafc24-ca8c-4e85-a961-5fb6ecd37ed9',
      redirectUri: 'https://legalhold-sit.hcloud.bmogc.net/legal-hold',
      postLogoutRedirectUri: '/',
      scopes: ['api://7d4650a5-3622-4b46-a878-7c1b699c54b2/service-directory-legalhold-apis.list']
    },
    cache: {
      cacheLocation: 'localStorage'
    }
  }
};



Change 2: UI/src/environments/environment.ts (and environment.qa.ts, environment.dev.ts, environment.prod.ts, environment.local.ts)
Add mockUserEmail: '', right under useMock: false, so every environment file shares the exact same TypeScript shape:

  production: false,
  ssoEnabled: false,
  useMock: false,
  mockUserEmail: '',


Change 3: UI/src/app/core/auth-token.interceptor.ts (Replace Lines 37–53)
Check !


    // Only attach headers for API requests - skip local assets (translations, etc.)
    if (!req.url.startsWith(environment.apiURL)) {
      return next.handle(req).pipe(
        catchError((err) => this.handleHttpError(err))
      );
    }

    if (!environment.ssoEnabled) {
      const cloned = req.clone({
        setHeaders: {
          ...(environment.mockUserEmail ? { 'X-User-Email': environment.mockUserEmail } : {}),
          'X-Correlation-Id': crypto.randomUUID(),
        },
      });
      return next.handle(cloned).pipe(
        catchError((err) => this.handleHttpError(err))
      );
    }


    //

    &_text,
    &__text {
      flex: 1 1 auto !important;
      width: auto !important;
      margin-left: 0 !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #102333 !important;
      line-height: 20px !important;
      white-space: pre-line !important; // Preserves multiline breaks for bullets/subtext
    }
