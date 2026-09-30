//The Consolidated, Production-Grade Changes
// 1. In bulk-upload.component.html (Line 132)
// Update the track expression:

@for (record of displayedRecords(); track (record.inputFilePath || (record.fileName + '_' + $index))) {


    //2. In bulk-upload.component.ts
// A. Update updatePagination() and onSort() (Lines 148–170):

updatePagination(): void {
    this.totalPages.set(Math.ceil(this.totalRows() / this.pageSize()));
    
    const start = (this.currentPage() - 1) * this.pageSize();
    const currentPageSlice = this.records().slice(start, start + this.pageSize());
    
    // Sort exclusively the current page's slice and update the signal
    this.displayedRecords.set(this.getSortedRecords(currentPageSlice));
    this.pageNumbers.set(this.buildPageNumbers());
  }
  
  onSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  
    // Do NOT reset currentPage to 1; sort the records on whatever page the user is currently on
    this.updatePagination();
  }


  // B. Update getSortedRecords() and parseDateForSort() (Lines 187–217):

  private getSortedRecords(records: BulkUploadRecord[]): BulkUploadRecord[] {
    const col = this.sortColumn();
    if (!col) {
      return records;
    }
  
    const dir = this.sortDirection();
    const sorted = [...records];
  
    sorted.sort((a, b) => {
      if (col === 'uploadDate') {
        const timeA = this.parseDateForSort(a.uploadDate);
        const timeB = this.parseDateForSort(b.uploadDate);
        const diff = timeA - timeB;
        return dir === 'asc' ? diff : -diff;
      }
  
      // Sort fileName using formatFileName so display matches sort order
      let valA = '';
      let valB = '';
  
      if (col === 'fileName') {
        valA = String(this.formatFileName(a.fileName) ?? '').toLowerCase();
        valB = String(this.formatFileName(b.fileName) ?? '').toLowerCase();
      } else {
        valA = String(a[col] ?? '').toLowerCase();
        valB = String(b[col] ?? '').toLowerCase();
      }
  
      const cmp = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
  
    return sorted;
  }
  
  private parseDateForSort(value: string): number {
    if (!value) return 0;
    const str = String(value).trim();
    
    // Convert DD/MM/YYYY into standard ISO YYYY-MM-DD for reliable parsing
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


  