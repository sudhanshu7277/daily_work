import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDigitsOnly]'
})
export class DigitsOnlyDirective {

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const initialValue = input.value;

    // Replace anything that's not a digit
    input.value = initialValue.replace(/[^0-9]/g, '');

    // Trigger input event if value changed
    if (initialValue !== input.value) {
      input.dispatchEvent(new Event('input'));
    }
  }
}
