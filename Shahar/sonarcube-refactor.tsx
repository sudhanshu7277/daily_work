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

  // Clean string in case timestamp is attached (e.g., "2026-07-07T00:00:00")
  const rawDate = dateStr.split('T')[0].split(' ')[0];
  const parts = rawDate.split('-');

  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;

  if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return dateStr;

  // Matches "Jul 7, 2026" format shown in the UI
  return `${months[monthIdx]} ${parseInt(day, 10)}, ${year}`;
};



// Also update formatMMDDYYYY (lines 162–169) if used:

const formatMMDDYYYY = (dateStr?: string): string => {
  if (!dateStr) return '-';

  // Clean string in case timestamp or space is attached
  const cleanDate = dateStr.split('T')[0].split(' ')[0];
  const parts = cleanDate.split('-');

  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
};