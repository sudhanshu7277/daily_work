/// 1. history.component.ts (Pagination & Page Change Fix)
// Replace lines 82 through 207 in history.component.ts with this block:

private getPaginationIndexes() {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = this.currentPage() * this.pageSize();
    return { start, end };
  }
  
  fetchRecords(): void {
    this.isLoading.set(true);
    this.showApiError.set(false);
  
    const { start, end } = this.getPaginationIndexes();
  
    this.historyService.getHistoryRecords(start, end)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const fetchedRecords = response?.records || [];
          const count = response?.totalCount ?? 0;
  
          this.records.set(fetchedRecords);
          this.totalRows.set(count);
  
          const calcTotalPages = Math.ceil(count / this.pageSize());
          this.totalPages.set(calcTotalPages > 0 ? calcTotalPages : 1);
  
          this.applySortAndPaginate();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.showApiError.set(true);
        }
      });
  }
  
  private applySortAndPaginate(): void {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    let sorted = [...this.records()];
  
    if (col) {
      sorted.sort((a, b) => {
        let valA = (a as any)[col] ?? '';
        let valB = (b as any)[col] ?? '';
  
        if (col === 'requestDate') {
          valA = this.parseDateForSort(valA);
          valB = this.parseDateForSort(valB);
        }
  
        const cmp = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      });
    }
  
    // Display records directly (backend handles page slicing)
    this.displayedRecords.set(sorted);
    this.pageNumbers.set(this.buildPageNumbers());
  }
  
  goPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.fetchRecords();
  }
  
  onPageSizeChange(): void {
    this.currentPage.set(1);
    this.fetchRecords();
  }
  
  private buildPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
  
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }
  
  private parseDateForSort(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  }

  // 2. legal-hold-shell.component.ts (Selection Sync & Grid Unchecking Fix)
  // Replace lines 1113 through 1202 in legal-hold-shell.component.ts with this updated selection handler:

  // Add property to class scope if not already declared
private lastEmittedSelections: { [key: string]: any[] } = {
    customer: [],
    entity: [],
    hold: []
  };
  
  private getStoredProfiles(key: string): any[] {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  private setStoredProfiles(key: string, list: any[]): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(list || []));
    } catch {}
  }
  
  deduplicateByOcifId<T extends Record<string, any>>(list: T[]): T[] {
    if (!Array.isArray(list) || list.length === 0) return [];
    const map = new Map<string | number, T>();
    const getId = (item: any) => item?.ocifId ?? item?.ecifId ?? item?.uid ?? item?.id;
  
    list.forEach(item => {
      const id = getId(item);
      if (id !== undefined && id !== null && id !== '') {
        map.set(id, item);
      }
    });
  
    return Array.from(map.values());
  }
  
  handleRemoveProfile(deselectedProfile: any): void {
    if (!deselectedProfile) return;
    const targetId = deselectedProfile.ocifId || deselectedProfile.ecifId || deselectedProfile.uid || deselectedProfile.id;
    const filterFn = (list: any[]) => (list || []).filter(p => (p.ocifId || p.ecifId || p.uid || p.id) !== targetId);
  
    this.selectedCustomerList = filterFn(this.selectedCustomerList);
    this.selectedEntityList = filterFn(this.selectedEntityList);
    this.selectedLegalHoldList = filterFn(this.selectedLegalHoldList);
  
    this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
    this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
    this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
  
    this.deletedProfileEcifId = deselectedProfile;
    this.cdr.detectChanges();
  }
  
  handleSelectionChange(selectedRows: any): void {
    if (!selectedRows || !selectedRows.identifier) return;
  
    const category = selectedRows.identifier;
    const storageKey = category === 'customer' ? 'selectedCustomerList'
                     : category === 'entity' ? 'selectedEntityList'
                     : 'selectedLegalHoldList';
  
    const incomingSelected: any[] = Array.isArray(selectedRows.selected) ? selectedRows.selected : [];
    const getId = (item: any) => item?.ocifId || item?.ecifId || item?.uid || item?.id;
  
    // 1. Fetch current session-persisted records
    const masterListFromSession = this.getStoredProfiles(storageKey);
  
    // 2. Identify rows unchecked in this grid view toggle
    const previousGridState = this.lastEmittedSelections[category] || [];
    const incomingIds = new Set(incomingSelected.map(r => getId(r)));
  
    const uncheckedIds = new Set<string | number>();
    previousGridState.forEach(item => {
      const id = getId(item);
      if (id && !incomingIds.has(id)) {
        uncheckedIds.add(id);
      }
    });
  
    // 3. Update grid tracker
    this.lastEmittedSelections[category] = incomingSelected;
  
    // 4. Remove explicitly unchecked items & append newly checked items
    let updatedList = masterListFromSession.filter(item => !uncheckedIds.has(getId(item)));
    updatedList = this.deduplicateByOcifId([...updatedList, ...incomingSelected]);
  
    // 5. Update Component state and Session Storage
    if (category === 'customer') {
      this.selectedCustomerList = updatedList;
    } else if (category === 'entity') {
      this.selectedEntityList = updatedList;
    } else if (category === 'hold') {
      this.selectedLegalHoldList = updatedList;
    }
  
    this.setStoredProfiles(storageKey, updatedList);
    this.cacheIndividualAndEntityProfiles(storageKey, updatedList);
  
    this.cdr.detectChanges();
  }