import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NumbersOnlyDirective } from '../directives/numbers-only.directive';
import { FieldDef } from '../models/form-schema.model';

@Component({
  selector: 'lib-form-engine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, NumbersOnlyDirective],
  templateUrl: './form-engine.component.html',
  styleUrls: ['./form-engine.component.scss']
})
export class FormEngineComponent implements OnInit {
  private fb = inject(FormBuilder);
  @Input({ required: true }) fieldDefs: FieldDef[] = [];
  @Input() initialValues: any = {};
  @Input() role: 'MAKER' | 'CHECKER' = 'MAKER';

  @Output() onAction = new EventEmitter<{ identifier: string, value: any, key: string }>();

  form!: FormGroup;

  ngOnInit() {
    const group: any = {};
    this.fieldDefs.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      if (field.pattern) validators.push(Validators.pattern(field.pattern));

      group[field.key] = [
        { value: this.initialValues[field.key] || null, disabled: this.role === 'CHECKER' },
        validators
      ];
    });
    this.form = this.fb.group(group);
  }

  handleFieldEvent(field: FieldDef, eventType: 'change' | 'blur') {
    if (field.apiConfig?.triggerEvent === eventType) {
      this.onAction.emit({
        identifier: field.apiConfig.identifier,
        value: this.form.get(field.key)?.value,
        key: field.key
      });
    }
  }
}