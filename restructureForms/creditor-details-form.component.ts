// creditor-details-form.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-creditor-details-form',
  standalone: true,
  templateUrl: './creditor-details-form.component.html',
  styleUrls: ['./creditor-details-form.component.scss']
})
export class CreditorDetailsFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Output() formValidityChange = new EventEmitter<boolean>();

  creditorNames = [
    { value: '', label: 'Please Select' },
    { value: 'creditor1', label: 'Creditor 1' },
    { value: 'creditor2', label: 'Creditor 2' },
    { value: 'creditor3', label: 'Creditor 3' }
  ];

  // ADD THIS METHOD
  isFieldInvalid(field: string): boolean {
    const control = this.formGroup.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  // Optional: file handling if you have it
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.formGroup.patchValue({ selectedFile: input.files[0] });
    }
  }
}