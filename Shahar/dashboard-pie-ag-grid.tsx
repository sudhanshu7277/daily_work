// Step 1 — Add new function to instructions.ts after line 98:

export function getCountsBySourceStatus(
  instructionSource: string,
  filters?: DashboardFilters
) {
  return get<Record<string, number>>(
    '/instructions/dashboard/counts',
    buildDashboardParams(filters, { instructionSource }),
  );
}

// Note: buildDashboardParams second arg is spread as extra into params (line 79) — so passing { instructionSource } will include it in the request. Zero changes to buildDashboardParams needed.

// Step 2 — In DashboardPage.tsx, add new state near the other state declarations:

const [sourceStatusCounts, setSourceStatusCounts] = useState<Record<string, number>>({});


  // Step 3 — Add a useEffect that fetches real per-source status counts when sourceFilter changes:


  // useEffect(() => {
  //   if (!sourceFilter) {
  //     setSourceStatusCounts({});
  //     return;
  //   }
  //   const sourceCode = sourceDisplayToCode[sourceFilter] || sourceFilter;
  //   getCountsBySourceStatus(sourceCode, { fromDate, toDate, region: regionFilter || undefined })
  //     .then(res => setSourceStatusCounts(res.data ?? {}))
  //     .catch(() => setSourceStatusCounts({}));
  // }, [sourceFilter, fromDate, toDate, regionFilter]);

  useEffect(() => {
    if (!sourceFilter) {
      setSourceStatusCounts({});
      return;
    }
    const sourceCode = sourceDisplayToCode[sourceFilter] || sourceFilter;
    getCountsBySourceStatus(sourceCode, {
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      region: regionFilter || undefined,
    })
      .then(res => setSourceStatusCounts(res.data ?? {}))
      .catch(() => setSourceStatusCounts({}));
  }, [sourceFilter, fromDate, toDate, regionFilter]);

  // Step 4 — Replace the sourceFilter && !sourceStatusFilter branch in sourceSlices useMemo (lines 765–778):

  if (sourceFilter && !sourceStatusFilter) {
    return Object.entries(sourceStatusCounts)
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({
        key: status,
        label: status.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase()),
        value: count,
        color: STATUS_COLORS[status] || getStableColor(status),
      }));
  }

  // Also update the useMemo dependency array at line 814 — add sourceStatusCounts:

}, [sourceCounts, sourceFilter, sourceStatusFilter, counts, sourceOptions, sourceStatusCounts]);