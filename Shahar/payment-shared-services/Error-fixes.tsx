//1. In search-legal-hold.component.ts
Block onSearch() when any max-limit flags are raised:

onSearch(): void {
  if (
    this.searchForm.invalid ||
    this.isHoldNameMaxExceeded ||
    this.isEdiscoveryMaxExceeded ||
    this.isLawyerEmailMaxExceeded
  ) {
    this.searchForm.markAllAsTouched();
    return;
  }

  if (this.searchForm.valid) {
    let realLegalHoldSearchPayload = {
      // ... payload and searchTriggered emit logic remains untouched


//Also reset these flags when the user clicks Clear in onClear() (line 240):   

onClear(): void {
  this.isHoldNameMaxExceeded = false;
  this.isEdiscoveryMaxExceeded = false;
  this.isLawyerEmailMaxExceeded = false;
  this.searchForm.reset({
    holdName: '',
    lawyerEmail: '',
    // ...
  });
}


//2. In search-legal-hold.component.htmlAdd the [disabled] check to the Search button (lines 186–191):   

<button
  type="submit"
  class="search-pill-btn"
  [disabled]="searchForm.invalid || isHoldNameMaxExceeded || isEdiscoveryMaxExceeded || isLawyerEmailMaxExceeded"
  (click)="onSearch()"
>
  {{ searchLegalHoldVerbiage.search | translate }}
</button>


