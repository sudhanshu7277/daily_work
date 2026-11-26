
    // Bulk upload fix


    private applyHeaderValidation(file: File, rows: string[][]): void {
      if (!rows.some(row => row.length > 0)) {
        this.showReadError('BULK_UPLOAD.ERROR_UNREADABLE_TITLE', 'BULK_UPLOAD.ERROR_UNREADABLE_MSG');
        return;
      }
  
      // Defect fix: reject files with more than 17 non-empty columns (beyond Column Q)
      if (rows.some(row => row.filter(cell => cell.trim() !== '').length > 17)) {
        this.showReadError('BULK_UPLOAD.ERROR_INVALID_FORMAT_TITLE', 'BULK_UPLOAD.ERROR_INVALID_FORMAT_MSG');
        return;
      }
  
      let bestMissing: string[] = [...this.MANDATORY_HEADERS];
      let matchedHeaderRowIndex = -1;
  
      for (let i = 0; i < rows.length; i++) {
        const headers = rows[i].map(value => value.trim().replace(/\s+/g, ' '));
  
        // Check if this row has at least one mandatory header
        const hasAnyMandatory = headers.some(h =>
          this.MANDATORY_HEADERS.some(req => this.isMandatoryHeaderMatch(h, req))
        );
        if (!hasAnyMandatory) continue;
  
        const missing = this.MANDATORY_HEADERS.filter(
          required => !headers.some(h => this.isMandatoryHeaderMatch(h, required))
        );
  
        // Keep the result with the fewest missing headers
        if (missing.length < bestMissing.length) {
          bestMissing = missing;
          if (missing.length === 0) {
            matchedHeaderRowIndex = i;
          }
        }
      }
  
      if (bestMissing.length > 0) {
        this.missingHeaders.set(bestMissing);
        this.dialogError.set('missing-headers');
        this.dialogErrorTitle.set('BULK_UPLOAD.ERROR_MISSING_HEADERS_TITLE');
        this.dialogErrorMessageKey.set('BULK_UPLOAD.ERROR_MISSING_HEADERS_MSG');
        this.selectedFile.set(null);
      } else {
        // Defect fix: require at least 1 non-empty data record below the matched header row
        const hasAtLeastOneRecord =
          matchedHeaderRowIndex >= 0 &&
          rows.slice(matchedHeaderRowIndex + 1).some(row => row.some(cell => cell.trim() !== ''));
  
        if (!hasAtLeastOneRecord) {
          this.showReadError('BULK_UPLOAD.ERROR_UNREADABLE_TITLE', 'BULK_UPLOAD.ERROR_UNREADABLE_MSG');
          return;
        }
  
        this.missingHeaders.set([]);
        this.dialogError.set('none');
        this.selectedFile.set(file);
      }
      this.restoreDialogFocus();
    }


    /// Single File Change: UI/src/app/shared/components/selection-panel/selection-panel.component.ts
//Add getCachedSearchProfiles() right above validateDuplicateHoldName() (lines 587–604) 
// and update validateDuplicateHoldName() to check both this.selectedProfiles and any cached 
// search record sharing an ecifId with a selected profile:


private getCachedSearchProfiles(): any[] {
  const keys = [
    'individualSearchResult',
    'entitySearchResult',
    'legalHoldSearchResult',
  ];
  const results: any[] = [];

  for (const key of keys) {
    const raw = this.sessionStorageService.getItem<any>(key);
    if (!raw) continue;

    let parsed = raw;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }
    }

    const list = Array.isArray(parsed)
      ? parsed
      : parsed?.data || parsed?.profiles || parsed?.items || [];

    if (Array.isArray(list)) {
      for (const row of list) {
        results.push(row);
        if (Array.isArray(row?.children)) results.push(...row.children);
        if (Array.isArray(row?.rolePlayers)) results.push(...row.rolePlayers);
      }
    }
  }

  return results;
}

private validateDuplicateHoldName() {
  const normalizedHoldName = this.normalize(this.holdNameControl.value || '');
  if (!normalizedHoldName) {
    this.duplicateHoldError = '';
    return;
  }

  const hasSameAppliedHold = (profile: any): boolean => {
    const existingHoldName = this.normalize(profile?.holdName || '');
    const statusValue = profile?.legalHoldStatus ?? profile?.status;
    const isAlreadyAppliedStatus =
      mapLegalHoldStatusToUi(statusValue) === UiLegalHoldStatus.LegalHold;
    return isAlreadyAppliedStatus && existingHoldName === normalizedHoldName;
  };

  const selectedEcifs = new Set(
    (this.selectedProfiles || [])
      .map((p: any) => this.getProfileEcif(p))
      .filter(Boolean)
  );

  const duplicateExists =
    (this.selectedProfiles || []).some((profile: any) => hasSameAppliedHold(profile)) ||
    (selectedEcifs.size > 0 &&
      this.getCachedSearchProfiles().some((profile: any) => {
        const ecif = this.getProfileEcif(profile);
        return !!ecif && selectedEcifs.has(ecif) && hasSameAppliedHold(profile);
      }));

  this.duplicateHoldError = duplicateExists
    ? 'SELECTED_PROFILES.DUPLICATE_HOLD_NAME_TITLE'
    : '';
}



///// 
/// 1. search-customer.component.ts (inside onBeforeInputCheck,
//  lines 555–576)Block any leading whitespace at index 0 (whether typed as ' '
//  or pasted with leading spaces) right after if (!inputEvent.data) { return; }:   


onBeforeInputCheck(event: Event, controlName: string, maxLen: number): void {
  const inputEvent = event as InputEvent;
  if (!inputEvent.data) {
    const ctrl = this.searchForm.get(controlName);
    if (ctrl?.hasError('maxlength')) {
      const { maxlength, ...rest } = ctrl.errors || {};
      ctrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return;
  }

  const target = inputEvent.target as HTMLInputElement;
  const currentVal = target.value || '';
  const selectionStart = target.selectionStart ?? 0;

  // Prevent leading spaces at the start of the input
  if (selectionStart === 0 && /^\s/.test(inputEvent.data)) {
    inputEvent.preventDefault();
    return;
  }

  const selectedLength = (target.selectionEnd ?? 0) - selectionStart;
  const newTotalLength = currentVal.length - selectedLength + inputEvent.data.length;
  if (newTotalLength > maxLen) {
    inputEvent.preventDefault();
    const ctrl = this.searchForm.get(controlName);
    ctrl?.setErrors({ ...(ctrl.errors || {}), maxlength: true });
    ctrl?.markAsDirty();
  }
}


/// 2. search-legal-hold.component.ts (inside onBeforeInputCheck, l
// ines 265–312)Add the exact same leading-space check right after if (!inputEvent.data) { return; }:   


if (!inputEvent.data) {
  return;
}

const target = inputEvent.target as HTMLInputElement;
const currentVal = target.value || '';
const selectionStart = target.selectionStart ?? 0;

// Prevent leading spaces at the start of the input
if (selectionStart === 0 && /^\s/.test(inputEvent.data)) {
  inputEvent.preventDefault();
  return;
}
