/**
 * Deduplicates an array of objects by `ocifId`.
 * Ensures the returned array contains only unique objects per `ocifId`.
 */
deduplicateByOcifId<T extends Record<string, any>>(list: T[]): T[] {
    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }
  
    const seenOcifIds = new Set<string | number>();
  
    return list.filter(item => {
      if (!item) return false;
  
      // Grab ocifId (or fallback to ecifId if present)
      const id = item.ocifId ?? item.ecifId;
  
      // If ocifId exists, check if we've already included it
      if (id !== undefined && id !== null && id !== '') {
        if (seenOcifIds.has(id)) {
          return false; // Skip duplicate
        }
        seenOcifIds.add(id);
        return true; // Keep first unique instance
      }
  
      // Keep items without an ocifId
      return true;
    });
  }

  // Pass localCustomerList through the function
this.selectedCustomerList = this.deduplicateByOcifId(localCustomerList);