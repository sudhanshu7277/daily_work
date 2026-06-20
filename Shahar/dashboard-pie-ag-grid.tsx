// Fix — Source: replace the getCountsBySource effect (lines ~487–502)
///Replace:

useEffect(() => {
  const filters = {
    fromDate: toLocalDateString(fromDate),
    toDate: toLocalDateString(toDate),
    region: regionFilter || undefined,
  };
  if (!sourceFilter && sourceStatusFilter) {
    getCountsBySource(sourceStatusFilter, filters)
      .then(res => setSourceCounts(res.data ?? {}))
      .catch(() => {/* keep existing */});
  } else if (!sourceStatusFilter) {
    getCountsBySource(undefined, filters)
      .then(res => setSourceCounts(res.data ?? {}))
      .catch(() => {/* keep existing */});
  }
}, [sourceStatusFilter, sourceFilter, fromDate, toDate, regionFilter]);


// With:

useEffect(() => {
  const filters = {
    fromDate: toLocalDateString(fromDate),
    toDate: toLocalDateString(toDate),
    region: regionFilter || undefined,
  };
  getCountsBySource(sourceStatusFilter || undefined, filters)
    .then(res => setSourceCounts(res.data ?? {}))
    .catch(() => {/* keep existing */});
}, [sourceStatusFilter, fromDate, toDate, regionFilter]);


// Fix — Source: replace the single-slice branch in sourceSlices (lines 777–792)
//Replace:

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
    key: sourceStatusFilter,
    label: `${displayLabel} — ${displaySource}`,
    value: estimatedCount,
    color: STATUS_COLORS[sourceStatusFilter] || getStableColor(sourceStatusFilter),
  }];
}


// With:

if (sourceFilter && sourceStatusFilter) {
  // sourceCounts is already scoped to sourceStatusFilter by the effect above —
  // this is the real, exact count, not an estimate
  const realCount = sourceCounts[sourceFilter] ?? 0;
  const displayLabel = sourceStatusFilter.replace(/_/g, ' ')
    .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const displaySource = sourceFilter.toLowerCase() === 'email_poller'
    ? 'Email' : sourceFilter;
  if (realCount === 0) return [];
  return [{
    key: sourceStatusFilter,
    label: `${displayLabel} — ${displaySource}`,
    value: realCount,
    color: STATUS_COLORS[sourceStatusFilter] || getStableColor(sourceStatusFilter),
  }];
}

// Fix — Country: replace the getCountsByCountry effect (lines ~504–519)
//Replace:

useEffect(() => {
  const filters = {
    fromDate: toLocalDateString(fromDate),
    toDate: toLocalDateString(toDate),
    region: regionFilter || undefined,
  };
  if (!countryFilter && countryStatusFilter) {
    getCountsByCountry(countryStatusFilter, filters)
      .then(res => setCountryCounts(res.data ?? {}))
      .catch(() => {/* keep existing */});
  } else if (!countryStatusFilter) {
    getCountsByCountry(undefined, filters)
      .then(res => setCountryCounts(res.data ?? {}))
      .catch(() => {/* keep existing */});
  }
}, [countryStatusFilter, countryFilter, fromDate, toDate, regionFilter]);


// With:

useEffect(() => {
  const filters = {
    fromDate: toLocalDateString(fromDate),
    toDate: toLocalDateString(toDate),
    region: regionFilter || undefined,
  };
  getCountsByCountry(countryStatusFilter || undefined, filters)
    .then(res => setCountryCounts(res.data ?? {}))
    .catch(() => {/* keep existing */});
}, [countryStatusFilter, fromDate, toDate, regionFilter]);

// Fix — Country: replace the single-slice branch in countrySlices (lines 726–740)
//Replace:

if (countryFilter && countryStatusFilter) {
  const countryTotal = countryCounts[countryFilter] ?? 0;
  const ratio = grandTotal > 0 ? countryTotal / grandTotal : 0;
  const statusCount = counts[countryStatusFilter] ?? 0;
  const estimatedCount = Math.round(statusCount * ratio);
  const displayLabel = countryStatusFilter.replace(/_/g, ' ')
    .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const displayCountry = codeToName[countryFilter] ?? countryFilter;
  if (estimatedCount === 0) return [];
  return [{
    label: `${displayLabel} — ${displayCountry}`,
    value: estimatedCount,
    color: STATUS_COLORS[countryStatusFilter] || getStableColor(countryStatusFilter),
  }];
}

// With:

if (countryFilter && countryStatusFilter) {
  const realCount = countryCounts[countryFilter] ?? 0;
  const displayLabel = countryStatusFilter.replace(/_/g, ' ')
    .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const displayCountry = codeToName[countryFilter] ?? countryFilter;
  if (realCount === 0) return [];
  return [{
    key: countryStatusFilter,
    label: `${displayLabel} — ${displayCountry}`,
    value: realCount,
    color: STATUS_COLORS[countryStatusFilter] || getStableColor(countryStatusFilter),
  }];
}



