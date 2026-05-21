

const getResponsiveLabelStyle = (): any => {
    return {
      fontSize: '12px',
      fontWeight: 600,
      color: '#444444',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      lineHeight: '14px',
      textAlign: 'center'
    };
  };


  {/* 🌟 Parent Container: Full screen width, single row, no wrapping */}
  <El 
  className="lmn-d-flex" 
  style={{ 
    width: '100%', 
    gap: '8px', 
    flexWrap: 'nowrap', 
    marginBottom: '20px' 
  }}
>
  {PENDING_STATUSES.map(status => (
    /* 🌟 Flex 1 forces all 9 boxes to stretch and divide the screen width perfectly */
    <El key={status} style={{ flex: 1, minWidth: 0 }}>
      <Card
        layer={statusFilter === status ? 'primary' : undefined}
        className={statusFilter === status ? 'active-card' : 'lmn-border'}
        style={{ 
          cursor: 'pointer', 
          height: '70px', /* 🌟 Fixed, lower height for all boxes */
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={() => { setStatusFilter(status); setPage(0); }}
      >
        {/* 🌟 padding-bottom reduced to keep the short card compact */}
        <Card body style={{ padding: '8px 4px 4px 4px', height: '100%' }}>
          <El 
            className="lmn-d-flex lmn-flex-column lmn-justify-content-between lmn-align-items-center" 
            style={{ height: '100%' }}
          >
            
            {/* Text Label Layer */}
            <El style={getResponsiveLabelStyle()}>
              {STATUS_LABEL[status]}
            </El>

            {/* Number Counter Layer */}
            <El style={{ fontSize: '20px', fontWeight: 700, lineHeight: '20px' }}>
              {counts[status] || 0}
            </El>

          </El>
        </Card>
      </Card>
    </El>
  ))}
</El>