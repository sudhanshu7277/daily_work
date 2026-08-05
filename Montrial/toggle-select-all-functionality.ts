export const formatAccountNumbersInText = (text: string): string => {
  if (!text) return '';
  // Replaces groups of 5 or more digits by inserting a hyphen after the first 4 digits
  return text.replace(/\b(\d{4})(\d+)\b/g, '$1-$2');
};

// Example usage:
// formatAccountNumbersInText('10393999810; Chequing Accounts 10393999802') 
// => '1039-3999810; Chequing Accounts 1039-3999802'