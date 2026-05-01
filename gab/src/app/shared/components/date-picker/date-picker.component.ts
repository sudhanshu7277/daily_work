import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gab-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-datepicker">
      <input
        class="gab-input"
        type="date"
        [id]="controlId"
        [readonly]="readonly"
        [disabled]="disabled"
        [min]="min || null"
        [max]="max || null"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        (blur)="onTouched()"
      />
    </div>
  `,
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() min?: string;
  @Input() max?: string;
  @Input() controlId?: string;

  protected value = '';

  private onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    // Accept ISO datetime → store as YYYY-MM-DD for the date input.
    if (!value) { this.value = ''; return; }
    this.value = value.length > 10 ? value.slice(0, 10) : value;
  }

  registerOnChange(fn: (value: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  protected onValueChange(value: string): void {
    this.onChange(value || null);
  }
}
