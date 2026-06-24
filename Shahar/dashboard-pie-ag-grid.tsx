// BEFORE (line 774)
value: Math.round(globalCount * ratio),

// AFTER
value: Math.round(globalCount * ratio * sourceTotal / 
  Math.max(Object.entries(counts)
    .filter(([,v]) => v > 0)
    .reduce((sum, [, v]) => sum + Math.round(v * ratio), 0), 1)
  * sourceTotal),