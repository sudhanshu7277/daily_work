// replace below block 

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


// with 

if (sourceFilter && sourceStatusFilter) {
  const sourceTotal = sourceCounts[sourceFilter] ?? 0;
  const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;
  const statusCount = counts[sourceStatusFilter] ?? 0;
  const estimatedCount = Math.round(statusCount * ratio);

  // Prefer the real fetched count when the grid has already loaded data
  // for this exact source + status combination
  const isDrillDownCurrent =
    sourceDrillDown &&
    sourceDrillDown.data.every(
      (item: any) => item.status === sourceStatusFilter
    );
  const finalCount = isDrillDownCurrent
    ? sourceDrillDown!.data.length
    : estimatedCount;

  const displayLabel = sourceStatusFilter.replace(/_/g, ' ')
    .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const displaySource = sourceFilter.toLowerCase() === 'email_poller'
    ? 'Email' : sourceFilter;
  if (finalCount === 0) return [];
  return [{
    key: sourceStatusFilter,
    label: `${displayLabel} — ${displaySource}`,
    value: finalCount,
    color: STATUS_COLORS[sourceStatusFilter] || getStableColor(sourceStatusFilter),
  }];
}