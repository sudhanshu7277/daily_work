// Replace sourceSlices memo (lines 540-549):

const sourceSlices: PieSlice[] = useMemo(() => {
  // When a source is selected but no status filter:
  // show status breakdown using STATUS_COLORS
  if (sourceFilter && !sourceStatusFilter) {
    const sourceTotal = sourceCounts[sourceFilter] ?? 0;
    const grandTotal = Object.values(sourceCounts).reduce((s, v) => s + v, 0);
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

  // All other cases: source breakdown (with optional filters)
  let data = sourceCounts;
  if (sourceFilter) {
    data = Object.fromEntries(
      Object.entries(data).filter(([k]) => k === sourceFilter)
    );
  }

  // Merge duplicate display labels (fixes Email(24)+Email(27))
  const merged: Record<string, PieSlice> = {};
  mapToSlices(data).forEach(s => {
    const label = s.label.toLowerCase() === 'email_poller'
      ? 'Email' : s.label;
    if (merged[label]) {
      merged[label] = { ...merged[label], value: merged[label].value + s.value };
    } else {
      merged[label] = { ...s, label };
    }
  });

  return Object.values(merged);
}, [sourceCounts, sourceFilter, sourceStatusFilter, counts]);

//For the Country pie, same pattern — replace countrySlices memo (lines 551-570):

const countrySlices: PieSlice[] = useMemo(() => {
  // Build stable color map from ALL country keys
  const allCountryKeys = Object.keys(countryCounts);
  const countryColorMap: Record<string, string> = {};
  allCountryKeys.forEach((key, idx) => {
    countryColorMap[key] = PIE_COLORS[idx % PIE_COLORS.length];
  });

  // When a country is selected but no status filter:
  // show status breakdown for that country
  if (countryFilter && !countryStatusFilter) {
    const countryTotal = countryCounts[countryFilter] ?? 0;
    const grandTotal = Object.values(countryCounts).reduce((s, v) => s + v, 0);
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

  let data = countryCounts;
  if (countryFilter) {
    data = Object.fromEntries(
      Object.entries(data).filter(([k]) => k === countryFilter)
    );
  }

  return Object.entries(data).map(([label, value]) => ({
    label,
    value,
    color: countryColorMap[label],
  }));
}, [countryCounts, countryFilter, countryStatusFilter, counts]);

// In the JSX around line 905-907, replace the <span> in the card header:

<El className="dashboard-card-header-content">
  <span>
    {sourceFilter && !sourceStatusFilter
      ? `Status Breakdown`
      : sourceFilter && sourceStatusFilter
      ? `${sourceFilter === 'EMAIL_POLLER' ? 'Email' : sourceFilter} — ${sourceStatusFilter.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}`
      : 'Instruction(s) by Source'}
  </span>
  {sourceFilter && !sourceStatusFilter && (
    <El style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
      for source: <strong>{
        sourceFilter.toLowerCase() === 'email_poller'
          ? 'Email' : sourceFilter
      }</strong>
    </El>
  )}
  {!sourceFilter && sourceStatusFilter && (
    <El style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
      filtered by: <strong>
        {sourceStatusFilter.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())}
      </strong>
    </El>
  )}

//And for country, find lines ~949-951:


<El className="dashboard-card-header-content">
  <span>
    Instruction(s) by Country</span>

    //replace above with below


    <El className="dashboard-card-header-content">
  <span>
    {countryFilter && !countryStatusFilter
      ? `Status Breakdown`
      : countryFilter && countryStatusFilter
      ? `${countryFilter} — ${countryStatusFilter.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}`
      : 'Instruction(s) by Country'}
  </span>
  {countryFilter && !countryStatusFilter && (
    <El style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
      for country: <strong>{countryFilter}</strong>
    </El>
  )}
  {!countryFilter && countryStatusFilter && (
    <El style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
      filtered by: <strong>
        {countryStatusFilter.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())}
      </strong>
    </El>
  )}