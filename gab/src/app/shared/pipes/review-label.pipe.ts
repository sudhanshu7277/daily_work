import { Pipe, PipeTransform } from '@angular/core';
import { SelectOption } from '@core/models';

@Pipe({ name: 'reviewLabel', standalone: true, pure: true })
export class ReviewLabelPipe implements PipeTransform {
  transform(options: SelectOption[], value: string | null): string {
    if (!value || !options?.length) return '—';
    return options.find((o) => o.value === value)?.label ?? value;
  }
}
