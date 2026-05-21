


<Card
  layer={!statusFilter ? 'primary' : undefined}
  // INJECT THIS LINE: Applies the CSS rules when statusFilter is empty ('')
  className={!statusFilter ? 'lmn-bg-primary-light active-card' : 'lmn-border'}
  style={{ 
    cursor: 'pointer', 
    border: statusFilter === '' ? '2px solid #002D72' : '1px solid #ccc' 
  }}
  onClick={() => { setStatusFilter(''); setPage(0); }}
></Card>

.active-card {
    background-color: rgba(0, 45, 114, 0.08) !important;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12) !important;
    transition: all 0.2s ease-in-out;
    /* Removed the competing CSS border property to let the JSX style rule take control */
}