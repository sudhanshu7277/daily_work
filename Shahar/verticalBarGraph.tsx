{/* /* Summary Cards */ */}
<El className="lmn-row lmn-mb-16px">
  <El className="lmn-col-2">
    <Card
      layer={statusFilter === '' ? 'primary' : undefined}
      // Toggles the .active-card CSS class if no status filter is selected (initial landing state)
      className={statusFilter === '' ? 'active-card' : 'lmn-border'}
      style={{ cursor: 'pointer' }}
      onClick={() => { setStatusFilter(''); setPage(0); }}
    >
      <Card body>
        <El className="lmn-text-center">
          <El style={{ fontSize: 12 }}>All Pending</El>
          <El style={{ fontSize: 24, fontWeight: 700 }}>{totalPending}</El>
        </El>
      </Card>
    </Card>
  </El>

  {PENDING_STATUSES.map(status => (
    <El className="lmn-col-2" key={status}>
      <Card
        layer={statusFilter === status ? 'primary' : undefined}
        // Toggles the .active-card CSS class when clicked and active
        className={statusFilter === status ? 'active-card' : 'lmn-border'}
        style={{ cursor: 'pointer' }}
        onClick={() => { setStatusFilter(status); setPage(0); }}
      >
        <Card body>
          <El className="lmn-text-center">
            <El style={{ fontSize: 12 }}>{STATUS_LABEL[status]}</El>
            <El style={{ fontSize: 24, fontWeight: 700 }}>{counts[status] || 0}</El>
          </El>
        </Card>
      </Card>
    </El>
  ))}
</El>


.active-card {
    /* 1. Use outline instead of border to break through component wrapper nesting */
    outline: 2px solid #002D72 !important;
    outline-offset: -1px; /* Subtle inward inset so it sits exactly on the component edge */
    
    /* 2. Give it a distinct corporate selection background tint */
    background-color: rgba(0, 45, 114, 0.08) !important; 
    
    /* 3. Deepen the shadow so the active state clearly stands out from neutral cards */
    box-shadow: 0 6px 16px rgba(0, 45, 114, 0.18) !important;
    
    /* 4. Keep smooth state transitions intact */
    transition: all 0.2s ease-in-out;
}