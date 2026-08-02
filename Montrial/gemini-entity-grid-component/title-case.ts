/**
 * Converts any string into Title Case (e.g., "KIPTON DURAN" or "kipton duran" -> "Kipton Duran").
 * Capitalizes the first letter of each word and lowers all remaining characters.
 */
export function toTitleCase(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // DELETE ICON

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Top Handle -->
  <path d="M9.5 4H14.5C15.0523 4 15.5 4.44772 15.5 5V6H8.5V5C8.5 4.44772 8.94772 4 9.5 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <!-- Horizontal Rim/Lid -->
  <path d="M4 6H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Tapered Body with Rounded Bottom -->
  <path d="M6 6L6.85 18.325C6.93333 19.5333 7.93333 20.5 9.15 20.5H14.85C16.0667 20.5 17.0667 19.5333 17.15 18.325L18 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- 2 Inner Vertical Ribs -->
  <path d="M10 10V16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M14 10V16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>

.trash-icon {
    color: #0079C1; // Set default BMO Blue
    cursor: pointer;
    transition: color 0.15s ease;
  
    &:hover {
      color: #004C7A; // Darker Blue on hover
    }
  }



  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
  
    // 1. Get currently active optional column IDs
    const optionalIds = this.filterOptions
      .map(opt => opt.id)
      .filter(id => !this.mandatoryColumnIds.includes(id));
  
    // 2. Check if all optional columns are currently selected
    const isAllSelected = optionalIds.every(id => this.selectedFilterIds.includes(id));
  
    if (isAllSelected) {
      // 🔴 DESELECT ALL: Reset to mandatory columns only
      this.selectedFilterIds = [...this.mandatoryColumnIds];
    } else {
      // 🔵 SELECT ALL: Include mandatory + all optional columns
      this.selectedFilterIds = this.filterOptions.map(opt => opt.id);
    }
  
    // 3. Trigger column sync and change detection
    this.onFilterChange();
  }