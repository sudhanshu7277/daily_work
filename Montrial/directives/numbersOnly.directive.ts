import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Allow ONLY digits
    const digitsOnly = value.replace(/\D/g, '');

    if (value !== digitsOnly) {
      input.value = digitsOnly;
      input.dispatchEvent(new Event('input'));
    }
  }
}
