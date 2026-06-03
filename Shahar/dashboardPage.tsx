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

// 2. sourceSlices memo:

const sourceSlices: PieSlice[] = useMemo(() => {
  const grandTotal = Object.values(sourceCounts)
    .reduce((s, v) => s + v, 0);

  if (sourceFilter && !sourceStatusFilter) {
    const sourceTotal = sourceCounts[sourceFilter] ?? 0;
    const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, globalCount]) => ({
        label: status.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase()),
        value: Math.round(globalCount * ratio),
        color: STATUS_COLORS[status] || '#999',
      }))
      .filter(s => s.value > 0);
  }

  if (sourceFilter && sourceStatusFilter) {
    const sourceTotal = sourceCounts[sourceFilter] ?? 0;
    const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;
    const statusCount = counts[sourceStatusFilter] ?? 0;
    const estimatedCount = Math.round(statusCount * ratio);
    const displayLabel = sourceStatusFilter.replace(/_/g, ' ')
      .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const displaySource = sourceFilter.toLowerCase() === 'email_poller'
      ? 'Email' : sourceFilter;
    if (estimatedCount === 0) return [];
    return [{
      label: `${displayLabel} — ${displaySource}`,
      value: estimatedCount,
      color: STATUS_COLORS[sourceStatusFilter] || '#999',
    }];
  }

  const merged: Record<string, PieSlice> = {};
  mapToSlices(sourceCounts).forEach(s => {
    const label = s.label.toLowerCase() === 'email_poller'
      ? 'Email' : s.label;
    if (merged[label]) {
      merged[label] = {
        ...merged[label],
        value: merged[label].value + s.value,
      };
    } else {
      merged[label] = { ...s, label };
    }
  });
  return Object.values(merged);

}, [sourceCounts, sourceFilter, sourceStatusFilter, counts]);

//3. countrySlices memo:

const countrySlices: PieSlice[] = useMemo(() => {
  const grandTotal = Object.values(countryCounts)
    .reduce((s, v) => s + v, 0);

  if (countryFilter && !countryStatusFilter) {
    const countryTotal = countryCounts[countryFilter] ?? 0;
    const ratio = grandTotal > 0 ? countryTotal / grandTotal : 0;
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, globalCount]) => ({
        label: status.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase()),
        value: Math.round(globalCount * ratio),
        color: STATUS_COLORS[status] || '#999',
      }))
      .filter(s => s.value > 0);
  }

  if (countryFilter && countryStatusFilter) {
    const countryTotal = countryCounts[countryFilter] ?? 0;
    const ratio = grandTotal > 0 ? countryTotal / grandTotal : 0;
    const statusCount = counts[countryStatusFilter] ?? 0;
    const estimatedCount = Math.round(statusCount * ratio);
    const displayLabel = countryStatusFilter.replace(/_/g, ' ')
      .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    if (estimatedCount === 0) return [];
    return [{
      label: `${displayLabel} — ${countryFilter}`,
      value: estimatedCount,
      color: STATUS_COLORS[countryStatusFilter] || '#999',
    }];
  }

  const merged: Record<string, PieSlice> = {};
  mapToSlices(countryCounts).forEach(s => {
    if (merged[s.label]) {
      merged[s.label] = {
        ...merged[s.label],
        value: merged[s.label].value + s.value,
      };
    } else {
      merged[s.label] = { ...s };
    }
  });
  return Object.values(merged);

}, [countryCounts, countryFilter, countryStatusFilter, counts]);


// 4. Two useEffect hooks — add after existing country useEffect (~line 392):

useEffect(() => {
  setSourceStatusFilter('');
}, [sourceFilter]);

useEffect(() => {
  setCountryStatusFilter('');
}, [countryFilter]);

