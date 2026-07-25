/**
 * Deduplicates objects in an array based on `ecifId`.
 * Items without an `ecifId` are preserved as-is.
 * 
 * @param list - The array of records to filter
 * @returns Array with duplicates removed for records that have an ecifId
 */
deduplicateByEcifId<T extends Record<string, any>>(list: T[]): T[] {
    if (!Array.isArray(list) || !list.length) {
      return [];
    }
  
    const seenEcifIds = new Set<string | number>();
  
    return list.filter(item => {
      if (!item) return false;
  
      const ecifId = item.ecifId;
  
      // If ecifId exists, check for duplicates
      if (ecifId !== undefined && ecifId !== null && ecifId !== '') {
        if (seenEcifIds.has(ecifId)) {
          return false; // Omit duplicate ecifId
        }
        seenEcifIds.add(ecifId);
        return true;
      }
  
      // Keep items that don't have an ecifId
      return true;
    });
  }