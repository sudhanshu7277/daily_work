//File 1: bulk-upload.component.html
// Find line 132 (the @for loop over displayedRecords()):

///Change Line 132:

@for (record of displayedRecords(); track $index) {

    //to:

    @for (record of displayedRecords(); track (record.inputFilePath || record.fileName + $index)) {



//File 2: bulk-upload.component.ts

//Change 1: In updatePagination() (around lines 150–154)

//Replace:

const sortedRecords = this.getSortedRecords(this.records());
    const start = (this.currentPage() - 1) * this.pageSize();
    this.displayedRecords.set(sortedRecords.slice(start, start + this.pageSize()));


    //with:

    const start = (this.currentPage() - 1) * this.pageSize();
    const currentPageSlice = this.records().slice(start, start + this.pageSize());
    this.displayedRecords.set([...this.getSortedRecords(currentPageSlice)]);

    //Change 2: In onSort() (around lines 164–165)
:

// Do not reset to page 1 when sorting the current page. Remove or comment out:
// this.currentPage.set(1);


//Change 3: In parseDateForSort() (around lines 213–216)
/// Replace:


private parseDateForSort(value: string): number {
    const parsed = Date.parse(String(value ?? ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  }


  //with:

  private parseDateForSort(value: string): number {
    if (!value) return 0;
    const str = String(value).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
        const d = Date.parse(iso);
        return Number.isNaN(d) ? 0 : d;
      }
    }
    const parsed = Date.parse(str);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

