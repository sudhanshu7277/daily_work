const normalizeStatusCode = (value?: string): string => {
  if (!value) return '';
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
};

const statusCodeToLabel = (code?: string): string => {
  const normalized = normalizeStatusCode(code);
  if (!normalized) return '';

  return normalized
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};


// date day display fix

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';

  // Strip away any time component if present
  const rawDate = dateStr.split('T')[0].split(' ')[0];
  const parts = rawDate.split('-');

  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;

  if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return dateStr;

  return `${months[monthIdx]} ${parseInt(day, 10)}, ${year}`;
}