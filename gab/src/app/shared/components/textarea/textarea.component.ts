import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gab-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <textarea
      class="gab-textarea"
      [id]="controlId"
      [placeholder]="placeholder"
      [readonly]="readonly"
      [disabled]="disabled"
      [rows]="rows"
      [attr.maxlength]="maxlength || null"
      [(ngModel)]="value"
      (ngModelChange)="onValueChange($event)"
      (blur)="onTouched()"
    ></textarea>
    @if (maxlength) {
      <span class="gab-textarea__count">{{ (value || '').length }}/{{ maxlength }}</span>
    }
  `,
  styleUrls: ['./textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() rows = 3;
  @Input() maxlength?: number;
  @Input() controlId?: string;

  protected value = '';

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string): void { this.value = value ?? ''; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  protected onValueChange(value: string): void { this.onChange(value); }
}
