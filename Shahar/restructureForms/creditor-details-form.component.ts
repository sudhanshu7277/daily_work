import { Component, Input, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-creditor-details-form',
  templateUrl: './creditor-details-form.component.html',
  styleUrls: ['./creditor-details-form.component.scss'],
  standalone: true
})
export class CreditorDetailsFormComponent {
    @Input() formGroup!: FormGroup;

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['formGroup'] && this.formGroup) {
        // Optional: do something when formGroup arrives (rarely needed)
        console.log('FormGroup received in child');
      }
    }
  
    isFieldInvalid(field: string): boolean {
      if (!this.formGroup) return false; // Safety guard
      const control = this.formGroup.get(field);
      return !!control && control.invalid && (control.touched || control.dirty);
    }
}