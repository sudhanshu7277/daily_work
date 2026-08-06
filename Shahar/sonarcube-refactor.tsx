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

  const cleanDate = dateStr.split('T')[0];
  const [yearStr, monthStr, dayStr] = cleanDate.split('-');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(monthStr, 10) - 1;

  if (!yearStr || isNaN(monthIndex) || !months[monthIndex] || !dayStr) return dateStr;

  return `${dayStr} ${months[monthIndex]} ${yearStr}`;
};

