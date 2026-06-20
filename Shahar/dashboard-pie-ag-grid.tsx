// 1. State — add these two lines near your other useState declarations

const [sourceGridOpen, setSourceGridOpen] = useState(false);
const [countryGridOpen, setCountryGridOpen] = useState(false);

// 2. handleDrillDown — replace the entire function

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
      if (statusOverride !== undefined) {
        if (statusOverride) params.status = statusOverride;
      } else if (sourceStatusFilter) {
        params.status = sourceStatusFilter;
      }
      break;
    case 'country':
      params.country = rawKey;
      if (statusOverride !== undefined) {
        if (statusOverride) params.status = statusOverride;
      } else if (countryStatusFilter) {
        params.status = countryStatusFilter;
      }
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
        setSourceGridOpen(true);
        break;
      case 'country':
        setCountryDrillDown({ value: displayValue, data: items });
        setCountryGridOpen(true);
        break;
    }
  } catch {
    // silently fail - the user still sees the chart
  }
}


// 3. sourceSlices — replace the entire useMemo

const sourceSlices: PieSlice[] = useMemo(() => {
  const grandTotal = Object.values(sourceCounts).reduce((s, v) => s + v, 0);

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

  if (sourceFilter && sourceStatusFilter) {
    const sourceTotal = sourceCounts[sourceFilter] ?? 0;
    const ratio = grandTotal > 0 ? sourceTotal / grandTotal : 0;
    const statusCount = counts[sourceStatusFilter] ?? 0;
    const estimatedCount = Math.round(statusCount * ratio);

    const isDrillDownCurrent =
      sourceDrillDown &&
      sourceDrillDown.data.length > 0 &&
      sourceDrillDown.data.every((item: any) => item.status === sourceStatusFilter);

    const finalCount = isDrillDownCurrent ? sourceDrillDown!.data.length : estimatedCount;

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

  const merged: Record<string, PieSlice> = {};
  mapToSlices(sourceCounts).forEach(s => {
    const label = s.label.toLowerCase() === 'email_poller' ? 'Email' : s.label;
    if (merged[label]) {
      merged[label] = { ...merged[label], value: merged[label].value + s.value };
    } else {
      merged[label] = { ...s, label };
    }
  });
  return Object.values(merged);
}, [sourceCounts, sourceFilter, sourceStatusFilter, counts, sourceDrillDown]);


///(Dropped the key: status compile-error worry — your earlier edit with key: status already compiled fine, so PieSlice evidently already supports it. No type changes needed.)
//4. countrySlices — mirror, replace the entire useMemo

const countrySlices: PieSlice[] = useMemo(() => {
  const grandTotal = Object.values(countryCounts).reduce((s, v) => s + v, 0);

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

  if (countryFilter && countryStatusFilter) {
    const countryTotal = countryCounts[countryFilter] ?? 0;
    const ratio = grandTotal > 0 ? countryTotal / grandTotal : 0;
    const statusCount = counts[countryStatusFilter] ?? 0;
    const estimatedCount = Math.round(statusCount * ratio);

    const isDrillDownCurrent =
      countryDrillDown &&
      countryDrillDown.data.length > 0 &&
      countryDrillDown.data.every((item: any) => item.status === countryStatusFilter);

    const finalCount = isDrillDownCurrent ? countryDrillDown!.data.length : estimatedCount;

    const displayLabel = countryStatusFilter.replace(/_/g, ' ')
      .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    if (finalCount === 0) return [];
    return [{
      key: countryStatusFilter,
      label: `${displayLabel} — ${countryFilter}`,
      value: finalCount,
      color: STATUS_COLORS[countryStatusFilter] || getStableColor(countryStatusFilter),
    }];
  }

  const merged: Record<string, PieSlice> = {};
  mapToSlices(countryCounts).forEach(s => {
    if (merged[s.label]) {
      merged[s.label] = { ...merged[s.label], value: merged[s.label].value + s.value };
    } else {
      merged[s.label] = { ...s };
    }
  });
  return Object.values(merged);
}, [countryCounts, countryFilter, countryStatusFilter, counts, countryDrillDown]);


// One assumption here: I'm calling your country totals object countryCounts, mirroring sourceCounts. If it's named differently in your file, swap that one identifier — the structure itself mirrors sourceSlices exactly.
// 5. Source card JSX — replace the whole card

<Card style={{ height: '100%' }}>
  <Card header>
    <El className="dashboard-card-header-content">
      <span>Instruction(s) by Source</span>

      {!sourceGridOpen && (
        <El className="dashboard-chart-filters">
          <El className="lmn-d-flex lmn-flex-column">
            <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
              Instruction(s) by Source
            </El>
            <Dropdown
              value={sourceFilter}
              onChange={(v) => setSourceFilter(String(v))}
              placeholder="--Select Source--"
              style={{ width: 120 }}
              size="sm"
            >
              <Dropdown.Item value="">--Select Source--</Dropdown.Item>
              {sourceOptions.map(o => (
                <Dropdown.Item key={o.value} value={o.value}>{o.label}</Dropdown.Item>
              ))}
            </Dropdown>
          </El>

          <El className="lmn-d-flex lmn-flex-column">
            <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
              Instruction(s) by Status
            </El>
            <Dropdown
              value={sourceStatusFilter}
              onChange={(v) => setSourceStatusFilter(String(v))}
              placeholder="Select a Status"
              style={{ width: 120 }}
              size="sm"
              disabled={!sourceFilter}
            >
              <Dropdown.Item value="">Select a Status</Dropdown.Item>
              {STATUS_ORDER
                .filter(s => (counts as Record<string, number>)[s] > 0)
                .map(s => (
                  <Dropdown.Item key={s} value={s}>
                    {s.replace(/_/g, ' ').toLowerCase()
                      .replace(/\b\w/g, c => c.toUpperCase())}
                  </Dropdown.Item>
                ))}
            </Dropdown>
          </El>
        </El>
      )}
    </El>
  </Card>

  <Card body>
    {sourceGridOpen && sourceDrillDown ? (
      <El>
        <El className="lmn-d-flex lmn-align-items-center lmn-mb-8px">
          <Button
            size="sm"
            kind="ghost"
            onClick={() => setSourceGridOpen(false)}
            title="Back to chart"
            style={{ padding: '2px 6px', minWidth: 'auto' }}
          >
            <Icon type="arrow-left" style={{ fontSize: 16 }} />
          </Button>
        </El>
        <div className="ag-theme-quartz" style={{ width: '100%', height: 280 }}>
          <AgGridReact
            rowData={sourceDrillDown.data}
            columnDefs={drillDownColumnDefs}
            defaultColDef={drillDownDefaultColDef}
            animateRows
            pagination
            paginationPageSize={5}
            paginationPageSizeSelector={[5, 10, 20]}
            rowHeight={40}
            headerHeight={36}
          />
        </div>
      </El>
    ) : (
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
    )}
  </Card>
</Card>

// 6. Country card JSX — replace the whole card

<Card style={{ height: '100%' }}>
  <Card header>
    <El className="dashboard-card-header-content">
      <span>Instruction(s) by Country</span>

      {!countryGridOpen && (
        <El className="dashboard-chart-filters">
          <El className="lmn-d-flex lmn-flex-column">
            <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
              Instruction(s) by Country
            </El>
            <Dropdown
              value={countryFilter}
              onChange={(v) => setCountryFilter(String(v))}
              placeholder="--Select Country--"
              label={countryOptions.find((opt) => opt.key === countryFilter)?.value}
              style={{ width: 120 }}
              size="sm"
            >
              <Dropdown.Item value="">--Select Country--</Dropdown.Item>
              {countryOptions.map(o => (
                <Dropdown.Item key={o.key} value={o.key}>{o.value}</Dropdown.Item>
              ))}
            </Dropdown>
          </El>

          <El className="lmn-d-flex lmn-flex-column">
            <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
              Filter by Status
            </El>
            <Dropdown
              value={countryStatusFilter}
              onChange={(v) => setCountryStatusFilter(String(v))}
              placeholder="Select a Status"
              style={{ width: 120 }}
              size="sm"
              disabled={!countryFilter}
            >
              <Dropdown.Item value="">Select a Status</Dropdown.Item>
              {STATUS_ORDER
                .filter(s => (counts as Record<string, number>)[s] > 0)
                .map(s => (
                  <Dropdown.Item key={s} value={s}>
                    {s.replace(/_/g, ' ').toLowerCase()
                      .replace(/\b\w/g, c => c.toUpperCase())}
                  </Dropdown.Item>
                ))}
            </Dropdown>
          </El>
        </El>
      )}
    </El>
  </Card>

  <Card body>
    {countryGridOpen && countryDrillDown ? (
      <El>
        <El className="lmn-d-flex lmn-align-items-center lmn-mb-8px">
          <Button
            size="sm"
            kind="ghost"
            onClick={() => setCountryGridOpen(false)}
            title="Back to chart"
            style={{ padding: '2px 6px', minWidth: 'auto' }}
          >
            <Icon type="arrow-left" style={{ fontSize: 16 }} />
          </Button>
        </El>
        <div className="ag-theme-quartz" style={{ width: '100%', height: 280 }}>
          <AgGridReact
            rowData={countryDrillDown.data}
            columnDefs={drillDownColumnDefs}
            defaultColDef={drillDownDefaultColDef}
            animateRows
            pagination
            paginationPageSize={5}
            paginationPageSizeSelector={[5, 10, 20]}
            rowHeight={40}
            headerHeight={36}
          />
        </div>
      </El>
    ) : (
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
    )}
  </Card>
</Card>


// Replace both Source effects with:

useEffect(() => {
  setSourceStatusFilter('');
  setSourceGridOpen(false);
}, [sourceFilter]);

useEffect(() => {
  setSourceGridOpen(false);
}, [sourceStatusFilter]);

// Replace both Country effects with:
useEffect(() => {
  setCountryStatusFilter('');
  setCountryGridOpen(false);
}, [countryFilter]);

useEffect(() => {
  setCountryGridOpen(false);
}, [countryStatusFilter]);