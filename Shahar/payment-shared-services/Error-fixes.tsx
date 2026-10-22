//Here are the final, exact code modifications for both files:

//api-error-mapper.service.ts

//Step A: Update type ApiOperation (line 2)

type ApiOperation = 'search' | 'applyRelease' | 'history' | 'bulkUpload' | 'bulkUploadPagination';

//Step B: Add 'bulkUpload' and 'bulkUploadPagination' in getMessage() (under operation === 'history', around line 34)

if (operation === 'bulkUpload') {
  if (status === 401 || status === 403 || message.includes('cognito token')) {
    return 'Your session could not be verified. Sign in again and retry.';
  }
  if (status === 400) {
    return 'Bulk upload records could not be retrieved because the request is incomplete. Please try again.';
  }
  return 'Bulk Upload service temporarily unavailable. Please try again later.';
}

if (operation === 'bulkUploadPagination') {
  if (status === 401 || status === 403 || message.includes('cognito token')) {
    return 'Your session could not be verified. Sign in again and retry.';
  }
  return 'Unable to load additional pages. Please refresh the page';
}


//2. bulk-upload.component.ts
//Step A: Import ApiErrorMapper
//Add the import at the top of the file:

import { ApiErrorMapper } from '../../shared/services/api-error-mapper.service';


//Step B: Replace fetchRecords() (lines 125–147)

fetchRecords(isPagination: boolean = false): void {
  this.isLoading.set(true);

  if (isPagination) {
    this.bulkUploadDataError.set('');
  }

  this.bulkUploadService.getBulkUploads()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        this.records.set(response.records || []);
        this.totalRows.set(response.totalCount || 0);
        this.updatePagination();
        this.isLoading.set(false);

        if (!response.records || response.records.length === 0) {
          this.records.set([]);
          this.totalRows.set(0);
          if (!isPagination) {
            this.bulkUploadDataError.set('Bulk Upload service temporarily unavailable. Please try again later.');
          }
        }
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        if (isPagination) {
          this.bulkUploadDataError.set(
            ApiErrorMapper.toUserMessage('bulkUploadPagination', error)
          );
        } else {
          this.bulkUploadDataError.set(
            ApiErrorMapper.toUserMessage('bulkUpload', error)
          );
        }
      }
    });
}

//Step C: Update goPage() (lines 251–255)

goPage(page: number): void {
  if (page < 1 || page > this.totalPages()) return;
  this.currentPage.set(page);

  const neededIndex = (page - 1) * this.pageSize();
  if (this.records().length <= neededIndex) {
    this.fetchRecords(true);
  } else {
    this.updatePagination();
  }
}