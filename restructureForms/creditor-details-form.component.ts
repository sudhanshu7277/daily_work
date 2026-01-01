import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-creditor-details-form',
  templateUrl: './creditor-details-form.component.html',
  styleUrls: ['./creditor-details-form.component.scss']
})
export class CreditorDetailsFormComponent {
  @Input() formGroup!: FormGroup;

  creditorNames = [ /* your array */ ];

  isFieldInvalid(field: string): boolean {
    const control = this.formGroup.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}