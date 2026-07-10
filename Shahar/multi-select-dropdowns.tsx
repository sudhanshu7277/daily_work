// ApprovalQueuePage.tsx

const [countryFilter, setCountryFilter] = useState<string[]>([]); 
const [sourceFilter, setSourceFilter] = useState<string[]>([]);


{/* --- COUNTRY MULTI-SELECT --- */}
<El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
  <El tag="label" className="lmn-form-label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
    Country
  </El>
  {/* 🚀 Wrapper for relative positioning */}
  <El style={{ position: 'relative', width: '100%' }}>
    <Dropdown
      multiple
      value={countryFilter}
      onChange={(val: any) => { setCountryFilter(Array.isArray(val) ? val : [String(val)]); }}
      placeholder="Any"
      style={{ width: '100%' }}
    >
      {/* 🚀 Removed the hardcoded "__any__" item since an empty array handles this naturally */}
      {countryOptions.map((countryOption) => (
        <Dropdown.Item key={countryOption.key} value={countryOption.key}>
          {countryOption.value}
        </Dropdown.Item>
      ))}
    </Dropdown>
    
    {/* 🚀 Dynamic clear icon */}
    {countryFilter.length > 0 && (
      <Icon 
        type="close" 
        style={{ position: 'absolute', right: '26px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '12px', color: '#999', zIndex: 10, padding: '4px' }} 
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setCountryFilter([]); }}
      />
    )}
  </El>
</El>

{/* --- SOURCE MULTI-SELECT --- */}
<El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
  <El tag="label" className="lmn-form-label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
    Source
  </El>
  <El style={{ position: 'relative', width: '100%' }}>
    <Dropdown
      multiple
      value={sourceFilter}
      onChange={(val: any) => { setSourceFilter(Array.isArray(val) ? val : [String(val)]); }}
      placeholder="Any"
      style={{ width: '100%' }}
    >
      {sourceOptions.map((sourceOption) => (
        <Dropdown.Item key={sourceOption.key} value={sourceOption.key}>
          {sourceOption.value}
        </Dropdown.Item>
      ))}
    </Dropdown>

    {sourceFilter.length > 0 && (
      <Icon 
        type="close" 
        style={{ position: 'absolute', right: '26px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '12px', color: '#999', zIndex: 10, padding: '4px' }} 
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setSourceFilter([]); }}
      />
    )}
  </El>
</El>



