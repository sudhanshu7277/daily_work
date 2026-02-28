import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormCrudService } from '../services/form-crud.service';
import { NumbersOnlyDirective } from '../directives/numbers-only.directive';
import { DynamicFormConfig } from '../models/form-config.model';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'lib-maker-form',
  standalone: true,
  imports: [
    CommonModule, 
  ReactiveFormsModule, 
  NumbersOnlyDirective,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatButtonModule
  ],
  templateUrl: './maker-form.component.html',
  styleUrls: ['./maker-form.component.scss']
})
export class MakerFormComponent implements OnInit {
  @Input({ required: true }) config!: DynamicFormConfig;
  @Output() formSubmitSuccess = new EventEmitter<any>();
  @Output() valueChanges = new EventEmitter<any>();

  form!: FormGroup;
  dropdownData = signal<Record<string, any[]>>({});
  isLoading = signal(false);

  private fb = inject(FormBuilder);
  private crud = inject(FormCrudService);

  ngOnInit() {
    this.createForm();
    this.fetchRemoteOptions();
    this.form.valueChanges.subscribe(val => this.valueChanges.emit(val));
  }

  private createForm() {
    const group: any = {};
    this.config.sections.forEach(sec => {
      sec.fields.forEach(f => {
        group[f.key] = [null, f.required ? Validators.required : []];
      });
    });
    this.form = this.fb.group(group);
  }

  private fetchRemoteOptions() {
    const requests: any = {};
    this.config.sections.forEach(sec => {
      sec.fields.forEach(f => {
        if (f.type === 'select' && f.optionsUrl) {
          requests[f.key] = this.crud.getOptions(f.optionsUrl).pipe(catchError(() => of([])));
        }
      });
    });

    if (Object.keys(requests).length) {
      forkJoin(requests).subscribe((res: any) => this.dropdownData.set(res));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.crud.postData(this.config.saveUrl, this.form.value)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe(res => this.formSubmitSuccess.emit(res));
    }
  }
}