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


