const overdueColumns = [
    // 1. FIRST COLUMN: Selection Checkboxes
    {
      title: 'Select', 
      dataIndex: 'instructionId',
      key: 'selection',
      width: 60,
      align: 'center',
      render: (_: unknown, record: any) => (
        <input 
          type="checkbox" 
          style={{ cursor: 'pointer', transform: 'scale(1.1)' }} 
        />
      ),
    },
    // 2. Sequence No. Column
    {
      title: 'Sequence No.',
      dataIndex: 'instructionRef',
      key: 'ref',
      sorter: (a: any, b: any) => 
        (a.instructionRef || '').localeCompare(b.instructionRef || ''),
      render: (text: string, record: any) => (
        <a 
          className="lmn-text-link" 
          style={{ cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
          onClick={() => navigate(`/instructions/${record.instructionId}/edit`)}
        >
          {text}
        </a>
      ),
    },
    // 3. Source & Category Column
    {
      title: 'Source & Category',
      dataIndex: 'source',
      key: 'sourceCategory',
      render: (_: unknown, record: any) => {
        const src = record.instructionSource || record.source || '';
        const isEmail = src.toLowerCase().includes('email');
        return (
          <El style={{ fontSize: '12px', lineHeight: '14px' }}>
            <El className="lmn-d-flex lmn-align-items-center" style={{ fontWeight: 600 }}>
              {isEmail && <Icon type="envelope" style={{ fontSize: 13, marginRight: 4, color: '#002D72' }} />}
              {isEmail ? 'Email' : (src || '-')}
            </El>
            {isEmail && record.senderEmail && (
              <El style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{record.senderEmail}</El>
            )}
            <El style={{ color: '#666', marginTop: 2 }}>{record.category || '-'}</El>
          </El>
        );
      },
    },
    // 4. Client & GFC Column
    {
      title: 'Client & GFC',
      dataIndex: 'clientName',
      key: 'clientInfo',
      sorter: (a: any, b: any) => 
        (a.clientName || '').localeCompare(b.clientName || ''),
      render: (_: unknown, record: any) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El style={{ fontWeight: 600 }}>{record.clientName || '-'}</El>
          {record.buildingCode && (
            <El style={{ color: '#666', marginTop: 2 }}>{record.buildingCode}</El>
          )}
        </El>
      ),
    },
    // 5. Deal & Deal Key Column
    {
      title: 'Deal & Deal Key',
      dataIndex: 'dealName',
      key: 'dealInfo',
      render: (_: unknown, record: any) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El style={{ fontWeight: 600 }}>{record.dealName || '-'}</El>
          {record.dealKey && (
            <El style={{ color: '#666', marginTop: 2 }}>{record.dealKey}</El>
          )}
        </El>
      ),
    },
    // 6. Value Date Column (Single Line Horizon Fix)
    {
      title: 'Value Date',
      dataIndex: 'valueDate',
      key: 'valueDate',
      sorter: (a: any, b: any) => 
        (a.valueDate || '').localeCompare(b.valueDate || ''),
      render: (d: string) => d ? (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          <Icon type="calendar-dots" style={{ fontSize: 14, marginRight: 6, color: '#002D72' }} />
          {formatDate(d)}
        </El>
      ) : '-',
    },
    // 7. Due Date Column
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a: any, b: any) => 
        (a.dueDate || '').localeCompare(b.dueDate || ''),
      render: (d: string) => d ? (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          <Icon type="calendar-dots" style={{ fontSize: 14, marginRight: 6, color: '#002D72' }} />
          {formatDate(d)}
        </El>
      ) : '-',
    },
    // 8. Country Column
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      sorter: (a: any, b: any) => 
        (a.country || '').localeCompare(b.country || ''),
      render: (val: string) => val ? (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          <Icon type="location-pin" style={{ fontSize: 14, marginRight: 6, color: '#002D72' }} />
          {val}
        </El>
      ) : '-',
    },
    // 9. Assignee Column
    {
      title: 'Assignee',
      dataIndex: 'primaryAssignee',
      key: 'assignee',
      sorter: (a: any, b: any) => 
        (a.primaryAssignee || '').localeCompare(b.primaryAssignee || ''),
      render: (_: unknown, record: any) => (
        <El className="lmn-d-flex lmn-flex-column" style={{ gap: '4px', fontSize: '11px' }}>
          {record.primaryAssignee && (
            <El className="lmn-d-flex lmn-align-items-center">
              <El style={{ width: 22, height: 22, borderRadius: '50%', background: '#002D72', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginRight: 6, flexShrink: 0 }}>
                <Icon type="profile-o" />
              </El>
              <span style={{ fontWeight: 600 }}>{record.primaryAssignee}</span>
            </El>
          )}
          {record.backupAssignee && (
            <El className="lmn-d-flex lmn-align-items-center" style={{ marginTop: '4px' }}>
              <El style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', color: '#333', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginRight: 6, flexShrink: 0 }}>
                <Icon type="profile-o" />
              </El>
              <span style={{ color: '#666' }}>{record.backupAssignee}</span>
            </El>
          )}
        </El>
      ),
    },
    // 10. Status Column
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => 
        (a.status || '').localeCompare(b.status || ''),
      render: (s: string) => (
        <El style={{ fontSize: '12px', fontWeight: 600 }}>
          {s ? s.replace(/_/g, ' ') : '-'}
        </El>
      ),
    },
    // 11. Updated By Column
    {
      title: 'Updated By',
      dataIndex: 'modifiedBy',
      key: 'updatedBy',
      render: (_: unknown, record: any) => (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px' }}>
          <Icon type="user" style={{ fontSize: 14, marginRight: 4, color: '#666' }} />
          {record.modifiedBy || '-'}
        </El>
      ),
    },
    // 12. LAST COLUMN: Action Delete Buttons
    {
      title: 'Actions',
      dataIndex: 'instructionId',
      key: 'actions',
      width: 70,
      align: 'center',
      render: () => (
        <Button 
          color="link" 
          size="sm" 
          style={{ padding: 0, color: '#002D72', minWidth: 'auto' }}
          title="Delete Instruction"
        >
          <Icon type="trash" style={{ fontSize: '15px' }} />
        </Button>
      ),
    },
  ];

  <Table
            data={pagedOverdue.map(i => ({ ...i, key: i.instructionId }))}
            columns={overdueColumns}
            className="lmn-table-bordered"
            // Removed scroll={{ x: '100%' }} to drop the overflow wrapper constraints completely
            style={{ fontSize: 11 }}
          />


          /// PIE CHART FIXES


          // Here is the precise, complete fix for DashboardPage.tsx:

