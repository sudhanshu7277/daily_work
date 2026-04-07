// ─────────────────────────────────────────────────────────────────────────────
// REQUIRED: Add HttpClientModule to your app
// ─────────────────────────────────────────────────────────────────────────────
//
// The EntityGridService injects HttpClient. If HttpClientModule is not
// provided in your app, Angular will throw:
//   "NullInjectorError: No provider for HttpClient"
// and the grid will show nothing.
//
// ── Option A: app.config.ts (standalone app — most common) ──────────────────
//
// import { provideHttpClient } from '@angular/common/http';
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(),   // ← add this line
//   ],
// };
//
// ── Option B: app.module.ts (NgModule app) ───────────────────────────────────
//
// import { HttpClientModule } from '@angular/common/http';
//
// @NgModule({
//   imports: [
//     BrowserModule,
//     HttpClientModule,   // ← add this line
//   ],
// })
// export class AppModule {}
//
// ─────────────────────────────────────────────────────────────────────────────
// DEBUGGING: Open browser console and look for these logs:
//
//   [EntityGrid] Loaded N visible rows
//   [EntityGrid] rowData: ['Corp 2 (L0)', 'Role Player X1 (L1)', ...]
//
// If you see "Loaded 0 visible rows" → tree is empty, check service.
// If you see the rows logged but grid is blank → AG Grid init issue.
// If you see nothing → loadData() is not being called / component not mounted.
// ─────────────────────────────────────────────────────────────────────────────
