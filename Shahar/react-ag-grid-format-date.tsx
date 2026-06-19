headerName: 'Due Date',
field: 'dueDate',
minWidth: 130,
sortable: true,
filter: true,
cellRenderer: (p: ICellRendererParams<InstructionResponse>) => p.value ? (
  <El style={{ fontSize: '12px', lineHeight: '14px', paddingTop: '4px' }}>
    {/* Base Calendar Row Layout */}
    <El className="lmn-d-flex lmn-align-items-center" style={{ fontSize: '12px' }}>
      <Icon type="calendar-dots" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />
      {formatDate(p.value as string)}
    </El>

    {/* 🚀 Dynamic Overdue Calculation Block */}
    {(() => {
      const incomingDate = new Date(p.value as string);
      const today = new Date();

      // Clear timestamps to achieve strict calendar-day metrics comparisons
      incomingDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = incomingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Render red metrics message sub-labels exclusively for past-due parameters
      if (diffDays < 0) {
        return (
          <El className="lmn-text-danger" style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: '#d9534f', whiteSpace: 'nowrap' }}>
            Days Left: {diffDays}
          </El>
        );
      }
      return null;
    })()}
  </El>
) : '-'