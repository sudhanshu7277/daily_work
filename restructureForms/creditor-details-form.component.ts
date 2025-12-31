// creditor-details-form.component.ts
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-creditor-details-form',
  standalone: true,
  imports: [/* your imports */],
  templateUrl: './creditor-details-form.component.html',
})
export class CreditorDetailsFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  isFieldInvalid(field: string): boolean {
    const control = this.formGroup.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  
  getFieldError(field: string): string | null {
    const control = this.formGroup.get(field);
    if (control?.errors?.['required']) {
      return `${field} is required`;  // Customize messages
    }
    return null;
  }

  // Keep your creditorNames array, file handling logic, etc.
}