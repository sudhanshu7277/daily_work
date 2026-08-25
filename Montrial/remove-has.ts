/**
 * Recursively cleans 'roleType' by stripping leading 'has ' or 'Has ' 
 * at the root level and through all nested 'rolePlayers' arrays.
 */
private sanitizeRoleTypes(items: any[]): any[] {
    if (!Array.isArray(items)) return items;
  
    return items.map(item => {
      if (!item) return item;
  
      // Clean roleType on current node
      if (typeof item.roleType === 'string') {
        item.roleType = item.roleType.replace(/^has\s+/i, '').trim();
      }
  
      // Recursively clean children inside rolePlayers array
      if (Array.isArray(item.rolePlayers) && item.rolePlayers.length > 0) {
        item.rolePlayers = this.sanitizeRoleTypes(item.rolePlayers);
      }
  
      return item;
    });
  }


  // Inside performSearch() or your customer service subscription
this.actualCustServ.searchCustomers(criteria).subscribe({
    next: (response: any) => {
      const rawResults = response?.searchResult || [];
  
      // Sanitize roleType at all recursive levels BEFORE setting grid input
      const cleanResults = this.sanitizeRoleTypes(rawResults);
  
      // Assign sanitized data to the grid input property
      this.multiLevelGridData = cleanResults;
      
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('Search failed', err);
    }
  });