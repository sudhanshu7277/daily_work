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


/////////// NEW CODE

import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumbersOnlyDirective } from '../directives/numbers-only.directive';
import { FieldDef } from '../models/form-schema.model';

@Component({
  selector: 'lib-form-engine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NumbersOnlyDirective],
  templateUrl: './form-engine.component.html',
  styleUrls: ['./form-engine.component.scss']
})
export class FormEngineComponent implements OnInit, OnChanges {
  @Input({ required: true }) fieldDefs: FieldDef[] = [];
  @Input() role: 'MAKER' | 'CHECKER' = 'MAKER';

  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({});
  isAmountRevealed = false;

  ngOnInit() {
    this.generateForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-generate if fieldDefs (API data) or role changes
    if ((changes['fieldDefs'] || changes['role']) && !changes['fieldDefs']?.firstChange) {
      this.generateForm();
    }
  }

  // private generateForm() {
  //   const group: any = {};
    
  //   this.fieldDefs.forEach(field => {
  //     group[field.key] = this.fb.control(
  //       field.initialValue ?? '', 
  //       field.required ? Validators.required : null
  //     );
  //   });

  //   this.form = this.fb.group(group);

  //   if (this.role === 'CHECKER') {
  //     this.form.disable(); // Lock the entire form
      
  //     // Selectively enable 'amount' so the Checker can edit it
  //     if (this.form.get('amount')) {
  //       this.form.get('amount')?.enable();
  //     }
  //   }
  // }

  private generateForm() {
  const group: any = {};
  
  this.fieldDefs.forEach(field => {
    // 1. Create the control
    group[field.key] = this.fb.control(
      '', // Start empty
      field.required ? Validators.required : null
    );
  });

  this.form = this.fb.group(group);

  // 2. Populate (Pre-populate) the values from fieldDefs
  const patchData: any = {};
  this.fieldDefs.forEach(field => {
    if (field.initialValue !== undefined) {
      patchData[field.key] = field.initialValue;
    }
  });
  
  this.form.patchValue(patchData);

  // 3. Handle Checker specific locking
  if (this.role === 'CHECKER') {
    this.form.disable();
    if (this.form.get('amount')) {
      this.form.get('amount')?.enable();
    }
  }
}

  revealAmount(fieldKey: string) {
    if (this.role === 'CHECKER' && fieldKey === 'amount') {
      this.isAmountRevealed = true;
    }
  }

  handleFieldEvent(field: FieldDef, eventType: string) {
    // Implementation for blur/change logic
  }
}