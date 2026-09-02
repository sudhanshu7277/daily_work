private refresh(): void {
  this.totalRows = this.totalCount || this.tree.length || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Guard: if backend returned full payload instead of a slice, paginate locally
  let displayNodes = this.tree;
  if (this.tree.length > this.pageSize) {
    const start = (this.currentPage - 1) * this.pageSize;
    displayNodes = this.tree.slice(start, start + this.pageSize);
  }

  this.rowData = [...this.flattenTree(displayNodes)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}