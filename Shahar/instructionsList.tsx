const columns = [
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
      key: 'instructionRef',
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
    // 3. Source & Category Column
    {
      title: 'Source & Category',
      dataIndex: 'source',
      key: 'source',
      render: (_: string, record: any) => {
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
            <El style={{ color: '#666', marginTop: 2 }}>{record.category || record.paymentMethod || '-'}</El>
          </El>
        );
      },
    },
    // 4. Client & GFC Column
    {
      title: 'Client & GFC',
      dataIndex: 'client',
      key: 'client',
      render: (_: unknown, record: any) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El style={{ fontWeight: 600 }}>{record.clientName || '-'}</El>
          {record.accountNumber && (
            <El style={{ color: '#666', marginTop: 2 }}>{record.accountNumber}</El>
          )}
        </El>
      ),
    },
    // 5. Deal & Deal Key Column
    {
      title: 'Deal & Deal Key',
      dataIndex: 'deal',
      key: 'deal',
      render: (_: unknown, record: any) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El style={{ fontWeight: 600 }}>{record.dealName || '-'}</El>
          {record.buildingCode && (
            <El style={{ color: '#666', marginTop: 2 }}>{record.buildingCode}</El>
          )}
        </El>
      ),
    },
    // 6. Value Date Column (Forced Single-Line Baseline Horizon Fix)
    {
      title: 'Value Date',
      dataIndex: 'valueDate',
      key: 'valueDate',
      render: (d: string) => d ? (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          <Icon type="calendar-dots" style={{ fontSize: 13, marginRight: 4, color: '#002D72' }} />
          {formatDate(d)}
        </El>
      ) : '-',
    },
    // 7. Due Date Column (With Dynamic SLA Days Left Checker)
    {
      title: 'Due Date',
      dataIndex: 'valueDate',
      key: 'dueDate',
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
    // 8. Country Column
    {
      title: 'Country',
      dataIndex: 'region',
      key: 'country',
      render: (_region: string, record: any) => {
        const country = record.country || _region;
        return country ? (
          <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
            <Icon type="location-pin" style={{ fontSize: 13, marginRight: 4, color: '#002D72' }} />
            {country}
          </El>
        ) : '-';
      },
    },
    // 9. Assignee Column
    {
      title: 'Assignee',
      dataIndex: 'createdBy',
      key: 'assignee',
      render: (user: string) => user ? (
        <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          <Icon type="contact-o" className="lmn-mr-4px" style={{ fontSize: 12 }} />
          {user}
        </El>
      ) : '-',
    },
    // 10. Status Column
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => <StatusTag status={status} />,
    },
    // 11. Last Updated Column
    {
      title: 'Last Updated',
      dataIndex: 'modifiedOn',
      key: 'lastUpdated',
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
              <El className="lmn-d-flex lmn-align-items-center lmn-text-weak" style={{ fontSize: 11, marginTop: 2, whiteSpace: 'nowrap' }}>
                <Icon type="calendar-check" className="lmn-mr-4px" style={{ fontSize: 11 }} />
                {formatDate(updatedOn)}
              </El>
            )}
          </El>
        );
      },
    },
    // 12. LAST COLUMN: High-Visibility Blue Trash Icon
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

  /* Update both Table components in the file to look like this: */
<Table
  data={tableData}
  columns={columns}
  className="lmn-table-bordered"
  // 🌟 REMOVED: scroll={{ x: 1400 }}
  style={{ fontSize: 11 }}
/>


// 1. Place this tracking helper function at the top of your ApprovalQueuePage component function
const getResponsiveLabelStyle = (): React.CSSProperties => {
    return {
      fontSize: 12,
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      lineHeight: '13px',
      display: 'block'
    };
  };

  // 2. Map the style attribute reference function cleanly inside your rendering DOM tree loop
  <Card body>
    <El className="lmn-text-center">
      <El style={getResponsiveLabelStyle()}>
        {STATUS_LABEL[status]}
      </El>
      <El style={{ fontSize: 24, fontWeight: 700 }}>
        {counts[status] || 0}
      </El>
    </El>
  </Card>


const getResponsiveLabelStyle = (status: any): any => {
    console.log('getResponsiveLabelStyle status values ', status);

    // Grouping your current targets cleanly into a single unified condition check
    if (
      status === 'Admin Maker' ||
      status === 'Admin Checker' ||
      status === 'Payment Maker' ||
      status === 'Payment Checker' ||
      status === 'Super Checker' ||
      status === 'Signature' ||
      status === 'Callback' ||
      status === 'Completed' ||
      status === 'Deleted' ||
      status === 'Duplicate'
    ) {
      return {
        fontSize: 12,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        lineHeight: '13px',
        display: 'block'
      };
    }

    // Default return fallback safety mesh
    return { fontSize: 12, display: 'block' };
  };