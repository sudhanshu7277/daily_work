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
    background-color: rgba(0, 45, 114, 0.06) !important; /* Soft corporate blue background tint */
    border: 2px solid #002D72 !important;              /* Solid active blue border line */
    box-shadow: 0 4px 12px rgba(0, 45, 114, 0.15) !important; /* Elegant matching brand shadow */
    transform: translateY(-1px);                       /* Extremely subtle lift to show interactive selection */
    transition: all 0.2s ease-in-out;
}