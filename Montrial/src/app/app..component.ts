import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="app-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-content {
      background-color: #FAFAFA;
      min-height: calc(100vh - 72px);
      display: block;
    }
  `]
})
export class AppComponent {
  title = 'bmo-legal';
}