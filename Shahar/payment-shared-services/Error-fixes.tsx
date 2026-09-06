formatAccountList(accounts: { accountType: string; accountNumber: string }[]): string {
  const grouped = new Map<string, string[]>();

  if (!Array.isArray(accounts) || accounts.length === 0) {
    return '';
  }

  for (const a of accounts) {
    if (!a) continue;

    const rawType = (a.accountType || '').trim();
    let type = rawType;
    let acNumber: string = '';

    // Check if the entry represents a card
    const isCreditCard = rawType.toLowerCase() === 'credit card';
    const isDebitCard = /debit\s*card/i.test(rawType);

    if (isCreditCard || isDebitCard) {
      // 1. Sanitize to pure digits (handles '0005-1912...', spaces, or plain numbers)
      const digitsOnly = String(a.accountNumber || '').replace(/\D/g, '');

      // 2. Remove system prefix padding:
      // Standard card numbers are 16 digits.
      // If the backend adds a prefix (e.g. 20 digits like 0005-...), take the last 16.
      // If it is 16 or fewer digits with leading zeros, strip the zeros.
      let cleanDigits = digitsOnly;
      if (cleanDigits.length > 16) {
        cleanDigits = cleanDigits.slice(-16);
      } else {
        cleanDigits = cleanDigits.replace(/^0+/, '');
      }

      // 3. Apply standard 4-digit grouping (XXXX-XXXX-XXXX-XXXX)
      if (cleanDigits.length === 16) {
        acNumber = cleanDigits.match(/.{1,4}/g)?.join('-') || cleanDigits;
      } else if (cleanDigits.length > 0) {
        // Fallback if card length is non-standard (e.g. 15-digit Amex or partial)
        acNumber = cleanDigits.match(/.{1,4}/g)?.join('-') || cleanDigits;
      } else {
        acNumber = String(a.accountNumber || '');
      }
    } else {
      // Standard formatting for all other non-card account types (Chequing, Savings, etc.)
      acNumber = this.formatAccountNumbersInText(a.accountNumber);
    }

    const nums = grouped.get(type) ?? [];
    nums.push(acNumber);
    grouped.set(type, nums);
  }

  return Array.from(grouped.entries())
    .map(([type, nums]) => `<strong>${type}:</strong> ${nums.join('; ')}`)
    .join('<br>');
}

// QUESTION TO QA

Copy and paste this message on the defect or Slack/Teams:

Regarding Homeowner ReadiLine Account Number:

The UI currently receives 0000-000022090124214 in the API response (which contains only the 11-digit internal account number 22090124214).

In Customer Connect, the expected number is displayed as 9105-2220-9012-4214 (16 digits).

Because the 9105 prefix does not exist anywhere in the payload sent to the frontend, could backend confirm:

Is there an API field mapping update needed from NCCS to send the full 16-digit customer card/account number?

Or is the UI supposed to display the 11-digit account number directly without the 16-digit hyphenation?





// 1. TypeScript Form Definition (.component.ts)
// Add Validators.pattern(/^[a-zA-Z0-9 ]*$/) to line 129 so the form control flags special characters under the 'pattern' error key:


this.applyForm = this.formBuilder.group({
  holdName: ['', [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[a-zA-Z0-9 ]*$/)
  ]],
  managerName: ['', [Validators.required]],
  lawyerEmail: ['', [Validators.required, Validators.email]]
});


// 2. TypeScript Event Handler (.component.ts)
// Keep onHoldNameChanged() simple without stripping input, so the invalid characters remain in the field and trigger the validator:

onHoldNameChanged(): void {
  this.duplicateHoldError = '';
  this.validateDuplicateHoldName();
}


// 3. HTML Template (.component.html)
// Under the <input id="apply-hold-name"> block (lines 147–152), add the pattern error message:

@if (showControlError(holdNameControl) && holdNameControl.hasError('required')) {
  <div id="apply-hold-name-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Enter Legal Hold Name</span>
  </div>
}

@if (showControlError(holdNameControl) && holdNameControl.hasError('pattern')) {
  <div id="apply-hold-name-pattern-error" class="validation-error inline-field-error" role="alert">
    <mat-icon class="validation-error-icon" aria-hidden="true">error_outline</mat-icon>
    <span>Special characters are not allowed</span>
  </div>
}


// 1. Template (selection-panel.component.html)
// In <ng-template #releaseModal>, replace the current <th> for the Name 
// column (lines 282–285 in image 25) with the exact SVG markup from the Apply modal:


<th class="col-name sortable" tabindex="0"
  [attr.aria-sort]="releaseSortDirection === 'asc' ? 'ascending' : releaseSortDirection === 'desc' ? 'descending' : 'none'"
  (click)="toggleReleaseSort()"
  (keydown.enter)="toggleReleaseSort()"
  (keydown.space)="$event.preventDefault(); toggleReleaseSort()">
  <span>{{ 'RELEASE_MODAL.COL_NAME' | translate }}</span>
  <svg class="sort-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Up Arrow -->
    <path [class.arrow-active]="releaseSortDirection === 'asc'" class="arrow-path"
      d="M4 11V3M4 3L1.5 5.5M4 3L6.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Down Arrow -->
    <path [class.arrow-active]="releaseSortDirection === 'desc'" class="arrow-path"
      d="M10 3V11M10 11L7.5 8.5M10 11L12.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</th>


// 2. TypeScript (selection-panel.component.ts)
// In image 27, line 327 in toggleApplySort() has this.cdr.detectChanges();. 
// Add that same call to toggleReleaseSort() right before line 337 so the view 
// updates immediately on click:


toggleReleaseSort(): void {
  this.releaseSortDirection = this.releaseSortDirection === 'asc' ? 'desc' : 'asc';
  this.releaseModalRows = [...this.releaseModalRows].sort((a, b) => {
    const nameA = (a.legalName || a.profileName || '').toLowerCase();
    const nameB = (b.legalName || b.profileName || '').toLowerCase();
    return this.releaseSortDirection === 'asc'
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });
  this.cdr.detectChanges();
}

// Ensure releaseSortDirection is declared as a property on the component class 
// (similar to applySortDirection):


releaseSortDirection: 'asc' | 'desc' = 'asc';


