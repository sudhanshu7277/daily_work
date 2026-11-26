
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

