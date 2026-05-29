// 1. Core State Hooks & Caret Renderer
// Add this state config block and the dark 
//blue-optimized caret text renderer utility at the top of your InstructionListPage functional component:

const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });
  
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = null; // Unsets sort logic cleanly on the 3rd iteration click
    }
    setSortConfig({ key: direction ? columnKey : '', direction });
  };
  
  // Render helper for White/Translucent arrow buttons on the blue background header bar container
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

  //2. Complete Updated columns Array Block
// Replace your current const columns: any = [ configurations block array completely with this implementation. Notice how it 
    //maps exactly to your code's real property evaluations like record.instructionSource and fallback elements:

    const columns: any = [
        {
          title: renderSortHeader('Sequence No.', 'instructionRef'),
          dataIndex: 'instructionRef',
          key: 'instructionRef',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('instructionRef') }),
          render: (text: string, record: any) => (
            <a 
              className="lmn-text-link" 
              style={{ cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
              onClick={() => navigate(`/instructions/${record.instructionId}`)}
            >
              {text}
            </a>
          ),
        },
        {
          title: renderSortHeader('Source & Category', 'source'),
          dataIndex: 'source',
          key: 'source',
          width: 140,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('source') }),
          render: (_: string, record: any) => {
            const src = record.instructionSource || record.source || '';
            const isEmail = src.toLowerCase().includes('email');
            return (
              <El style={{ fontSize: '12px', lineHeight: '14px' }}>
                <El className="lmn-d-flex lmn-align-items-center" style={{ fontWeight: 600 }}>
                  {isEmail && <Icon type="envelope" style={{ fontSize: 13, marginRight: 4, color: '#002D72' }} />}
                  {isEmail ? 'Email' : src}
                </El>
                {isEmail && record.senderEmail && (
                  <El style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{record.senderEmail}</El>
                )}
                <El style={{ color: '#666', marginTop: 2 }}>{record.category || record.paymentMethod || '-'}</El>
              </El>
            );
          },
        },
        {
          title: renderSortHeader('Client & GFC', 'client'),
          dataIndex: 'client',
          key: 'client',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('client') }),
          render: (_: unknown, record: any) => (
            <El style={{ fontSize: '12px', lineHeight: '14px' }}>
              <El style={{ fontWeight: 600 }}>{record.clientName || '-'}</El>
              {record.accountNumber && (
                <El style={{ color: '#666', marginTop: 2 }}>{record.accountNumber}</El>
              )}
            </El>
          ),
        },
        {
          title: renderSortHeader('Deal & Deal Key', 'deal'),
          key: 'deal',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('deal') }),
          render: (_: unknown, record: any) => (
            <El style={{ fontSize: '12px', lineHeight: '14px' }}>
              <El style={{ fontWeight: 600 }}>{record.dealName || '-'}</El>
              {record.buildingCode && (
                <El style={{ color: '#666', marginTop: 2 }}>{record.buildingCode}</El>
              )}
            </El>
          ),
        },
        {
          title: renderSortHeader('Value Date', 'valueDate'),
          dataIndex: 'valueDate',
          key: 'valueDate',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('valueDate') }),
          render: (d: string) => d ? (
            <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
              <Icon type="calendar-dots" style={{ fontSize: 13, marginRight: 4, color: '#002D72' }} />
              {formatDate(d)}
            </El>
          ) : '-',
        },
        {
          title: renderSortHeader('Due Date', 'dueDate'),
          dataIndex: 'dueDate',
          key: 'dueDate',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('dueDate') }),
          render: (d: string) => {
            if (!d) return '-';
            const due = new Date(d);
            const now = new Date();
            const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <El style={{ fontSize: '12px', lineHeight: '14px' }}>
                <El className="lmn-d-flex lmn-align-items-center" style={{ whiteSpace: 'nowrap' }}>
                  <Icon type="calendar-dots" style={{ fontSize: 13, marginRight: 4, color: '#002D72' }} />
                  {formatDate(d)}
                </El>
                {diffDays < 0 && (
                  <El className="lmn-text-danger" style={{ fontSize: 11, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap' }}>
                    Days Left: {diffDays}
                  </El>
                )}
              </El>
            );
          },
        },
        {
          title: renderSortHeader('Country', 'region'),
          dataIndex: 'region',
          key: 'country',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('region') }),
          render: (_region: string, record: any) => {
            const country = record.country || '';
            return country ? (
              <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                <Icon type="location-pin" style={{ fontSize: 13, marginRight: 4, color: '#002D72' }} />
                {country}
              </El>
            ) : '-';
          },
        },
        {
          title: renderSortHeader('Assignee', 'createdBy'),
          dataIndex: 'createdBy',
          key: 'assignee',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('createdBy') }),
          render: (_user: string, record: any) => {
            const user = record.primaryAssignee || record.backupAssignee || '-';
            return (
              <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                <Icon type="contact-o" className="lmn-mr-4px" style={{ fontSize: 12 }} />
                {user}
              </El>
            );
          },
        },
        {
          title: renderSortHeader('Status', 'status'),
          dataIndex: 'status',
          key: 'status',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('status') }),
          render: (status: any) => <StatusTag status={status} />,
        },
        {
          title: renderSortHeader('Last Updated', 'modifiedOn'),
          dataIndex: 'modifiedOn',
          key: 'lastUpdated',
          width: 130,
          onHeaderCell: () => ({ className: 'table-header', onClick: () => handleSort('modifiedOn') }),
          render: (_: string, record: any) => {
            const updatedBy = record.modifiedBy || record.createdBy || 'SYSTEM';
            const updatedOn = record.modifiedOn || record.createdOn;
            return (
              <El style={{ fontSize: '12px', lineHeight: '14px' }}>
                <El className="lmn-d-flex lmn-align-items-center" style={{ whiteSpace: 'nowrap' }}>
                  <Icon type="contact-o" className="lmn-mr-4px" style={{ fontSize: 12 }} />
                  {updatedBy}
                </El>
                {updatedOn && (
                  <El className="lmn-text-weak" style={{ fontSize: 11, marginTop: 2, whiteSpace: 'nowrap' }}>
                    <Icon type="calendar-check" className="lmn-mr-4px" style={{ fontSize: 11 }} />
                    {formatDate(updatedOn)}
                  </El>
                )}
              </El>
            );
          },
        }
      ];


      // 3. Apply the Sorting Pipeline Calculations
//Find the data binding wrapper inside your component body layout frame where your final output array gets 
//mapped over to generate table rows (usually look for where data={instructions} or data={pagedData} is mapped):


// Add this memoized engine block directly above your table data assembly line
const sortedInstructionsPipeline = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return dataContentArray || []; // Replace with your real internal data variable hook name
  
    return [...dataContentArray].sort((a: any, b: any) => {
      const valueA = String(a[sortConfig.key] || '').toLowerCase();
      const valueB = String(b[sortConfig.key] || '').toLowerCase();
  
      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dataContentArray, sortConfig]);

  // Finally, bind sortedInstructionsPipeline directly to your view's table input attribute wrapper:

  <Table 
  data={sortedInstructionsPipeline} 
  columns={columns} 
  className="lmn-table-bordered"
/>