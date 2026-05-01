import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'gab-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="gab-page-header">
      @if (breadcrumbs?.length) {
        <nav class="gab-page-header__crumbs" aria-label="Breadcrumb">
          @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
            @if (crumb.path && !last) {
              <a [routerLink]="crumb.path" class="gab-page-header__crumb">{{ crumb.label }}</a>
            } @else {
              <span
                class="gab-page-header__crumb"
                [class.gab-page-header__crumb--current]="last"
                [attr.aria-current]="last ? 'page' : null"
              >{{ crumb.label }}</span>
            }
            @if (!last) {
              <span class="gab-page-header__separator" aria-hidden="true">/</span>
            }
          }
        </nav>
      }

      <div class="gab-page-header__bar">
        <div class="gab-page-header__titles">
          <h1 class="gab-page-header__title">{{ title }}</h1>
          @if (subtitle) {
            <p class="gab-page-header__subtitle">{{ subtitle }}</p>
          }
        </div>
        <div class="gab-page-header__actions">
          <ng-content select="[page-actions]" />
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
}
