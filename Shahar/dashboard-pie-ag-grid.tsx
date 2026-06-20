// Fix 1 — Source effect (only the condition on this one line)
//Find:

if (!sourceFilter && sourceStatusFilter) {

  //Change to:

  if (sourceStatusFilter) {

    // Fix 2 — Country effect (mirror, same single-line change)
//Find:

if (!countryFilter && countryStatusFilter) {


  // Change to:

  if (countryStatusFilter) {

    /// Fix 3 — sourceSlices, single-slice branch — two small insertions, not a rewrite
//Find:

if (estimatedCount === 0) return [];
return [{
  key: sourceStatusFilter,
  label: `${displayLabel} — ${displaySource}`,
  value: estimatedCount,
  color: STATUS_COLORS[sourceStatusFilter] || getStableColor(sourceStatusFilter),
}];


// Replace with:

const realCount = sourceCounts[sourceFilter] ?? 0;
if (realCount === 0) return [];
return [{
  key: sourceStatusFilter,
  label: `${displayLabel} — ${displaySource}`,
  value: realCount,
  color: STATUS_COLORS[sourceStatusFilter] || getStableColor(sourceStatusFilter),
}];

// Fix 4 — countrySlices, single-slice branch — same two insertions
//Find:

if (estimatedCount === 0) return [];
return [{
  key: countryStatusFilter,
  label: `${displayLabel} — ${displayCountry}`,
  value: estimatedCount,
  color: STATUS_COLORS[countryStatusFilter] || getStableColor(countryStatusFilter),
}];

// Replace with:

const realCount = countryCounts[countryFilter] ?? 0;
if (realCount === 0) return [];
return [{
  key: countryStatusFilter,
  label: `${displayLabel} — ${displayCountry}`,
  value: realCount,
  color: STATUS_COLORS[countryStatusFilter] || getStableColor(countryStatusFilter),
}];



