// // File 1: src/api/instructions.ts
// // Add this function after line 98 (after getCountsBySource):


// export function getCountsBySourceStatus(
//   instructionSource: string,
//   filters?: DashboardFilters
// ) {
//   return get<Record<string, number>>(
//     '/instructions/dashboard/counts',
//     buildDashboardParams(filters, { instructionSource }),
//   );
// }


// // File 2: DashboardPage.tsx
// // Change 1 — Add state near other state declarations:

// const [sourceStatusCounts, setSourceStatusCounts] = useState<Record<string, number>>({});

// //  Change 2 — Add this useEffect near the other source-related useEffects:


// useEffect(() => {
//   if (!sourceFilter) {
//     setSourceStatusCounts({});
//     return;
//   }
//   const sourceCode = sourceDisplayToCode[sourceFilter] || sourceFilter;
//   getCountsBySourceStatus(sourceCode, filters)
//     .then(res => setSourceStatusCounts(res.data ?? {}))
//     .catch(() => setSourceStatusCounts({}));
// }, [sourceFilter, filters, sourceDisplayToCode]);


// // Change 3 — Replace lines 765–778 in sourceSlices useMemo:

// if (sourceFilter && !sourceStatusFilter) {
//   const sourceTotal = sourceCounts[sourceFilter] ?? 0;
//   const grandTotal = Object.values(sourceCounts).reduce((s, v) => s + v, 0);
//   const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;

//   const raw = Object.entries(counts)
//     .filter(([, v]) => v > 0)
//     .map(([status, globalCount]) => {
//       const exact = globalCount * ratio;
//       return {
//         key: status,
//         label: status.replace(/_/g, ' ').toLowerCase()
//           .replace(/\b\w/g, c => c.toUpperCase()),
//         color: STATUS_COLORS[status] || getStableColor(status),
//         floor: Math.floor(exact),
//         frac: exact % 1,
//       };
//     })
//     .filter(s => s.floor > 0 || s.frac > 0);

//   const floorSum = raw.reduce((s, sl) => s + sl.floor, 0);
//   const missing = sourceTotal - floorSum;
//   raw.sort((a, b) => b.frac - a.frac);
//   raw.forEach((sl, i) => { sl.floor += i < missing ? 1 : 0; });

//   return raw
//     .filter(s => s.floor > 0)
//     .map(sl => ({
//       key: sl.key,
//       label: sl.label,
//       value: sl.floor,
//       color: sl.color,
//     }));
// }

// // Change 4 — Update sourceSlices useMemo dependency array at line 814:

// }, [sourceCounts, sourceFilter, sourceStatusFilter, counts, sourceOptions, sourceStatusCounts]);

// only change 5 — Update the sourceSlices useMemo to use sourceStatusCounts when sourceStatusFilter is applied:if (sourceFilter && !sourceStatusFilter) {
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