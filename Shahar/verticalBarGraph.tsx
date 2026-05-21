<Card header>
  <El className="lmn-d-flex lmn-justify-content-between lmn-align-items-center" style={{ width: '100%' }}>
    
    {/* Left Side: Queue Title */}
    <span style={{ fontSize: 16, fontWeight: 600 }}>
      <Icon type="list" className="lmn-mr-4px" />
      {activeCardLabel} Queue
    </span>

    {/* Right Side: Consolidated Actions Toolbar (Horizontal Alignment) */}
    <El className="lmn-d-flex lmn-align-items-center" style={{ gap: '16px' }}>
      
      {/* Utility Links */}
      <Button color="outline" size="xs">
        <Icon type="comment" className="lmn-mr-4px" /> Add Comments
      </Button>
      
      <Button color="outline" size="xs">
        <Icon type="settings-sliders" className="lmn-mr-4px" /> More Filters
      </Button>

      {/* Vertical separator line for visual clarity */}
      <div style={{ width: '1px', height: '18px', backgroundColor: '#ccc', margin: '0 4px' }} />

      {/* Main Grid Operation Buttons */}
      <Button color="outline" size="xs" title="Export">
        <Icon type="download" />
      </Button>
      
      <Button color="outline" size="xs" title="Filter">
        <Icon type="filter-alt" />
      </Button>
      
      <Button color="outline" size="xs" title="Refresh" onClick={loadData}>
        <Icon type="refresh" />
      </Button>

    </El>
  </El>
</Card>


{/* /* Unified Search Bar + Filters Grid Row */ */}
<El 
  className="lmn-d-flex lmn-align-items-end" 
  style={{ 
    gap: '16px', 
    width: '100%', 
    marginBottom: '20px',
    flexWrap: 'nowrap' /* Ensures nothing wraps down out of the grid row line */
  }}
>
  
  {/* 1. Search Query Input Field */}
  <El style={{ flex: '2', minWidth: '220px' }} className="lmn-d-flex lmn-flex-column">
    <El tag="label" style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, visibility: 'hidden' }}>Search</El>
    <El className="lmn-d-flex" style={{ gap: '6px', width: '100%' }}>
      <Input
        placeholder="Search Instructions"
        value={searchTerm}
        iconPrefix="search"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        style={{ width: '100%' }}
      />
      <Button color="primary" size="sm" onClick={loadData} style={{ whiteSpace: 'nowrap' }}>
        <Icon type="search" className="lmn-mr-4px" /> Search
      </Button>
    </El>
  </El>

  {/* 2. Country Selector */}
  <El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
    <El tag="label" className="lmn-form-label" style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Country</El>
    <Dropdown value={countryFilter} onChange={(v) => setCountryFilter(String(v))} placeholder="Any" style={{ width: '100%' }}>
      {COUNTRY_OPTIONS.map(o => (
        <Dropdown.Item key={o.value} value={o.value}>{o.label}</Dropdown.Item>
      ))}
    </Dropdown>
  </El>

  {/* 3. Source Selector */}
  <El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
    <El tag="label" className="lmn-form-label" style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Source</El>
    <Dropdown value={sourceFilter} onChange={(v) => setSourceFilter(String(v))} placeholder="Any" style={{ width: '100%' }}>
      {SOURCE_OPTIONS.map(o => (
        <Dropdown.Item key={o.value} value={o.value}>{o.label}</Dropdown.Item>
      ))}
    </Dropdown>
  </El>

  {/* 4. Due Date Range Selector */}
  <El style={{ flex: '1.5', minWidth: '160px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
    <El tag="label" className="lmn-form-label" style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Due Date</El>
    <Input value="04/25/2026 - 05/04/2026" readOnly iconSuffix="calendar" style={{ width: '100%' }} />
  </El>

  {/* 5. Assignee Selector */}
  <El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
    <El tag="label" className="lmn-form-label" style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Assignee</El>
    <Dropdown value="" onChange={() => {}} placeholder="Any" style={{ width: '100%' }}>
      <Dropdown.Item value="">Any</Dropdown.Item>
    </Dropdown>
  </El>

</El>