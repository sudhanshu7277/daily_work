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
  console.log('dateStr : ', dateStr);
  if (!dateStr) return '-';

  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`);
  if (isNaN(d.getTime())) return dateStr;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getUTCDate()).padStart(2, '0');

  return `${dd} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

