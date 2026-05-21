const overdueColumns = [
    // 1. FIRST COLUMN: Structured Checkboxes (Added safe dataIndex string fallback)
    {
      title: <input type="checkbox" style={{ cursor: 'pointer', transform: 'scale(1.1)' }} />,
      dataIndex: 'instructionId',
      key: 'selection',
      width: 50,
      align: 'center',
      render: (_: unknown, record: InstructionResponse) => (
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
      sorter: (a: InstructionResponse, b: InstructionResponse) => 
        (a.instructionRef || '').localeCompare(b.instructionRef || ''),
      render: (text: string, record: InstructionResponse) => (
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
      dataIndex: 'source', // Added backing dataIndex fallback wrapper
      key: 'sourceCategory',
      render: (_: unknown, record: InstructionResponse) => {
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
      dataIndex: 'clientName', // Added fallback backing mapping token
      key: 'clientInfo',
      sorter: (a: InstructionResponse, b: InstructionResponse) => 
        (a.clientName || '').localeCompare(b.clientName || ''),
      render: (_: unknown, record: InstructionResponse) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El style={{ fontWeight: 600 }}>{record.clientName || '-'}</El>
          {record.buildingCode && (
            <El style={{ color: '#666', marginTop: 2 }}>{record.buildingCode}</El>
          )}
        </El>
      ),
    },
    // 5. Deal & Deal Key Column (With Inline Type Fix)
    {
      title: 'Deal & Deal Key',
      dataIndex: 'dealName', // Added explicit backup token parameter field mapping
      key: 'dealInfo',
      render: (_: unknown, record: InstructionResponse & { dealKey?: string }) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El style={{ fontWeight: 600 }}>{record.dealName || '-'}</El>
          {record.dealKey && (
            <El style={{ color: '#666', marginTop: 2 }}>{record.dealKey}</El>
          )}
        </El>
      ),
    },
    // 6. Value Date Column 
    {
      title: 'Value Date',
      dataIndex: 'valueDate',
      key: 'valueDate',
      sorter: (a: InstructionResponse, b: InstructionResponse) => 
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
      sorter: (a: InstructionResponse, b: InstructionResponse) => 
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
      sorter: (a: InstructionResponse, b: InstructionResponse) => 
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
      dataIndex: 'primaryAssignee', // Added dynamic fallback property signature
      key: 'assignee',
      sorter: (a: InstructionResponse, b: InstructionResponse) => 
        (a.primaryAssignee || '').localeCompare(b.primaryAssignee || ''),
      render: (_: unknown, record: InstructionResponse) => (
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
              </</El>
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
      sorter: (a: InstructionResponse, b: InstructionResponse) => 
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
      dataIndex: 'modifiedBy', // Explicitly connected backing parameter key 
      key: 'updatedBy',
      render: (_: unknown, record: InstructionResponse) => (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px' }}>
          <Icon type="user" style={{ fontSize: 14, marginRight: 4, color: '#666' }} />
          {record.modifiedBy || '-'}
        </El>
      ),
    },
    // 12. LAST COLUMN: Blue Action Delete Buttons
    {
      title: 'Actions',
      dataIndex: 'instructionId', // Safe backing key string hook
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