# Global Account Bank (GAB)

Pre-payment workflow tool for high-net-worth clients. Records payment
instructions, moves them through a 4-step approval workflow, and tracks
payment progress through a 3-step workflow that will be replaced by direct
integration with Citi Direct or another payment platform.

Built with **Angular 17.3.5**, **NgRx 17.2**, **Bootstrap 5**, and
**ngx-charts**. Backend is mocked in-memory during development and swappable
to a real API by toggling a single environment flag.

---

## Getting started

```bash
npm install
npm start         # dev server on http://localhost:4200
npm run build     # production build → dist/gab
npm test          # Jest unit tests
npm run lint      # ESLint
npm run format    # Prettier write
```

Requires Node 18.13+ or 20.9+ (matching Angular CLI 17.3 requirements).

---

## Architecture

### Module / standalone hybrid

`AppModule` is the bootstrap module and declares only `AppComponent`
(non-standalone). Every other component, directive, and pipe in the app is
standalone and is either lazy-loaded by the router or imported directly by
its consumer. This gives us familiar `NgModule` bootstrap ergonomics with
modern standalone authoring everywhere else.

### Folder structure

```
src/
├── app/
│   ├── app.component.ts          # root component (non-standalone)
│   ├── app.module.ts             # bootstrap module
│   ├── app.routes.ts             # top-level lazy routes
│   ├── core/                     # singletons — services, interceptors, guards, models
│   │   ├── guards/
│   │   ├── interceptors/         # auth, error, loading, mock-api
│   │   ├── mock-api/             # in-memory store + JSON fixtures
│   │   ├── models/               # domain types
│   │   ├── services/             # injectable services consumed across features
│   │   └── tokens/
│   ├── features/                 # one folder per feature, each lazy-loaded
│   │   ├── dashboard/
│   │   ├── instruction-setup/
│   │   ├── approval/
│   │   └── payment/
│   ├── layout/                   # app shell — header, sidenav, main-layout
│   ├── shared/                   # reusable presentational components
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── validators/
│   └── store/                    # root NgRx state and meta-reducers
├── assets/
├── environments/
├── styles/                       # global SCSS architecture
│   ├── abstracts/                # tokens, mixins
│   ├── base/                     # reset, typography, utilities
│   ├── components/               # forms, layout
│   └── themes/                   # default theme — exposes CSS vars
├── styles.scss
├── main.ts
├── index.html
└── favicon.ico
```

Path aliases (configured in `tsconfig.json` and Jest `moduleNameMapper`):

```
@app/*       → src/app/*
@core/*      → src/app/core/*
@shared/*    → src/app/shared/*
@features/*  → src/app/features/*
@layout/*    → src/app/layout/*
@env/*       → src/environments/*
```

### State management

Root state is registered in `AppModule` via `StoreModule.forRoot` /
`EffectsModule.forRoot([])` and only contains the `routerReducer`.

Each feature registers its own slice in its `*.routes.ts` file using
`provideState` and `provideEffects`. State is loaded the first time the
feature is visited, and survives subsequent navigation.

The `instruction-setup` slice uses `@ngrx/entity` for normalised storage
(`createEntityAdapter`) — this is the pattern to follow for any feature that
manages a collection.

### HTTP layer

`provideHttpClient` is wired in `AppModule` with four functional interceptors,
in order:

1. `loadingInterceptor` — increments / decrements `LoadingService` count
2. `authInterceptor` — attaches `Authorization: Bearer <token>` if logged in
3. `mockApiInterceptor` — short-circuits requests to `/api/*` against the
   in-memory mock store (only when `environment.useMockApi === true`)
4. `errorInterceptor` — logs failures and rethrows

Disable the mock by setting `useMockApi: false` in `environment.ts` (or use
`environment.prod.ts`, where it's already false).

### Styling

Three layers in `src/styles/`:

- **abstracts** — design tokens (colors, spacing, typography, shadows,
  breakpoints, motion) and mixins (responsive, layout, form, effect)
- **base** — reset, typography, utilities
- **themes** — exposes tokens as CSS custom properties so JS-driven theme
  switching is possible later

Components consume tokens via `@use 'abstracts' as *;` (see any component
SCSS for the pattern). Components never hardcode colors, sizes, or spacing.

The form section grid (`.gab-form-grid`) is mobile-first: 1 column under
768px, 2 columns up to 992px, 3 columns above. Use `.gab-col-span-2`,
`.gab-col-span-3`, or `.gab-col-span-full` to widen specific fields.

---

## Conventions

- **Component selectors** use the `gab-` prefix (enforced by
  `@angular-eslint/component-selector` rule).
- **Standalone everywhere** except `AppComponent`.
- **`ChangeDetectionStrategy.OnPush`** on every component.
- **`inject()`** for dependencies (no constructor injection unless the rule
  forces it).
- **Signals** for component-local state. **NgRx** for shared / async state.
- **Path aliases** instead of relative imports past two levels deep.
- **Reactive forms** for everything (no template-driven `ngModel` on
  feature forms — only inside the simple `ControlValueAccessor` wrappers).

---

## Mock data

Five seed instructions span every workflow state, plus 4 regions, 12
countries, 8 clients, 9 deals, and 8 users. The mock store is stateful in
memory — creates / updates / advances persist for the session and reset on
reload. Edit `src/app/core/mock-api/*.fixtures.ts` to change seed data.

---

## Roadmap

- **Phase 1 — Foundation** (this commit): project setup, NgRx, layout, theming, shared component library, mock backend
- **Phase 2 — Instruction Setup (Fig 1)**: reactive form, dependent dropdowns, save/submit, attachments
- **Phase 3 — Approval Workflow (Figs 2–5)**: 4 step screens, signature validation, callback log, comments
- **Phase 4 — Dashboard (Fig 6)**: KPI cards, ngx-charts breakdowns, instructions table with ag-grid
- **Phase 5 — Payment Workflow integration**: replace stub with real Citi Direct / Pega APIs

---

## License

Internal — not for public distribution.
