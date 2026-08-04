const WHITESPACE_OR_HYPHEN = /[\s-]+/g;
const UNDERSCORE = /_/g;
const WORD_BOUNDARY = /\b\w/g;

const normalizeStatusCode = (value: string | null | undefined): string =>
  (value ?? '')
    .trim()
    .toUpperCase()
    .replace(WHITESPACE_OR_HYPHEN, '_');

const statusCodeToLabel = (code: string | null | undefined): string =>
  normalizeStatusCode(code)
    .toLowerCase()
    .replace(UNDERSCORE, ' ')
    .replace(WORD_BOUNDARY, (char) => char.toUpperCase());



    ////////


    const FILE_TYPE_MATCHERS: Array<{ type: FileType; patterns: string[] }> = [
        { type: 'pdf', patterns: ['pdf'] },
        { type: 'excel', patterns: ['spreadsheet', 'excel', 'ms-excel'] },
        { type: 'csv', patterns: ['csv'] },
      ];
      
      const resolveFileType = (contentType: string): FileType => {
        const match = FILE_TYPE_MATCHERS.find(({ patterns }) =>
          patterns.some((pattern) => contentType.includes(pattern))
        );
        return match?.type ?? 'other';
      };
      
      export async function getPaymentSourceFile(instructionId: number): Promise<PaymentSourceFile> {
        const response = await client.get<Blob>(
          `/instructions/${instructionId}/payment-details/source-file`,
          { responseType: 'blob' },
        );
      
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
        const contentType = String(response.headers['content-type'] ?? '');
        const buffer = await blob.arrayBuffer();
        const fileType = resolveFileType(contentType);
      
        return { url: URL.createObjectURL(blob), buffer, fileType, contentType };
      }



      // fixing useMemo currentIdx

      const findStageIdx = (stages: Stage[], key: string): number =>
        stages.findIndex((s) => s.statusKey === key);
      
      // Statuses that map directly onto a target stage when that stage exists.
      const STATUS_TO_STAGE_KEY: Record<string, string> = {
        PAYMENT_REWORK: 'PAYMENT_MAKER',
        ADMIN_PAYMENT_MAKER: 'PAYMENT_MAKER',
        PENDING_DUPLICATE: 'ADMIN_CHECKER',
        TO_BE_DELETED: 'ADMIN_CHECKER',
        SENT_TO_XCEPTOR_FOR_PROCESSING: 'ADMIN_CHECKER',
        XCEPTOR_PROCESSING_REQUEST_TIMEOUT: 'ADMIN_CHECKER',
        XCEPTOR_RETRY_REQUIRED: 'ADMIN_MAKER',
      };
      
      // PAYMENT_SUPER_CHECKER: fall back to Payment Checker, else last stage before
      // Complete, never Admin Maker (index 0).
      const resolvePaymentSuperChecker = (stages: Stage[]): number => {
        const pcIdx = findStageIdx(stages, 'PAYMENT_CHECKER');
        if (pcIdx >= 0) return pcIdx;
        const completeIdx = findStageIdx(stages, 'COMPLETE');
        return completeIdx > 0 ? completeIdx - 1 : stages.length - 1;
      };
      
      const currentIdx = useMemo(() => {
        const directIdx = findStageIdx(stages, status);
        if (directIdx >= 0) return directIdx;
      
        // DUPLICATE is terminal too, same landing spot as TERMINAL_STATUSES.
        if (TERMINAL_STATUSES.includes(status) || status === 'DUPLICATE') {
          return stages.length - 1;
        }
      
        if (status === 'PAYMENT_SUPER_CHECKER') {
          return resolvePaymentSuperChecker(stages);
        }
      
        const mappedKey = NAM_PAYMENT_MAKER_STATUSES.includes(status)
          ? 'PAYMENT_MAKER'
          : STATUS_TO_STAGE_KEY[status];
      
        if (mappedKey) {
          const idx = findStageIdx(stages, mappedKey);
          if (idx >= 0) return idx;
        }
      
        return 0;
      }, [stages, status]);


      // t — that's still nested. The actual minimal, Sonar-clean fix is a 2-line if/else assignment placed just above the return inside stages.map:

      <El className="lmn-d-flex lmn-align-items-start lmn-mt-8px" style={{ gap: 0, width: '100%', paddingLeft: 8, paddingRight: 8 }}>
  {stages.map((stage, idx) => {
    let stageLabelColor: string;
    if (idx === currentIdx) {
      stageLabelColor = (isDuplicate || isDeleted || isReviewRequired) ? '#D32F2F' : '#F57C00';
    } else {
      stageLabelColor = idx < currentIdx
        ? 'var(--lmn-color-primary, #002D72)'
        : 'var(--lmn-text-weak, #888)';
    }

    return (
      <El
        key={`label-${stage.statusKey}`}
        className="lmn-d-flex lmn-align-items-start"
        style={{ flex: idx < stages.length - 1 ? 1 : undefined, minWidth: 0 }}
      >
        <El style={{ width: 36, display: 'flex', justifyContent: 'center' }}>
          <El
            style={{
              fontSize: 13,
              fontWeight: idx === currentIdx ? 700 : 400,
              color: stageLabelColor,
              backgroundColor: '#F9F9FB',
              textAlign: 'center',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {renderWorkflowLabel(logicForStepsTitle(status, stage))}
          </El>
        </El>
        {idx < stages.length - 1 && <El style={{ flex: 1 }} />}
      </El>
    );
  })}
</El>


// Minimal fix — just drop the cast:

const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
if (!cancelled) { setWb(book); setRows(data); }



// no index for key

{rows.map((row, ri) => (
    <tr key={`${ri}-${row[0]}`}>
      {row.map((cell, ci) => {
        const isHeader = ri === 0;
        const Tag = isHeader ? 'th' : 'td';
        return (
          <Tag key={`${ri}-${ci}-${cell}`} style={{
            border: '1px solid #e0e0e0',
            padding: '4px 8px',
            background: isHeader ? '#00247D' : '#fff',
            color: isHeader ? '#fff' : '#333',
            fontWeight: isHeader ? 600 : 400,
            whiteSpace: 'nowrap',
          }}>{cell}</Tag>
        );
      })}
    </tr>
  ))}


  /// another fix

  for (const key of ALL_FIELD_KEYS) {
    const value = pd ? (pd as unknown as Record<string, unknown>)[key] : undefined;
    if (value == null) {
      form[key] = '';
    } else if (typeof value === 'object') {
      form[key] = JSON.stringify(value);
    } else {
      form[key] = String(value);
    }
  }


  function Section({ title, defaultOpen = true, children }: Readonly<{
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }>) {



    // div to button


    <button
  type="button"
  onClick={() => setOpen(o => !o)}
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: 600,
    background: open ? '#00247D' : '#00A3E0', // selected (open) = #00247D, collapsed (closed) = #00A3E0
    color: '#ffffff',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  }}
>
  <span>{title}</span>
  <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
</button>
  


