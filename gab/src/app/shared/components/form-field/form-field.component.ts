import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

let nextId = 0;

@Component({
  selector: 'gab-form-field',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-field" [class.gab-field--invalid]="invalid">
      @if (label) {
        <label class="gab-field__label" [for]="controlId" [class.gab-field__label--required]="required">
          {{ label }}
          @if (hint) {
            <span class="gab-field__hint-icon" [attr.title]="hint" aria-hidden="true">?</span>
          }
        </label>
      }

      <div class="gab-field__control">
        <ng-content />
      </div>

      @if (error) {
        <span class="gab-field__error" role="alert">{{ error }}</span>
      } @else if (hint && showHint) {
        <span class="gab-field__hint">{{ hint }}</span>
      }
    </div>
  `,
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() required = false;
  @Input() hint?: string;
  @Input() showHint = false;
  @Input() error?: string | null;
  @Input() controlId: string = `gab-field-${++nextId}`;

  protected get invalid(): boolean {
    return !!this.error;
  }
}
