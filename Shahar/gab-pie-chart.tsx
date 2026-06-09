//Here are all the final changes:
//1. Replace SOURCE_COLOR_MAP and PIE_COLORS usage — add this function near the top:

const PALETTE = [
    '#337ab7', '#5cb85c', '#f0ad4e', '#9b59b6',
    '#d9534f', '#e8a317', '#95a5a6', '#2ecc71',
    '#5bc0de', '#c9302c', '#82c785', '#f39c12',
    '#27ae60', '#e74c3c', '#3498db', '#8e44ad',
  ];
  
  function getStableColor(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
  }

  // 2. Update mapToSlices to use getStableColor:

  function mapToSlices(data: Record<string, number>): PieSlice[] {
    return Object.entries(data).map(([label, value]) => ({
      label,
      value,
      color: getStableColor(label),
    }));
  }

  //3. sourceOptions memo:

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

  // 4. sourceSlices memo:

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
          color: STATUS_COLORS[status] || getStableColor(status),
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
        color: STATUS_COLORS[sourceStatusFilter] || getStableColor(sourceStatusFilter),
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

  //5. countrySlices memo:

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
          color: STATUS_COLORS[status] || getStableColor(status),
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
        color: STATUS_COLORS[countryStatusFilter] || getStableColor(countryStatusFilter),
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

  // 6. Two useEffect hooks:

  useEffect(() => {
    setSourceStatusFilter('');
  }, [sourceFilter]);
  
  useEffect(() => {
    setCountryStatusFilter('');
  }, [countryFilter]);

  // 7. JSX changes — source card status dropdown only:

  <Dropdown
  value={sourceStatusFilter}
  onChange={(v) => setSourceStatusFilter(String(v))}
  placeholder="Select a Status"
  style={{ width: 120 }}
  size="sm"
  disabled={!sourceFilter}
>
  <Dropdown.Item value="">Select a Status</Dropdown.Item>
  {Object.keys(counts)
    .filter(s => (counts as Record<string, number>)[s] > 0)
    .map(s => (
      <Dropdown.Item key={s} value={s}>
        {s.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())}
      </Dropdown.Item>
    ))}
</Dropdown>

// 8. JSX changes — country card status dropdown only:

<Dropdown
  value={countryStatusFilter}
  onChange={(v) => setCountryStatusFilter(String(v))}
  placeholder="Select a Status"
  style={{ width: 120 }}
  size="sm"
  disabled={!countryFilter}
>
  <Dropdown.Item value="">Select a Status</Dropdown.Item>
  {Object.keys(counts)
    .filter(s => (counts as Record<string, number>)[s] > 0)
    .map(s => (
      <Dropdown.Item key={s} value={s}>
        {s.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase())}
      </Dropdown.Item>
    ))}
</Dropdown>