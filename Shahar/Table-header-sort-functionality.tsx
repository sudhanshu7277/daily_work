// 1. State Tracking and Sorter Component Setup
//Place this sorting control hook state and the caret header renderer function 
// right at the top of your main functional component inside DashboardPage.tsx:


const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });
  
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = null; // Unsorts completely on 3rd toggle loop
    }
    setSortConfig({ key: direction ? columnKey : '', direction });
  };
  
  // Render function for the Gray Interactive Carets
  const renderSortHeader = (title: string, columnKey: string) => {
    const isActive = sortConfig.key === columnKey;
    const isAsc = isActive && sortConfig.direction === 'asc';
    const isDesc = isActive && sortConfig.direction === 'desc';
  
    return (
      <El style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
        <span>{title}</span>
        <El style={{ display: 'inline-flex', flexDirection: 'column', fontSize: '8px', lineHeight: '1' }}>
          <Icon 
            type="caret-up" 
            style={{ color: isAsc ? '#003DA5' : '#888888', marginBottom: '-2px' }} 
          />
          <Icon 
            type="caret-down" 
            style={{ color: isDesc ? '#003DA5' : '#888888' }} 
          />
        </El>
      </El>
    );
  };


  // 2. Complete Fixed overdueColumns Configuration Array
// This implementation leaves your custom rendering layouts for columns like Source & Category, 
// Assignee, and Updated By completely intact, while adding renderSortHeader and onHeaderCell click handlers to every column.

const overdueColumns = [
    {
      title: renderSortHeader('Sequence No.', 'instructionRef'),
      dataIndex: 'instructionRef',
      key: 'ref',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('instructionRef') }),
      render: (text: string, record: InstructionResponse) => (
        <a 
          className="lmn-text-link" 
          style={{ cursor: 'pointer', fontSize: '12px' }}
          onClick={() => navigate(`/instructions/${record.instructionId}`)}
        >
          {text}
        </a>
      ),
    },
    {
      title: renderSortHeader('Source & Category', 'source'),
      key: 'sourceCategory',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('source') }),
      render: (_: unknown, record: InstructionResponse) => {
        const src = record.instructionSource || record.source || '';
        const isEmail = src.toLowerCase().includes('email');
        return (
          <El>
            <El className="lmn-d-flex lmn-align-items-center" style={{ fontWeight: 600, fontSize: '12px' }}>
              {isEmail && <Icon type="envelope" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />}
              {isEmail ? 'Email' : (src || '-')}
            </El>
            {isEmail && record.senderEmail && (
              <El style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>{record.senderEmail}</El>
            )}
            <El style={{ color: '#666', marginTop: 2, fontSize: '12px' }}>{record.category || '-'}</El>
          </El>
        );
      },
    },
    {
      title: renderSortHeader('Client & GFC', 'clientName'),
      key: 'clientInfo',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('clientName') }),
      render: (_: unknown, record: InstructionResponse) => (
        <El>
          <El style={{ fontWeight: 600, fontSize: '12px' }}>{record.clientName || '-'}</El>
          <El style={{ color: '#666', fontSize: '12px' }}>{record.buildingCode || '-'}</El>
        </El>
      ),
    },
    {
      title: renderSortHeader('Value Date', 'valueDate'),
      dataIndex: 'valueDate',
      key: 'valueDate',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('valueDate') }),
      render: (d: string) => d ? (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px' }}>
          <Icon type="calendar-dots" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />
          {formatDate(d)}
        </El>
      ) : '-',
    },
    {
      title: renderSortHeader('Due Date', 'dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('dueDate') }),
      render: (d: string) => d ? (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px' }}>
          <Icon type="calendar-dots" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />
          {formatDate(d)}
        </El>
      ) : '-',
    },
    {
      title: renderSortHeader('Country', 'country'),
      dataIndex: 'country',
      key: 'country',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('country') }),
      render: (val: string) => (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px' }}>
          <Icon type="location-pin" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />
          {val || '-'}
        </El>
      ),
    },
    {
      title: renderSortHeader('Assignee', 'primaryAssignee'),
      key: 'assignee',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('primaryAssignee') }),
      render: (_: unknown, record: InstructionResponse) => (
        <El>
          <El className="lmn-d-flex lmn-align-items-center" style={{ marginBottom: '4px' }}>
            <El style={{ width: 22, height: 22, borderRadius: '50%', background: '#002D72', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 6, flexShrink: 0 }}>
              <Icon type="profile-o" style={{ fontSize: '12px' }} />
            </El>
            <span style={{ fontSize: '12px' }}>{record.primaryAssignee || '-'}</span>
            </El>
          <El className="lmn-d-flex lmn-align-items-center">
            <El style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', color: '#333', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 6, flexShrink: 0 }}>
              <Icon type="profile-o" style={{ fontSize: '12px' }} />
            </El>
            <span style={{ fontSize: '12px' }}>{record.backupAssignee || '-'}</span>
          </El>
        </El>
      ),
    },
    {
      title: renderSortHeader('Status', 'status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('status') }),
      render: (s: string) => (
        <El style={{ fontSize: '12px' }}>{s ? s.replace(/_/g, ' ') : '-'}</El>
      ),
    },
    {
      title: renderSortHeader('Updated By', 'modifiedBy'),
      key: 'updatedBy',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('modifiedBy') }),
      render: (_: unknown, record: InstructionResponse) => (
        <El className="lmn-d-flex lmn-align-items-center">
          <El style={{ width: 22, height: 22, borderRadius: '50%', background: '#002D72', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 6, flexShrink: 0 }}>
            <Icon type="profile-o" style={{ fontSize: '12px' }} />
          </El>
          <span style={{ fontSize: '12px' }}>{record.modifiedBy || '-'}</span>
        </El>
      ),
    }
  ];

  // 3. Array Dataset Sorping Mechanism Add-on
//Locate the table renderer row block where <Table data={pagedOverdue} ... /> or <Table data={filteredOverdue} ... /> 
//is bound (visible around Image 272). Wrap that source array with this sorted sorting hook operation:

const sortedOverdueDataset = useMemo(() => {
    // If no column is active, return the existing base dashboard array
    if (!sortConfig.key || !sortConfig.direction) return pagedOverdue || [];
  
    return [...pagedOverdue].sort((a: any, b: any) => {
      const valueA = String(a[sortConfig.key] || '').toLowerCase();
      const valueB = String(b[sortConfig.key] || '').toLowerCase();
  
      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [pagedOverdue, sortConfig]);

  // Finally, go down to your JSX block and pass the clean sorted values directly to the native element:

  <Table 
  data={sortedOverdueDataset} 
  columns={overdueColumns} 
  className="lmn-table-bordered"
  scroll={{ x: '100%' }}
  style={{ fontSize: 12 }}
/>
