// 1. sourceOptions memo:

const sourceOptions = useMemo(() => {
  const seen = new Set<string>();
  return Object.keys(sourceCounts)
    .map(s => ({
      value: s,
      label: s.toLowerCase() === 'email_poller' ? 'Email' : s,
    }))
    .filter(o => {
      if (seen.has(o.label)) return false;
      seen.add(o.label);
      return true;
    });
}, [sourceCounts]);