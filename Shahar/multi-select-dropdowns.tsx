// Update these state hooks where they are declared
const [overdueAssigneeFilter, setOverdueAssigneeFilter] = useState<string[]>([]);
const [overdueSourceFilter, setOverdueSourceFilter] = useState<string[]>([]);
// Do the same for Status, Client, and Country filters


{/* --- ASSIGNEE MULTI-SELECT --- */}
<El className="lmn-d-flex lmn-flex-column">
  <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>Assignee</El>
  
  {/* 🚀 Wrapper to hold the dropdown and the custom icon together */}
  <El style={{ position: 'relative', width: 140 }}>
    <Dropdown 
      multiple 
      value={overdueAssigneeFilter} 
      onChange={(v: any) => {
        setOverdueAssigneeFilter(Array.isArray(v) ? v : [String(v)]);
      }} 
      placeholder="All" 
      style={{ width: '100%' }} // Let the wrapper control the 140px width
      size="sm"
    >
      {overdueAssigneeOptions.map(o => (
        <Dropdown.Item key={o} value={o}>{o}</Dropdown.Item>
      ))}
    </Dropdown>

    {/* 🚀 DYNAMIC CROSS ICON: Only appears when selections exist */}
    {overdueAssigneeFilter.length > 0 && (
      <Icon 
        type="close" // Note: If your icon library uses a different name for the 'x', change this to "times" or "x"
        style={{ 
          position: 'absolute', 
          right: '26px', // Positions the 'X' cleanly next to the dropdown caret
          top: '50%', 
          transform: 'translateY(-50%)', 
          cursor: 'pointer', 
          fontSize: '12px', 
          color: '#999',
          zIndex: 10,
          padding: '4px' // Makes the clickable area slightly larger for users
        }} 
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation(); // Stops the dropdown from opening when clicking the X
          e.preventDefault();
          setOverdueAssigneeFilter([]);
        }}
      />
    )}
  </El>
</El>

{/* --- SOURCE MULTI-SELECT --- */}
<El className="lmn-d-flex lmn-flex-column">
  <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>Source</El>
  <El style={{ position: 'relative', width: 140 }}>
    <Dropdown 
      multiple 
      value={overdueSourceFilter} 
      onChange={(v: any) => {
        setOverdueSourceFilter(Array.isArray(v) ? v : [String(v)]);
      }} 
      placeholder="All" 
      style={{ width: '100%' }} 
      size="sm"
    >
      {overdueSourceOptions.map(o => (
        <Dropdown.Item key={o} value={o}>{o}</Dropdown.Item>
      ))}
    </Dropdown>

    {/* 🚀 DYNAMIC CROSS ICON */}
    {overdueSourceFilter.length > 0 && (
      <Icon 
        type="close" 
        style={{ 
          position: 'absolute', 
          right: '26px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          cursor: 'pointer', 
          fontSize: '12px', 
          color: '#999',
          zIndex: 10,
          padding: '4px'
        }} 
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation(); 
          e.preventDefault();
          setOverdueSourceFilter([]);
        }}
      />
    )}
  </El>
</El>


// Example downstream filter logic check:
const matchesSource = overdueSourceFilter.length === 0 || overdueSourceFilter.includes(item.source);


// 1. ASSIGNEE
if (overdueAssigneeFilter && overdueAssigneeFilter.length > 0) {
    data = data.filter(i => overdueAssigneeFilter.includes(i.primaryAssignee || ''));
  }
  
  // 2. SOURCE
  if (overdueSourceFilter && overdueSourceFilter.length > 0) {
    data = data.filter(i => overdueSourceFilter.includes(i.instructionSourceDisplay || ''));
  }
  
  // 3. STATUS
  if (overdueStatusFilter && overdueStatusFilter.length > 0) {
    data = data.filter(i => overdueStatusFilter.includes(i.status || ''));
  }
  
  // 4. CLIENT
  if (overdueClientFilter && overdueClientFilter.length > 0) {
    data = data.filter(i => overdueClientFilter.includes(i.clientName || ''));
  }
  
  // 5. COUNTRY
  if (overdueCountryFilter && overdueCountryFilter.length > 0) {
    data = data.filter(i => overdueCountryFilter.includes(i.countryDisplay || i.country || ''));
  }