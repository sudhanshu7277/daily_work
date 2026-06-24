// Claude responded: Apply only this replacement for lines 765–778 in sourceSlices useMemo in DashboardPage.Apply only this replacement for lines 765–778 in sourceSlices useMemo in DashboardPage.tsx:

if (sourceFilter && !sourceStatusFilter) {
  const sourceTotal = sourceCounts[sourceFilter] ?? 0;
  const grandTotal = Object.values(sourceCounts).reduce((s, v) => s + v, 0);
  const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;

  const raw = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([status, globalCount]) => {
      const exact = globalCount * ratio;
      return {
        key: status,
        label: status.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase()),
        color: STATUS_COLORS[status] || getStableColor(status),
        floor: Math.floor(exact),
        frac: exact % 1,
      };
    })
    .filter(s => s.floor > 0 || s.frac > 0);

  const floorSum = raw.reduce((s, sl) => s + sl.floor, 0);
  const missing = sourceTotal - floorSum;
  raw.sort((a, b) => b.frac - a.frac);
  raw.forEach((sl, i) => { sl.floor += i < missing ? 1 : 0; });

  return raw
    .filter(s => s.floor > 0)
    .map(sl => ({
      key: sl.key,
      label: sl.label,
      value: sl.floor,
      color: sl.color,
    }));
}