const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);

<El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
  <El tag="label" className="lmn-form-label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
    Assignee
  </El>
  {/* 🚀 Wrapper for relative positioning */}
  <El style={{ position: 'relative', width: '100%' }}>
    <Dropdown
      multiple
      value={assigneeFilter}
      onChange={(val: any) => { setAssigneeFilter(Array.isArray(val) ? val : [String(val)]); }}
      placeholder="Any"
      style={{ width: '100%' }}
    >
      {/* 🚀 Removed the hardcoded "__any__" item and the custom label prop */}
      {userOptions.map((opt) => (
        <Dropdown.Item key={opt.value} value={opt.value}>
          {opt.label}
        </Dropdown.Item>
      ))}
    </Dropdown>
    
    {/* 🚀 Dynamic clear icon */}
    {assigneeFilter.length > 0 && (
      <Icon 
        type="close" 
        style={{ position: 'absolute', right: '26px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '12px', color: '#999', zIndex: 10, padding: '4px' }} 
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setAssigneeFilter([]); }}
      />
    )}
  </El>
</El>

// Replace lines 308 to 310 with this array-safe version:

if (assigneeFilter && assigneeFilter.length > 0) {
    result = result.filter(i => assigneeFilter.includes(i.primaryAssignee || ''));
  }