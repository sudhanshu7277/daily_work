// Replace countrySlices memo:

const countrySlices: PieSlice[] = useMemo(() => {
  const grandTotal = Object.values(countryCounts)
    .reduce((s, v) => s + v, 0);

  // Case 1: Country + All Statuses → status breakdown
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

  // Case 3: No filters → all countries
  // Use mapToSlices exactly like source does
  // so colors are stable and consistent
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

// And update mapToSlices to handle countries too — right now SOURCE_COLOR_MAP only has source keys so countries will fall back to PIE_COLORS[idx] which is fine and consistent:

function mapToSlices(data: Record<string, number>): PieSlice[] {
  return Object.entries(data).map(([label, value], idx) => ({
    label,
    value,
    color: SOURCE_COLOR_MAP[label] ?? PIE_COLORS[idx % PIE_COLORS.length],
  }));
}