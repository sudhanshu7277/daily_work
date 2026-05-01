import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOption } from '@core/models';

@Component({
  selector: 'gab-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-select">
      <select
        class="gab-select__control"
        [id]="controlId"
        [disabled]="disabled"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        (blur)="onTouched()"
      >
        <option [ngValue]="null" [disabled]="!allowEmpty">{{ placeholder }}</option>
        @for (opt of options; track opt.value) {
          <option [ngValue]="opt.value" [disabled]="opt.disabled">{{ opt.label }}</option>
        }
      </select>
      <span class="gab-select__caret" aria-hidden="true">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>
  `,
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T = string> implements ControlValueAccessor {
  @Input() options: SelectOption<T>[] = [];
  @Input() placeholder = '— Select a value —';
  @Input() allowEmpty = false;
  @Input() disabled = false;
  @Input() controlId?: string;

  protected value: T | null = null;

  private onChange: (value: T | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: T | null): void { this.value = value; }
  registerOnChange(fn: (value: T | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  protected onValueChange(value: T | null): void { this.onChange(value); }
}
