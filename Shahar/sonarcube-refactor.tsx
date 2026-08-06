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
const formatDDMONYYYY = (dateStr: string): string => {
  if (!dateStr) return '-';
  const datePart = dateStr.split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const adjusted = new Date(Date.UTC(y, m - 1, d + 1)); // safely rolls over month/year
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dd = String(adjusted.getUTCDate()).padStart(2, '0');
  return `${dd} ${months[adjusted.getUTCMonth()]} ${adjusted.getUTCFullYear()}`;
};
