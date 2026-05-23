// Changed from: const cx = 60, cy = 60, r = 55;
const cx = 110;
const cy = 110;
const r = 90;


const d = segments.length === 1
  ? `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`
  : `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;

  <El style={{ width: '100%', height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '12px 0' }}></El>