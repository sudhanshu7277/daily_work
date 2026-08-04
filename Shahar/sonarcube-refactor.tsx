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

      {stages.map((stage, idx) => {
        let stageLabelColor: string;
        if (idx === currentIdx) {
          stageLabelColor = (isDuplicate || isDeleted || isReviewRequired) ? '#D32F2F' : '#F57C00';
        } else {
          stageLabelColor = idx < currentIdx ? 'var(--lmn-color-primary, #002D72)' : 'var(--lmn-text-weak, #888)';
        }
      
        return (
          <El key={`label-${stage.statusKey}`} ...>
            ...
            <El style={{
              fontSize: 13,
              fontWeight: idx === currentIdx ? 700 : 400,
              color: stageLabelColor,
              backgroundColor: '#F9F9FB',
              textAlign: 'center',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}>
              {renderWorkflowLabel(logicForStepsTitle(status, stage))}
            </El>
          </El>
        );
      })}


