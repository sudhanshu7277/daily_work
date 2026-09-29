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
