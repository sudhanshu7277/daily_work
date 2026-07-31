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