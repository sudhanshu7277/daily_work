/**
 * Removes objects from an array where multiple objects share the exact same `ecifId`.
 * Items without an `ecifId` or with unique `ecifId` values are preserved.
 *
 * @param list - The input array of records
 * @returns Filtered array containing only objects with non-duplicate `ecifId`s
 */
removeDuplicateEcifIdRecords<T extends Record<string, any>>(list: T[]): T[] {
    if (!Array.isArray(list) || !list.length) {
      return [];
    }
  
    // Step 1: Count frequency of each ecifId
    const ecifIdCounts = new Map<string | number, number>();
  
    list.forEach(item => {
      const id = item?.ecifId;
      if (id !== undefined && id !== null && id !== '') {
        ecifIdCounts.set(id, (ecifIdCounts.get(id) || 0) + 1);
      }
    });
  
    // Step 2: Filter out any item whose ecifId appears more than once
    return list.filter(item => {
      if (!item) return false;
  
      const id = item.ecifId;
  
      // If item has an ecifId, keep it ONLY if it appears exactly once
      if (id !== undefined && id !== null && id !== '') {
        return ecifIdCounts.get(id) === 1;
      }
  
      // Keep items without an ecifId
      return true;
    });
  }