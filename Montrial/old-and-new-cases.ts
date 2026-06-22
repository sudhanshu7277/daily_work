/**
   * Compares the case creation date against June 22, 2026 (Ignoring time zones/hours).
   * Returns true if created BEFORE today, and false if created ON or AFTER today.
   * * @param createdAtString The ISO timestamp string from currentCase (e.g., '2023-09-13T08:43:07.900328Z')
   */
isCaseBeforeToday(createdAtString: string | null | undefined): boolean {
    if (!createdAtString) return false;

    // 1. Parse the incoming case timestamp
    const caseDate = new Date(createdAtString);
    
    // 2. Set target comparison date strictly to June 22, 2026
    const todayDate = new Date(2026, 5, 22); // Note: Month index 5 is June in JavaScript

    // 3. Clear the time values to compare calendar dates only
    caseDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    // 4. Return true only if the case date happened before our target date
    return caseDate.getTime() < todayDate.getTime();
  }

  // Example usage:

  const isOlderCase = this.isCaseBeforeToday(currentCase.createdAt);
console.log(isOlderCase); // Will return true for '2023-09-13'