//Locate where your pie chart data splits are prepared (where sourceCounts and countryCounts are 
 // derived or tracked) and replace them with this reactive client-side counting layer:

 // 1. Unified Static Palette Map
const STABLE_CHART_COLORS: Record<string, string> = {
  'CITI_SFT': '#337ab7',       // Blue
  'SFT_POLLER': '#337ab7',     // Blue fallback
  'MANUAL': '#5cb85c',         // Green
  'EMAIL_POLLER': '#f0ad4e',   // Orange
  'Email': '#f0ad4e',          // Orange fallback
  'UNKNOWN': '#9b59b6'         // Purple
};

// 2. Compute source counts dynamically from the ALREADY FILTERED instructions list array
const dynamicSourceCounts = useMemo(() => {
  // Replace 'overdueInstructions' or 'filteredData' with whichever array holds your active dashboard table items
  const activeRecords = overdueInstructions || []; 
  
  return activeRecords.reduce((acc: Record<string, number>, item: any) => {
    const src = item.sourceCategory || item.source || 'UNKNOWN';
    // Normalize string tags to match your API keys cleanly
    let key = 'UNKNOWN';
    if (src.includes('SFT')) key = 'CITI_SFT';
    else if (src.includes('Manual') || src.includes('MANUAL')) key = 'MANUAL';
    else if (src.includes('Email') || src.includes('POLLER')) key = 'EMAIL_POLLER';
    
    // If a dropdown selection is active, filter out non-matching rows entirely
    if (sourceFilter && key !== sourceFilter) return acc;

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}, [overdueInstructions, sourceFilter]); // Re-computes whenever dropdown changes!

// 3. Update your sourceSlices to consume the dynamic counts
const sourceSlices = useMemo(() => {
  return Object.keys(dynamicSourceCounts).map((key) => {
    return {
      label: key,
      value: dynamicSourceCounts[key],
      color: STABLE_CHART_COLORS[key] || '#95a5a6' // Latches perfectly to the exact color key
    };
  });
}, [dynamicSourceCounts]);