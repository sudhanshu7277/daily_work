// 1. Replace all four dropdown-effects (lines ~530–561)
//Current code (confirmed from your screenshots):

useEffect(() => {
  setSourceStatusFilter('');
  if (sourceDrillDown && sourceFilter) {
    handleDrillDown('source', sourceFilter, sourceFilter);
  } else if (sourceDrillDown && !sourceFilter) {
    setSourceDrillDown(null);
  }
}, [sourceFilter]);

useEffect(() => {
  if (sourceDrillDown && sourceFilter) {
    handleDrillDown('source', sourceFilter, sourceFilter, sourceStatusFilter || undefined);
  }
}, [sourceStatusFilter]);

useEffect(() => {
  setCountryStatusFilter('');
  if (countryDrillDown && countryFilter) {
    handleDrillDown('country', countryFilter, countryFilter);
  } else if (countryDrillDown && !countryFilter) {
    setCountryDrillDown(null);
  }
}, [countryFilter]);

useEffect(() => {
  if (countryDrillDown && countryFilter) {
    handleDrillDown('country', countryFilter, countryFilter, countryStatusFilter || undefined);
  }
}, [countryStatusFilter]);



// Replace with:

useEffect(() => {
  setSourceStatusFilter('');
  setSourceDrillDown(null);
}, [sourceFilter]);

useEffect(() => {
  setSourceDrillDown(null);
}, [sourceStatusFilter]);

useEffect(() => {
  setCountryStatusFilter('');
  setCountryDrillDown(null);
}, [countryFilter]);

useEffect(() => {
  setCountryDrillDown(null);
}, [countryStatusFilter]);

// 2. sourceSlices — breakdown branch (lines 763–775), add key

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

//(only addition: key: status, as the first property)
//3. sourceSlices — single-slice branch (lines 777–792), add key

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
    key: sourceStatusFilter,
    label: `${displayLabel} — ${displaySource}`,
    value: estimatedCount,
    color: STATUS_COLORS[sourceStatusFilter] || getStableColor(sourceStatusFilter),
  }];
}

//4. countrySlices — breakdown branch (lines 712–724), add key

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

// 5. countrySlices — single-slice branch (lines 726–740), add key


if (countryFilter && countryStatusFilter) {
  const countryTotal = countryCounts[countryFilter] ?? 0;
  const ratio = grandTotal > 0 ? countryTotal / grandTotal : 0;
  const statusCount = counts[countryStatusFilter] ?? 0;
  const estimatedCount = Math.round(statusCount * ratio);
  const displayLabel = countryStatusFilter.replace(/_/g, ' ')
    .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const displayCountry = codeToName[countryFilter] ?? countryFilter;
  if (estimatedCount === 0) return [];
  return [{
    key: countryStatusFilter,
    label: `${displayLabel} — ${displayCountry}`,
    value: estimatedCount,
    color: STATUS_COLORS[countryStatusFilter] || getStableColor(countryStatusFilter),
  }];
}

// 6. onSliceClick handlers and dropdown-hide JSX

<SimplePieChart slices={sourceSlices} onSliceClick={(s) => handleDrillDown('source', s.key ?? s.label, s.label)} />

  // Replace both (source and the mirrored country one) with:

  // source

  <SimplePieChart
  slices={sourceSlices}
  onSliceClick={(s) => {
    if (sourceFilter && sourceStatusFilter) {
      handleDrillDown('source', sourceFilter, sourceFilter, sourceStatusFilter);
    } else if (sourceFilter && !sourceStatusFilter) {
      handleDrillDown('source', sourceFilter, sourceFilter, s.key);
    } else {
      handleDrillDown('source', s.key ?? s.label, s.label);
    }
  }}
/>


// Country:

<SimplePieChart
  slices={countrySlices}
  onSliceClick={(s) => {
    if (countryFilter && countryStatusFilter) {
      handleDrillDown('country', countryFilter, countryFilter, countryStatusFilter);
    } else if (countryFilter && !countryStatusFilter) {
      handleDrillDown('country', countryFilter, countryFilter, s.key);
    } else {
      handleDrillDown('country', s.key ?? s.label, s.label);
    }
  }}
/>

// And wrap each card's filter block (the <El className="dashboard-chart-filters">...</El> containing both dropdowns) with:

{!sourceDrillDown && (
  <El className="dashboard-chart-filters">
    {/* existing dropdown content, unchanged */}
  </El>
)}

// and the matching 
// 
{!countryDrillDown && (...)} for the country card.