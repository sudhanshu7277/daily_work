// history poagination fix

private buildPageNumbers(): (number | string)[] {
  const pages: (number | string)[] = [];
  const total = this.totalPages();
  const current = this.currentPage();

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    // Show 5 pages at the start (1, 2, 3, 4, 5 ... total)
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } 
    // Show 5 pages at the end (1 ... total-4, total-3, total-2, total-1, total)
    else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } 
    // Sliding window of 5 pages centered around current (1 ... current-1, current, current+1 ... total)
    else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
  }

  return pages;
}