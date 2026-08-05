// Section function (lines 244–266) in VerifyPaymentDetailModal.tsx

function Section({
  title,
  defaultOpen = true,
  children,
}: Readonly<{ title: string; defaultOpen?: boolean; children: React.ReactNode }>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ border: '1px solid #00247D', borderRadius: 6, marginBottom: 8, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          cursor: 'pointer',
          userSelect: 'none',
          fontWeight: 600,
          background: open ? '#00247D' : '#00A3E0',
          color: '#ffffff',
          textAlign: 'left',
        }}
      >
        <span>{title}</span>
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>
          ▶
        </span>
      </button>
      {open && <div style={{ padding: 16, background: '#fff' }}>{children}</div>}
    </div>
  );
}