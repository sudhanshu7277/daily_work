// Change 1 — Fix handleDrillDown to include the status filter (lines 1058–1098)
//The function needs to accept an optional status override, and apply sourceStatusFilter/countryStatusFilter when building params.
//Replace lines 1058–1098 with:

async function handleDrillDown(
  type: 'status' | 'assignee' | 'source' | 'country',
  rawKey: string,
  displayValue: string,
  statusOverride?: string
) {
  const params: Record<string, unknown> = {
    region: regionFilter || undefined,
    size: 1000,
  };
  switch (type) {
    case 'status':
      params.status = rawKey;
      break;
    case 'assignee':
      params.createdBy = rawKey;
      break;
    case 'source':
      params.instructionSource = sourceDisplayToCode[rawKey] || rawKey;
      // apply status filter if grid is open and status is selected
      const srcStatus = statusOverride !== undefined ? statusOverride : sourceStatusFilter;
      if (srcStatus) params.status = srcStatus;
      break;
    case 'country':
      params.country = rawKey;
      // apply status filter if grid is open and status is selected
      const cntStatus = statusOverride !== undefined ? statusOverride : countryStatusFilter;
      if (cntStatus) params.status = cntStatus;
      break;
  }
  try {
    const res = await getInstructions(params as Parameters<typeof getInstructions>[0]);
    const items = res.data?.content ?? [];
    switch (type) {
      case 'status':
        setStatusDrillDown({ value: displayValue, data: items });
        break;
      case 'assignee':
        setAssigneeDrillDown({ value: displayValue, data: items });
        break;
      case 'source':
        setSourceDrillDown({ value: displayValue, data: items });
        break;
      case 'country':
        setCountryDrillDown({ value: displayValue, data: items });
        break;
    }
  } catch {
    // silently fail - the user still sees the chart
  }
}


// Change 2 — Re-trigger source grid when dropdowns change while grid is open
//Find your existing useEffect that resets sourceStatusFilter when sourceFilter changes. It currently looks something like:

useEffect(() => {
  setSourceStatusFilter('');
}, [sourceFilter]);

// Replace it with:

useEffect(() => {
  setSourceStatusFilter('');
  if (sourceDrillDown && sourceFilter) {
    handleDrillDown('source', sourceFilter, sourceFilter);
  } else if (sourceDrillDown && !sourceFilter) {
    setSourceDrillDown(null);
  }
}, [sourceFilter]);


// Change 3 — Re-trigger source grid when status dropdown changes while grid is open
//Find where sourceStatusFilter is used in effects, or add this new useEffect right after the one above:

useEffect(() => {
  if (sourceDrillDown && sourceFilter) {
    handleDrillDown('source', sourceFilter, sourceFilter, sourceStatusFilter || undefined);
  }
}, [sourceStatusFilter]);


// Change 4 — Same two effects for Country
//Find the existing country reset effect (resets countryStatusFilter when countryFilter changes):

useEffect(() => {
  setCountryStatusFilter('');
}, [countryFilter]);

// Replace it with:

useEffect(() => {
  setCountryStatusFilter('');
  if (countryDrillDown && countryFilter) {
    handleDrillDown('country', countryFilter, countryFilter);
  } else if (countryDrillDown && !countryFilter) {
    setCountryDrillDown(null);
  }
}, [countryFilter]);


// And add after it:

useEffect(() => {
  if (countryDrillDown && countryFilter) {
    handleDrillDown('country', countryFilter, countryFilter, countryStatusFilter || undefined);
  }
}, [countryStatusFilter]);


// Change 5 — Fix the pie onSliceClick to pass status through (images 3 & 6, lines 1447 & 1534)
// Currently:

onSliceClick={(s) => handleDrillDown('source', s.key ?? s.label, s.label)}

