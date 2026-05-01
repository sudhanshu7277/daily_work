import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '@env/environment';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'gab-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  readonly collapsed = signal(false);
  protected readonly version = environment.version;

  @Input() set isCollapsed(value: boolean) {
    this.collapsed.set(value);
  }

  // Inline SVGs keep the bundle small and avoid icon-font weight.
  protected readonly items: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="6" height="8" rx="1.5"/><rect x="11" y="3" width="6" height="4" rx="1.5"/><rect x="11" y="9" width="6" height="8" rx="1.5"/><rect x="3" y="13" width="6" height="4" rx="1.5"/></svg>`,
    },
    {
      path: '/instructions',
      label: 'Instructions',
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M12 3v3h3"/><path d="M7 10h6M7 13h6M7 7h2"/></svg>`,
    },
    {
      path: '/approvals',
      label: 'Approvals',
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2 3 5v5c0 4 2.8 7.4 7 8 4.2-.6 7-4 7-8V5l-7-3Z"/><path d="m7.5 10 2 2 3.5-4"/></svg>`,
    },
    {
      path: '/payments',
      label: 'Payments',
      icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="5" width="15" height="11" rx="1.5"/><path d="M2.5 9h15"/><path d="M5.5 13h3"/></svg>`,
    },
  ];
}
