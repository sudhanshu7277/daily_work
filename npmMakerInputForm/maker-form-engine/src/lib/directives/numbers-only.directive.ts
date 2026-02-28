import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[numbersOnly]',
  standalone: true
})
export class NumbersOnlyDirective {
  @Input() allowDecimal = true;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    const isControlKey = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(key);
    const isNumber = /^[0-9]$/.test(key);
    const isFirstDecimal = key === '.' && this.allowDecimal && !(event.target as HTMLInputElement).value.includes('.');

    if (!isControlKey && !isNumber && !isFirstDecimal) {
      event.preventDefault();
    }
  }
}