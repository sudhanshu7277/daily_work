// 1. New state (near your other useState declarations)

const [sourceStatusBreakdown, setSourceStatusBreakdown] = useState<Record<string, number>>({});
const [countryStatusBreakdown, setCountryStatusBreakdown] = useState<Record<string, number>>({});

// 2. New effect — Source

useEffect(() => {
  if (!sourceFilter) {
    setSourceStatusBreakdown({});
    return;
  }
  const params = {
    instructionSource: sourceDisplayToCode[sourceFilter] || sourceFilter,
    region: regionFilter || undefined,
    size: 1000,
  };
  getInstructions(params as Parameters<typeof getInstructions>[0])
    .then(res => {
      const items = res.data?.content ?? [];
      const tally: Record<string, number> = {};
      items.forEach(item => {
        if (item.status) tally[item.status] = (tally[item.status] ?? 0) + 1;
      });
      setSourceStatusBreakdown(tally);
    })
    .catch(() => setSourceStatusBreakdown({}));
}, [sourceFilter, regionFilter]);

// 3. New effect — Country (mirror)

useEffect(() => {
  if (!countryFilter) {
    setCountryStatusBreakdown({});
    return;
  }
  const params = {
    country: countryFilter,
    region: regionFilter || undefined,
    size: 1000,
  };
  getInstructions(params as Parameters<typeof getInstructions>[0])
    .then(res => {
      const items = res.data?.content ?? [];
      const tally: Record<string, number> = {};
      items.forEach(item => {
        if (item.status) tally[item.status] = (tally[item.status] ?? 0) + 1;
      });
      setCountryStatusBreakdown(tally);
    })
    .catch(() => setCountryStatusBreakdown({}));
}, [countryFilter, regionFilter]);

// 4. sourceSlices — replace the breakdown branch
// Find (lines ~749–762):


if (sourceFilter && !sourceStatusFilter) {
  const sourceTotal = sourceCounts[sourceFilter] ?? 0;
  const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([status, globalCount]) => ({
      key: status,
      label: status.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase()),
      value: Math.round(globalCount * ratio),
      color: STATUS_COLORS[status] || getStableColor(status),
    }))
    .filter(s => s.value > 0);
}

// Replace with:

if (sourceFilter && !sourceStatusFilter) {
  return Object.entries(sourceStatusBreakdown)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({
      key: status,
      label: status.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase()),
      value: count,
      color: STATUS_COLORS[status] || getStableColor(status),
    }));
}

// And add sourceStatusBreakdown to the dependency array at the bottom of this useMemo.
//5. countrySlices — replace the breakdown branch (mirror)
// Find (lines ~696–709):

if (countryFilter && !countryStatusFilter) {
  const countryTotal = countryCounts[countryFilter] ?? 0;
  const ratio = grandTotal > 0 ? countryTotal / grandTotal : 0;
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([status, globalCount]) => ({
      key: status,
      label: status.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase()),
      value: Math.round(globalCount * ratio),
      color: STATUS_COLORS[status] || getStableColor(status),
    }))
    .filter(s => s.value > 0);
}

// Replace with:


if (countryFilter && !countryStatusFilter) {
  return Object.entries(countryStatusBreakdown)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({
      key: status,
      label: status.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase()),
      value: count,
      color: STATUS_COLORS[status] || getStableColor(status),
    }));
}
