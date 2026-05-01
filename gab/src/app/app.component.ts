import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Root component of the application.
 *
 * Non-standalone by design — declared in AppModule. Every other component
 * in this app is standalone and either imported directly by its consumer or
 * lazy-loaded via the router. The <router-outlet> directive used in the
 * template comes from RouterModule, which AppModule imports.
 */
@Component({
  selector: 'gab-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export class AppComponent {}
