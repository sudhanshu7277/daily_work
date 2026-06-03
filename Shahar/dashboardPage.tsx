// Replace sourceSlices memo (lines 540-549):

const sourceSlices: PieSlice[] = useMemo(() => {
  const grandTotal = Object.values(sourceCounts).reduce((s, v) => s + v, 0);

  // Case 1: Source + All Statuses → status breakdown for that source
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

  // Case 2: Source + specific Status → single status slice
  if (sourceFilter && sourceStatusFilter) {
    const sourceTotal = sourceCounts[sourceFilter] ?? 0;
    const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;
    const statusCount = counts[sourceStatusFilter] ?? 0;
    const displayLabel = sourceStatusFilter.replace(/_/g, ' ')
      .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const displaySource = sourceFilter.toLowerCase() === 'email_poller'
      ? 'Email' : sourceFilter;

    return [{
      label: `${displayLabel} — ${displaySource}`,
      value: Math.round(statusCount * ratio) || 1,
      color: STATUS_COLORS[sourceStatusFilter] || '#999',
    }];
  }

  // Case 3: No filters → all sources, merge duplicate labels
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

//For the Country pie, same pattern — replace countrySlices memo (lines 551-570):

const countrySlices: PieSlice[] = useMemo(() => {
  // Build stable color map from ALL country keys
  const countryColorMap: Record<string, string> = {};
  Object.keys(countryCounts).forEach((key, idx) => {
    countryColorMap[key] = PIE_COLORS[idx % PIE_COLORS.length];
  });

  const grandTotal = Object.values(countryCounts).reduce((s, v) => s + v, 0);

  // Case 1: Country + All Statuses → status breakdown for that country
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

  // Case 2: Country + specific Status → single status slice
  if (countryFilter && countryStatusFilter) {
    const countryTotal = countryCounts[countryFilter] ?? 0;
    const ratio = grandTotal > 0 ? countryTotal / grandTotal : 0;
    const statusCount = counts[countryStatusFilter] ?? 0;
    const displayLabel = countryStatusFilter.replace(/_/g, ' ')
      .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    return [{
      label: `${displayLabel} — ${countryFilter}`,
      value: Math.round(statusCount * ratio) || 1,
      color: STATUS_COLORS[countryStatusFilter] || '#999',
    }];
  }

  // Case 3: No filters → all countries
  return Object.entries(countryCounts).map(([label, value]) => ({
    label,
    value,
    color: countryColorMap[label],
  }));

}, [countryCounts, countryFilter, countryStatusFilter, counts]);
// In the JSX around line 905-907, replace the <span> in the card header:

<El className="dashboard-card-header-content">
  <span>
    {sourceFilter && !sourceStatusFilter
      ? 'Status Breakdown'
      : sourceFilter && sourceStatusFilter
      ? `${sourceFilter.toLowerCase() === 'email_poller' 
          ? 'Email' : sourceFilter} — ${sourceStatusFilter
          .replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())}`
      : 'Instruction(s) by Source'}
  </span>
  {sourceFilter && !sourceStatusFilter && (
    <El style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
      for source: <strong>
        {sourceFilter.toLowerCase() === 'email_poller'
          ? 'Email' : sourceFilter}
      </strong>
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
  <El className="dashboard-chart-filters">
    <El className="lmn-d-flex lmn-flex-column">
      <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
        Instruction(s) by Source
      </El>
      <Dropdown
        value={sourceFilter}
        onChange={(v) => setSourceFilter(String(v))}
        placeholder="--Select Source--"
        style={{ width: 120 }}
        size="sm"
      >
        <Dropdown.Item value="">--Select Source--</Dropdown.Item>
        {sourceOptions.map(o => (
          <Dropdown.Item key={o.value} value={o.value}>
            {o.label}
          </Dropdown.Item>
        ))}
      </Dropdown>
    </El>
    <El className="lmn-d-flex lmn-flex-column">
      <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
        Instruction(s) by Status
      </El>
      <Dropdown
        value={sourceStatusFilter}
        onChange={(v) => setSourceStatusFilter(String(v))}
        placeholder="All Statuses"
        style={{ width: 120 }}
        size="sm"
      >
        <Dropdown.Item value="">All Statuses</Dropdown.Item>
        {Object.keys(counts).map(s => (
          <Dropdown.Item key={s} value={s}>
            {s.replace(/_/g, ' ').toLowerCase()
              .replace(/\b\w/g, c => c.toUpperCase())}
          </Dropdown.Item>
        ))}
      </Dropdown>
    </El>
  </El>
</El>

//And for country, find lines ~949-951:

<El className="dashboard-card-header-content">
  <span>
    {countryFilter && !countryStatusFilter
      ? 'Status Breakdown'
      : countryFilter && countryStatusFilter
      ? `${countryFilter} — ${countryStatusFilter
          .replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())}`
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
  <El className="dashboard-chart-filters">
    <El className="lmn-d-flex lmn-flex-column">
      <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
        Instruction(s) by Country
      </El>
      <Dropdown
        value={countryFilter}
        onChange={(v) => setCountryFilter(String(v))}
        placeholder="--Select Country--"
        style={{ width: 120 }}
        size="sm"
      >
        <Dropdown.Item value="">--Select Country--</Dropdown.Item>
        {countryOptions.map(o => (
          <Dropdown.Item key={o.value} value={o.value}>
            {o.label}
          </Dropdown.Item>
        ))}
      </Dropdown>
    </El>
    <El className="lmn-d-flex lmn-flex-column">
      <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
        Filter by Status
      </El>
      <Dropdown
        value={countryStatusFilter}
        onChange={(v) => setCountryStatusFilter(String(v))}
        placeholder="All Statuses"
        style={{ width: 120 }}
        size="sm"
      >
        <Dropdown.Item value="">All Statuses</Dropdown.Item>
        {Object.keys(counts).map(s => (
          <Dropdown.Item key={s} value={s}>
            {s.replace(/_/g, ' ').toLowerCase()
              .replace(/\b\w/g, c => c.toUpperCase())}
          </Dropdown.Item>
        ))}
      </Dropdown>
    </El>
  </El>
</El>