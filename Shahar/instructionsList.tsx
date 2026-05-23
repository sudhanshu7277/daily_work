// CHANGE THIS:
const segments = slices.filter(s => s.value > 0);
const cx = 100, cy = 100, r = 90; // <-- Change from 60, 60, 55 to 100, 100, 90
let cumAngle = -90;

// CHANGE THIS BLOCK:
const d = segments.length === 1
  ? `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z` // <-- Cleared hardcoded math references
  : `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;




  // CHANGE THE SVG WRAPPER TAG TO THIS:
<svg width="220" height="220" viewBox="0 0 220 220" style={{ overflow: 'visible' }}></svg>