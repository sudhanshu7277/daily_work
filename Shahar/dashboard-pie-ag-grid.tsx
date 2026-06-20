

// Fix 1 — Add key to the status-breakdown slices (lines 772–780)

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


  // search for
  type PieSlice = { label: string; value: number; color: string };


  // and replace with 
  type PieSlice = { key?: string; label: string; value: number; color: string };

  // Fix 3 — onSliceClick for the status-breakdown view

  onSliceClick={(s) => handleDrillDown('source', s.key ?? s.label, s.label)}


  // replace above with 

  onSliceClick={(s) => 
    sourceFilter
      ? handleDrillDown('source', sourceFilter, sourceFilter, s.key)
      : handleDrillDown('source', s.key ?? s.label, s.label)
  }