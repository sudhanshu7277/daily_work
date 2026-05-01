import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'gab-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  protected readonly sidenavCollapsed = signal(false);

  protected onToggleSidenav(): void {
    this.sidenavCollapsed.update((v) => !v);
  }
}
