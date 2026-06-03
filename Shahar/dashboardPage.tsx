// The existing flow:

//countryCounts is already filtered by countryStatusFilter via the API
//countryFilter just filters which single country to show from those counts

//So the correct logic is much simpler:

const countrySlices: PieSlice[] = useMemo(() => {
  // Build stable color map from ALL country keys
  const countryColorMap: Record<string, string> = {};
  Object.keys(countryCounts).forEach((key, idx) => {
    countryColorMap[key] = PIE_COLORS[idx % PIE_COLORS.length];
  });

  // If a specific country is selected, show status breakdown
  if (countryFilter && !countryStatusFilter) {
    const countryTotal = countryCounts[countryFilter] ?? 0;
    const grandTotal = Object.values(countryCounts)
      .reduce((s, v) => s + v, 0);
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

  // Country + specific status → single slice
  if (countryFilter && countryStatusFilter) {
    const countryTotal = countryCounts[countryFilter] ?? 0;
    const grandTotal = Object.values(countryCounts)
      .reduce((s, v) => s + v, 0);
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

  // No country filter → show all countries from API response
  // countryCounts is already filtered by countryStatusFilter via API
  return Object.entries(countryCounts).map(([label, value]) => ({
    label,
    value,
    color: countryColorMap[label],
  }));

}, [countryCounts, countryFilter, countryStatusFilter, counts]);

//The country card header:

<El className="dashboard-card-header-content">
  <span>
    {countryFilter && !countryStatusFilter
      ? 'Status Breakdown'
      : countryFilter && countryStatusFilter
      ? `${countryFilter} — ${countryStatusFilter
          .replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())}`
      : countryStatusFilter
      ? `Instruction(s) by Country`
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
        {Object.keys(counts)
          .filter(s => (counts as Record<string, number>)[s] > 0)
          .map(s => (
            <Dropdown.Item key={s} value={s}>
              {s.replace(/_/g, ' ').toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase())}
            </Dropdown.Item>
          ))}
      </Dropdown>
    </El>
  </El>
</El>

//And the reset useEffect for country:

useEffect(() => {
  setCountryStatusFilter('');
}, [countryFilter]);

