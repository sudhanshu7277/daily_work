import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, filter, take, takeUntil } from 'rxjs';

import {
  CATEGORIES,
  EXCEPTIONS,
  MPP_REQUIRED,
  REQUEST_TYPES,
  SOURCES,
  Category,
  Client,
  Country,
  CreatePaymentInstructionPayload,
  Deal,
  ExceptionType,
  MppRequired,
  Region,
  RequestType,
  SelectOption,
  Source,
  User,
} from '@core/models';
import { LookupService } from '@core/services/lookup.service';
import { FormFieldComponent } from '@shared/components/form-field/form-field.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { TextareaComponent } from '@shared/components/textarea/textarea.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { StatusPillComponent } from '@shared/components/status-pill/status-pill.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { ReviewLabelPipe } from '@shared/pipes/review-label.pipe';
import { InstructionActions } from './store/instruction.actions';
import {
  selectInstructionSaving,
  selectSelectedInstruction,
} from './store/instruction.selectors';

type TabKey = 'overview' | 'documents' | 'review';

@Component({
  selector: 'gab-instruction-setup-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormFieldComponent,
    InputComponent,
    SelectComponent,
    DatePickerComponent,
    TextareaComponent,
    CheckboxComponent,
    ButtonComponent,
    StatusPillComponent,
    SpinnerComponent,
    ReviewLabelPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instruction-setup.component.html',
  styleUrls: ['./instruction-setup.component.scss'],
})
export class InstructionSetupPageComponent implements OnInit, OnDestroy {
  /** Bound from route :id param via withComponentInputBinding */
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly lookup = inject(LookupService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── UI state ──────────────────────────────────────────────────────────────
  protected readonly activeTab = signal<TabKey>('overview');
  protected readonly collapsedSections = signal<Set<string>>(new Set());
  protected readonly additionalRows = signal<AdditionalInfoRow[]>([]);
  protected readonly saving$ = this.store.select(selectInstructionSaving);

  // ── Lookup data ───────────────────────────────────────────────────────────
  protected readonly regions = signal<Region[]>([]);
  protected readonly countries = signal<Country[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly deals = signal<Deal[]>([]);
  protected readonly users = signal<User[]>([]);
  protected readonly lookupsLoading = signal(true);

  // ── Computed select options ───────────────────────────────────────────────
  protected readonly regionOptions = computed<SelectOption[]>(() =>
    this.regions().map((r) => ({ value: r.id, label: r.name }))
  );
  protected readonly countryOptions = computed<SelectOption[]>(() =>
    this.countries().map((c) => ({ value: c.id, label: c.name }))
  );
  protected readonly clientOptions = computed<SelectOption[]>(() =>
    this.clients().map((c) => ({ value: c.id, label: c.name }))
  );
  protected readonly dealOptions = computed<SelectOption[]>(() =>
    this.deals().map((d) => ({ value: d.id, label: d.name }))
  );
  protected readonly userOptions = computed<SelectOption[]>(() =>
    this.users().map((u) => ({ value: u.id, label: u.name }))
  );

  // Static options (won't change)
  protected readonly requestTypeOptions: SelectOption[] = REQUEST_TYPES.map((t) => ({
    value: t,
    label: t,
  }));
  protected readonly sourceOptions: SelectOption[] = SOURCES.map((s) => ({ value: s, label: s }));
  protected readonly categoryOptions: SelectOption[] = CATEGORIES.map((c) => ({
    value: c,
    label: c,
  }));
  protected readonly mppOptions: SelectOption[] = MPP_REQUIRED.map((m) => ({
    value: m,
    label: m,
  }));
  protected readonly exceptionOptions: SelectOption[] = EXCEPTIONS.map((e) => ({
    value: e,
    label: e,
  }));

  // ── Reactive form ─────────────────────────────────────────────────────────
  protected readonly form: FormGroup = this.fb.group({
    clientInformation: this.fb.group({
      regionId: [null as string | null, Validators.required],
      countryId: [null as string | null, Validators.required],
      clientId: [null as string | null, Validators.required],
      dealId: [null as string | null, Validators.required],
      contractValidationComplete: [false],
    }),
    instructionDetails: this.fb.group({
      requestType: [null as string | null, Validators.required],
      source: [null as string | null, Validators.required],
      senderEmail: [''],
      valueDate: [null as string | null, Validators.required],
      dueDate: [null as string | null],
      transactionDate: [null as string | null],
      primaryAssigneeId: [null as string | null, Validators.required],
      backupAssigneeId: [null as string | null],
      category: [null as string | null],
      description: [''],
    }),
    mppProcess: this.fb.group({
      reviewRequired: [false],
      mppRequired: [null as string | null, Validators.required],
      exception: [null as string | null, Validators.required],
    }),
  });

  // ── Derived ───────────────────────────────────────────────────────────────
  protected readonly isNew = computed(() => !this.id);
  protected readonly pageTitle = computed(() =>
    this.id ? `${this.id} — Instruction Setup` : 'Ad Hoc Instruction Setup'
  );

  protected get ciGroup(): FormGroup {
    return this.form.get('clientInformation') as FormGroup;
  }
  protected get idGroup(): FormGroup {
    return this.form.get('instructionDetails') as FormGroup;
  }
  protected get mppGroup(): FormGroup {
    return this.form.get('mppProcess') as FormGroup;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadInitialLookups();
    this.wireRegionCascade();
    this.wireCountryCascade();
    this.wireClientCascade();

    if (this.id) {
      this.store.dispatch(InstructionActions.loadOne({ id: this.id }));
      this.store
        .select(selectSelectedInstruction)
        .pipe(filter(Boolean), take(1), takeUntil(this.destroy$))
        .subscribe((inst) => this.patchFormFromInstruction(inst));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Public template helpers ────────────────────────────────────────────────
  protected setTab(tab: TabKey): void {
    this.activeTab.set(tab);
  }

  protected toggleSection(key: string): void {
    this.collapsedSections.update((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  protected isSectionCollapsed(key: string): boolean {
    return this.collapsedSections().has(key);
  }

  protected fieldError(path: string): string | null {
    const ctrl = this.form.get(path) as AbstractControl | null;
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return null;
    if (ctrl.errors?.['required']) return 'This field is required';
    return null;
  }

  protected isCountryDisabled(): boolean {
    return !this.ciGroup.get('regionId')?.value;
  }
  protected isClientDisabled(): boolean {
    return !this.ciGroup.get('countryId')?.value;
  }
  protected isDealDisabled(): boolean {
    return !this.ciGroup.get('clientId')?.value;
  }

  protected addAdditionalRow(): void {
    this.additionalRows.update((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        awsAccount: '',
        debitAccountNumber: '',
        transactionSystem: '',
        currency: '',
        transactionQuantity: null,
        transactionType: '',
        amount: null,
      },
    ]);
  }

  protected removeAdditionalRow(id: string): void {
    this.additionalRows.update((rows) => rows.filter((r) => r.id !== id));
  }

  protected onCancel(): void {
    this.router.navigate(['/instructions']);
  }

  protected onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: CreatePaymentInstructionPayload = {
      clientInformation: {
        regionId: v.clientInformation.regionId,
        countryId: v.clientInformation.countryId,
        clientId: v.clientInformation.clientId,
        dealId: v.clientInformation.dealId,
        contractValidationComplete: v.clientInformation.contractValidationComplete ?? false,
      },
      instructionDetails: {
        requestType: v.instructionDetails.requestType as RequestType,
        source: v.instructionDetails.source as Source,
        senderEmail: v.instructionDetails.senderEmail || null,
        primaryAssigneeId: v.instructionDetails.primaryAssigneeId,
        backupAssigneeId: v.instructionDetails.backupAssigneeId ?? null,
        category: (v.instructionDetails.category as Category) ?? null,
        description: v.instructionDetails.description ?? '',
        relatedInstructionIds: [],
        valueDate: v.instructionDetails.valueDate,
        dueDate: v.instructionDetails.dueDate ?? null,
        transactionDate: v.instructionDetails.transactionDate ?? null,
      },
      mppProcess: {
        citiDirectClientProfile: { reviewRequired: v.mppProcess.reviewRequired ?? false },
        mppRequired: v.mppProcess.mppRequired as MppRequired,
        exception: v.mppProcess.exception as ExceptionType,
      },
    };
    this.store.dispatch(InstructionActions.create({ payload }));
  }

  // ── Private ───────────────────────────────────────────────────────────────
  private loadInitialLookups(): void {
    this.lookup.getRegions().pipe(takeUntil(this.destroy$)).subscribe((r) => {
      this.regions.set(r);
      this.lookupsLoading.set(false);
    });
    this.lookup.getUsers().pipe(takeUntil(this.destroy$)).subscribe((u) => this.users.set(u));
  }

  private wireRegionCascade(): void {
    this.ciGroup
      .get('regionId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id: string | null) => {
        this.ciGroup.patchValue({ countryId: null, clientId: null, dealId: null });
        this.countries.set([]);
        this.clients.set([]);
        this.deals.set([]);
        if (id) this.lookup.getCountries(id).subscribe((c) => this.countries.set(c));
      });
  }

  private wireCountryCascade(): void {
    this.ciGroup
      .get('countryId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id: string | null) => {
        this.ciGroup.patchValue({ clientId: null, dealId: null });
        this.clients.set([]);
        this.deals.set([]);
        if (id) this.lookup.getClients(id).subscribe((c) => this.clients.set(c));
      });
  }

  private wireClientCascade(): void {
    this.ciGroup
      .get('clientId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id: string | null) => {
        this.ciGroup.patchValue({ dealId: null });
        this.deals.set([]);
        if (id) this.lookup.getDeals(id).subscribe((d) => this.deals.set(d));
      });
  }

  private patchFormFromInstruction(inst: any): void {
    const ci = inst.clientInformation;
    // Load cascades first, then patch
    this.lookup.getCountries(ci.regionId).subscribe((countries) => {
      this.countries.set(countries);
      this.lookup.getClients(ci.countryId).subscribe((clients) => {
        this.clients.set(clients);
        this.lookup.getDeals(ci.clientId).subscribe((deals) => {
          this.deals.set(deals);
          this.form.patchValue({
            clientInformation: ci,
            instructionDetails: {
              requestType: inst.instructionDetails.requestType,
              source: inst.instructionDetails.source,
              senderEmail: inst.instructionDetails.senderEmail ?? '',
              valueDate: inst.instructionDetails.valueDate,
              dueDate: inst.instructionDetails.dueDate,
              transactionDate: inst.instructionDetails.transactionDate,
              primaryAssigneeId: inst.instructionDetails.primaryAssigneeId,
              backupAssigneeId: inst.instructionDetails.backupAssigneeId,
              category: inst.instructionDetails.category,
              description: inst.instructionDetails.description ?? '',
            },
            mppProcess: {
              reviewRequired: inst.mppProcess.citiDirectClientProfile.reviewRequired,
              mppRequired: inst.mppProcess.mppRequired,
              exception: inst.mppProcess.exception,
            },
          });
        });
      });
    });
  }
}

interface AdditionalInfoRow {
  id: string;
  awsAccount: string;
  debitAccountNumber: string;
  transactionSystem: string;
  currency: string;
  transactionQuantity: number | null;
  transactionType: string;
  amount: number | null;
}
