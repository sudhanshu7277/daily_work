//1. In updatePagination() (lines 150–152)

//Replace lines 150–152: 
const sortedRecords = this.getSortedRecords(this.records());
    const start = (this.currentPage() - 1) * this.pageSize();
    this.displayedRecords.set(sortedRecords.slice(start, start + this.pageSize()));


    //with:

    const start = (this.currentPage() - 1) * this.pageSize();
    const currentPageSlice = this.records().slice(start, start + this.pageSize());
    this.displayedRecords.set(this.getSortedRecords(currentPageSlice));

    //2. In onSort() (line 164)

    //Remove or comment out line 164 so sorting stays on the active page instead of resetting to page 1:

    onSort(column: SortColumn): void {
        if (this.sortColumn() === column) {
          this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
          this.sortColumn.set(column);
          this.sortDirection.set('asc');
        }
    
        // Remove or comment out this line:
        // this.currentPage.set(1);
    
        this.updatePagination();
      }


      // The Exact 2 Changes to Fix This:
//Change 1: In bulk-upload.component.html (line 132 in image_40.png / image_41.png)
// Change track $index to track the unique file name:


@for (record of displayedRecords(); track record.fileName) {


    //Change 2: In bulk-upload.component.ts (lines 153–155 in image_33.png)

    //Ensure displayedRecords gets a fresh array reference so Angular's signal triggers UI updates:
    const start = (this.currentPage() - 1) * this.pageSize();
    const currentPageSlice = this.records().slice(start, start + this.pageSize());
    this.displayedRecords.set([...this.getSortedRecords(currentPageSlice)]);
