import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-creditor-details-form',
  standalone: true,
  templateUrl: './creditor-details-form.component.html'
})
export class CreditorDetailsFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Output() formValidityChange = new EventEmitter<boolean>();

  creditorNames = [
    { value: '', label: 'Please Select' },
    { value: 'creditor1', label: 'Creditor 1' },
    { value: 'creditor2', label: 'Creditor 2' }
  ];
}