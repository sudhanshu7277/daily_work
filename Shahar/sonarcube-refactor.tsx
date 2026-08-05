//In VerifyPaymentDetailModal.tsx at line 33:

function SpreadsheetPreview({ url, fileType }: { url: string; fileType: string }) {


  //Updated Line 50:

  if (!cancelled) { setWb(book); setRows(data); }


  // VerifyPaymentDetailModal.tsx

  <tbody>
  {rows.map((row, ri) => (
    <tr key={`row-${ri}-${row[0] ?? ''}`}>
      {row.map((cell, ci) => {
        const isHeader = ri === 0;
        const Tag = isHeader ? 'th' : 'td';
        return (
          <Tag
            key={`cell-${ri}-${ci}`}
            style={{
              border: '1px solid #e0e0e0',
              padding: '4px 8px',
              background: isHeader ? '#00247D' : '#fff',
              color: isHeader ? '#fff' : '#333',
              fontWeight: isHeader ? 600 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {cell}
          </Tag>
        );
      })}
    </tr>
  ))}
</tbody>
