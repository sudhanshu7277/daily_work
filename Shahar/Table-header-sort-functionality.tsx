// ApprovalQueuePage.tsx.

// 1. State Tracking & Sort Arrow Renderer
// Add this state config and header text cell wrapper right above your const columns: any = [ statement:

const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });
  
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = null; // Unsorts completely on 3rd click loop
    }
    setSortConfig({ key: direction ? columnKey : '', direction });
  };
  
  // Render helper for the white/translucent sorting caret icons to match the dark blue header background
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
            style={{ color: isAsc ? '#ffffff' : 'rgba(255, 255, 255, 0.4)', marginBottom: '-2px' }} 
          />
          <Icon 
            type="caret-down" 
            style={{ color: isDesc ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }} 
          />
        </El>
      </El>
    );
  };

  // 2. Injecting onHeaderCell Hooks into Column Configurations
//Update your columns configuration list array to apply the header click trackers to every target index key. (Notice 
  //  how your default style block style: { backgroundColor: '#003DA5', color: '#ffffff' } is completely maintained):

  const columns: any = [
    {
      title: renderSortHeader('Sequence No.', 'instructionRef'),
      dataIndex: 'instructionRef',
      key: 'instructionRef',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('instructionRef'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (text: string, record: InstructionResponse) => (
        <a onClick={() => navigate(`/instructions/${record.instructionId}`)} className="lmn-text-link" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '12px' }}>
          {text}
        </a>
      ),
    },
    {
      title: renderSortHeader('Source & Category', 'source'),
      dataIndex: 'source',
      key: 'source',
      width: 140,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('source'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (source: string) => {
        if (!source) return '-';
        const parts = source.split(' - ');
        const label = parts[0];
        const value = parts.slice(1).join(' - ');
        return (
          <El style={{ fontSize: '12px', lineHeight: '14px' }}>
            <El className="lmn-d-flex lmn-flex-column">
              <span style={{ fontWeight: 700, color: '#000000' }}>{label}</span>
              <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{value}</span>
            </El>
          </El>
        );
      },
    },
    {
      title: renderSortHeader('Client, GFC & Country', 'clientName'),
      dataIndex: 'clientName',
      key: 'clientName',
      width: 165,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('clientName'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (name: string, record: InstructionResponse) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El className="lmn-d-flex lmn-flex-column">
            <span style={{ fontWeight: 700, color: '#000000' }}>{name || '-'}</span>
            {record.accountNumber && <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{record.accountNumber}</span>}
            {record.country && <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{record.country}</span>}
          </El>
        </El>
      ),
    },
    {
      title: renderSortHeader('Deal & Deal Key', 'dealName'),
      dataIndex: 'dealName',
      key: 'dealName',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('dealName'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (dealName: string, record: InstructionResponse) => {
        const subValue = record.instructionRef || record.dealName;
        return (
          <El style={{ fontSize: '12px', lineHeight: '14px' }}>
            <El className="lmn-d-flex lmn-flex-column">
              <span style={{ fontWeight: 700, color: '#000000' }}>{dealName || '-'}</span>
              {subValue && <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{subValue}</span>}
            </El>
          </El>
        );
      },
    },
    {
      title: renderSortHeader('Tickler Task Id', 'ticklerTaskId'),
      dataIndex: 'ticklerTaskId',
      key: 'ticklerTaskId',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('ticklerTaskId'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (ticklerTaskId: string) => (
        <El style={{ fontSize: 12 }}>{ticklerTaskId || '-'}</El>
      )
    },
    {
      title: renderSortHeader('Value Date', 'valueDate'),
      dataIndex: 'valueDate',
      key: 'valueDate',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('valueDate'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (d: string) => (
        <El style={{ fontSize: 12 }}>{d ? formatDate(d) : '-'}</El>
      )
    },
    {
      title: renderSortHeader('Due Date', 'dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('dueDate'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (d: string) => (
        <El className="lmn-d-flex lmn-align-items-center">
          <Icon type="calendar-dots" style={{ fontSize: 12, marginRight: 4, color: '#002D72' }} />
          <El style={{ fontSize: 12 }}>{d ? formatDate(d) : '-'}</El>
        </El>
      )
    },
    {
      title: renderSortHeader('Assignee', 'primaryAssignee'),
      dataIndex: 'primaryAssignee',
      key: 'primaryAssignee',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('primaryAssignee'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (assignee: string) => (
        <El style={{ fontSize: 12 }}>{assignee || '-'}</El>
      )
    },
    {
      title: renderSortHeader('Status', 'status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('status'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (status: any) => (
        <StatusTag status={status} />
      )
    },
    {
      title: renderSortHeader('Admin Maker', 'adminMaker'),
      dataIndex: 'adminMaker',
      key: 'adminMaker',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('adminMaker'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (adminMaker: string) => (
        <El style={{ fontSize: 12 }}>{adminMaker || '-'}</El>
      )
    },
    {
      title: renderSortHeader('Last Updated', 'lastUpdated'),
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 130,
      onHeaderCell: () => ({ 
        onClick: () => handleSort('lastUpdated'),
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (d: string) => (
        <El style={{ fontSize: 12 }}>{d ? formatDate(d) : '-'}</El>
      )
    }
  ];

  // 3. Data Sorting Pipeline
//Find line 334 in your code (right above where your current const tableData = 
  //  filteredData.map(...) statement resides) and add this memoized sorting logic to update your dataset:

  const sortedPipelineData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData || [];
  
    return [...filteredData].sort((a: any, b: any) => {
      const valueA = String(a[sortConfig.key] || '').toLowerCase();
      const valueB = String(b[sortConfig.key] || '').toLowerCase();
  
      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  // Update the final tableData assignment mapping:
  const tableData = sortedPipelineData.map((item) => ({ ...item, key: item.instructionId }));


  