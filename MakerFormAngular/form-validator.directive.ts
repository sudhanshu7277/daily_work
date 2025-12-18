import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgForm } from '@angular/forms';

@Directive({
  selector: '[appFormValidator]',
  standalone: true
})
export class FormValidatorDirective {
  @Input() appFormValidator!: NgForm;

  constructor(private el: ElementRef) {}

  @HostListener('submit', ['$event'])
  onFormSubmit(event: Event) {
    if (this.appFormValidator.invalid) {
      event.preventDefault();
      
      // Mark all controls as touched/dirty so the red text appears
      Object.keys(this.appFormValidator.controls).forEach(field => {
        const control = this.appFormValidator.controls[field];
        control.markAsTouched({ onlySelf: true });
      });

      // Focus the first invalid element
      const firstInvalid = this.el.nativeElement.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  }
}