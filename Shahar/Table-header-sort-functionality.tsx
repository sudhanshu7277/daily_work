const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });
  
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = null; // Reset sorting configuration on 3rd click
    }
    setSortConfig({ key: direction ? columnKey : '', direction });
  };

  //2. Header Icon Component (Up and Down Grey Arrows)

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

  // 3. Update the Columns Definition Array

  const columns: any = [
    {
      title: renderSortHeader('Sequence No.', 'instructionRef'),
      dataIndex: 'instructionRef',
      key: 'instructionRef',
      width: 130,
      onHeaderCell: () => ({ onClick: () => handleSort('instructionRef') }),
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
      onHeaderCell: () => ({ onClick: () => handleSort('source') }),
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
      onHeaderCell: () => ({ onClick: () => handleSort('clientName') }),
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
      onHeaderCell: () => ({ onClick: () => handleSort('dealName') }),
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
  ];

  // 4. Inject Sorting Calculations mapping into data collection

  const sortedTableData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
  
    return [...filteredData].sort((a: any, b: any) => {
      const valueA = String(a[sortConfig.key] || '').toLowerCase();
      const valueB = String(b[sortConfig.key] || '').toLowerCase();
  
      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  // Replace your tableData variable maps line reference cleanly:
  const tableData = sortedTableData.map((item) => ({ ...item, key: item.instructionId }));

  