<Card
  layer={statusFilter === '' ? 'primary' : 'default'} // Forces an explicit active vs non-active layer variant
  className={statusFilter === '' ? 'lmn-bg-primary-light active-card' : 'lmn-border'} // Injects an active highlight helper class
  style={{ cursor: 'pointer', border: statusFilter === '' ? '2px solid #002D72' : '1px solid #ccc' }}
  onClick={() => { setStatusFilter(''); setPage(0); }}
></Card>

<PENDING_STATUSES.map(status => (
    <El className="lmn-col-2" key={status}>
      <Card
        layer={statusFilter === status ? 'primary' : 'default'}
        className={statusFilter === status ? 'lmn-bg-primary-light active-card' : 'lmn-border'}
        style={{ 
          cursor: 'pointer', 
          border: statusFilter === status ? '2px solid #002D72' : '1px solid #ccc' 
        }}
        onClick={() => { setStatusFilter(status); setPage(0); }}
      >

/* Add this to your dashboard CSS to make the selection pop visually */
.active-card {
    background-color: rgba(0, 45, 114, 0.08) !important; /* Soft tint matching corporate brand blue */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
    transition: all 0.2s ease-in-out;
}