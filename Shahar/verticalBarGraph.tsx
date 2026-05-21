{/* /* Queue Title + Toolbar */ */}
<Card className="lmn-mb-16px">
<Card header>
  <El className="lmn-d-flex lmn-justify-content-between lmn-align-items-center" style={{ width: '100%' }}>
    
    {/* Left Side: Queue Title */}
    <span style={{ fontSize: '15px', fontWeight: 600 }}>
      <Icon type="list" className="lmn-mr-4px" />
      {activeCardLabel} Queue
    </span>

    {/* Right Side: Consolidated Actions Toolbar (Horizontal Alignment) */}
    <El className="lmn-d-flex lmn-align-items-center" style={{ gap: '12px' }}>
      
      {/* Utility Action Links */}
      <Button color="outline" size="xs">
        <Icon type="comment" className="lmn-mr-4px" /> Add Comments
      </Button>
      
      <Button color="outline" size="xs">
        <Icon type="settings-sliders" className="lmn-mr-4px" /> More Filters
      </Button>

      {/* Visual Separation Divider */}
      <div style={{ width: '1px', height: '16px', backgroundColor: '#d9d9d9', margin: '0 4px' }} />

      {/* Action Icon Group Moved Up From Bottom Right */}
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

<Card body>
  {/* /* Distributed Grid Layout for Search Box and Filters Panel */ */}
  <El 
    className="lmn-d-flex lmn-align-items-end" 
    style={{ 
      gap: '16px', 
      width: '100%', 
      flexWrap: 'nowrap' 
    }}
  >
    
    {/* Search Inputs Cluster */}
    <El style={{ flex: '2.5', minWidth: '260px' }} className="lmn-d-flex lmn-flex-column">
      <El tag="label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', visibility: 'hidden' }}>
        Search Spacer
      </El>
      <El className="lmn-d-flex" style={{ gap: '8px', width: '100%' }}>
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

    {/* Country Field */}
    <El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
      <El tag="label" className="lmn-form-label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
        Country
      </El>
      <Dropdown value={countryFilter} onChange={(v) => setCountryFilter(String(v))} placeholder="Any" style={{ width: '100%' }}>
        {COUNTRY_OPTIONS.map((o) => (
          <Dropdown.Item key={o.value} value={o.value}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown>
    </El>

    {/* Source Field */}
    <El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
      <El tag="label" className="lmn-form-label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
        Source
      </El>
      <Dropdown value={sourceFilter} onChange={(v) => setSourceFilter(String(v))} placeholder="Any" style={{ width: '100%' }}>
        {SOURCE_OPTIONS.map((o) => (
          <Dropdown.Item key={o.value} value={o.value}>{o.label}</Dropdown.Item>
        ))}
      </Dropdown>
    </El>

    {/* Due Date Input Field */}
    <El style={{ flex: '1.5', minWidth: '180px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
      <El tag="label" className="lmn-form-label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
        Due Date
      </El>
      <Input value="04/25/2026 - 05/04/2026" readOnly iconSuffix="calendar" style={{ width: '100%' }} />
    </El>

    {/* Assignee Field */}
    <El style={{ flex: '1', minWidth: '110px' }} className="lmn-d-flex lmn-flex-column lmn-form-group lmn-mb-0">
      <El tag="label" className="lmn-form-label" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
        Assignee
      </El>
      <Dropdown value="" onChange={() => {}} placeholder="Any" style={{ width: '100%' }}>
        <Dropdown.Item value="">Any</Dropdown.Item>
      </Dropdown>
    </El>

  </El>
</Card body>
</Card>