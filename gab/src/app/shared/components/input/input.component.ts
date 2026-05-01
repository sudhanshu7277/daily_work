import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gab-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      class="gab-input"
      [type]="type"
      [id]="controlId"
      [placeholder]="placeholder"
      [readonly]="readonly"
      [disabled]="disabled"
      [attr.maxlength]="maxlength || null"
      [attr.autocomplete]="autocomplete"
      [(ngModel)]="value"
      (ngModelChange)="onValueChange($event)"
      (blur)="onTouched()"
    />
  `,
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' = 'text';
  @Input() placeholder = '';
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() maxlength?: number;
  @Input() autocomplete: string = 'off';
  @Input() controlId?: string;

  protected value: string | number | null = '';

  private onChange: (value: string | number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | number | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onValueChange(value: string | number | null): void {
    this.onChange(value);
  }
}
