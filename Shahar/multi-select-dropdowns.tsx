// Update these state hooks where they are declared
const [overdueAssigneeFilter, setOverdueAssigneeFilter] = useState<string[]>([]);
const [overdueSourceFilter, setOverdueSourceFilter] = useState<string[]>([]);
// Do the same for Status, Client, and Country filters



{/* --- ASSIGNEE MULTI-SELECT --- */}
<El className="lmn-d-flex lmn-flex-column">
  <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>Assignee</El>
  <Dropdown 
    multiple // 🚀 Enables multi-selection checkboxes
    value={overdueAssigneeFilter} 
    onChange={(v: any) => {
      // Safely cast to an array if the library returns a single item unexpectedly
      setOverdueAssigneeFilter(Array.isArray(v) ? v : [String(v)]);
    }} 
    placeholder="All" 
    style={{ width: 140 }} 
    size="sm"
    allowClear // Adds a small 'x' to quickly clear all selections
  >
    {overdueAssigneeOptions.map(o => (
      <Dropdown.Item key={o} value={o}>{o}</Dropdown.Item>
    ))}
  </Dropdown>
</El>

{/* --- SOURCE MULTI-SELECT --- */}
<El className="lmn-d-flex lmn-flex-column">
  <El tag="label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>Source</El>
  <Dropdown 
    multiple 
    value={overdueSourceFilter} 
    onChange={(v: any) => {
      setOverdueSourceFilter(Array.isArray(v) ? v : [String(v)]);
    }} 
    placeholder="All" 
    style={{ width: 140 }} 
    size="sm"
    allowClear
  >
    {overdueSourceOptions.map(o => (
      <Dropdown.Item key={o} value={o}>{o}</Dropdown.Item>
    ))}
  </Dropdown>
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