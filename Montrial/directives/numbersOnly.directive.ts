import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  private readonly MAX_LENGTH = 10;

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;

    // Remove all non-digit characters
    let digits = input.value.replace(/\D/g, '');

    // Enforce max length
    if (digits.length > this.MAX_LENGTH) {
      digits = digits.substring(0, this.MAX_LENGTH);
    }

    // Update value only if changed
    if (input.value !== digits) {
      input.value = digits;
      input.dispatchEvent(new Event('input'));
    }
  }
}
