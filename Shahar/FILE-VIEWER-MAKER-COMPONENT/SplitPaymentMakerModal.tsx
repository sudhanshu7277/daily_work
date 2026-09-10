import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, El, Loading, Icon, Input, Button, Dropdown } from '@citi-icg-172888/icgds-react';
import * as XLSX from 'xlsx';

import NativePdfViewer from '../documentViewer/NativePdfViewer';
import type { CapturedField } from '../../types/documentViewer';
import { getPaymentSourceFile, getPaymentCoordinates } from '../../api/paymentDetails';
import { getDocumentPreviewBlob } from '../../api/documents';
import type { PaymentSourceFile, FieldCoordinate } from '../../api/paymentDetails';
import type { Pain001Model } from '@citi-icg-179025/payment-flow-reactjs-ui-lib';

import { PaymentParent } from '../../pages/ss-payment/PaymentParent';

// =========================================================
// SPREADSHEET (EXCEL/CSV) PREVIEW ENGINE
// =========================================================

const PAYMENT_TABLE_HEADER_GROUPS: string[][] = [
  ['value date', 'value dt', 'valuedate'],
  ['debit account number', 'debit account no', 'debit account', 'debit a/c number', 'debit acct number'],
  ['amount', 'movement amount', 'payment amount'],
  ['payment currency', 'currency'],
  ['beneficiary'],
];

const normalizeHeaderCell = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  return '';
};

const rowMatchesHeaderAlias = (rowCells: string[], aliases: string[]): boolean => {
  const normalizedAliases = aliases.map(normalizeHeaderCell);
  return rowCells.some((cell) =>
    normalizedAliases.some((alias) => cell.includes(alias) || alias.includes(cell))
  );
};

export function findPaymentHeaderRowIndex(rows: string[][]): number {
  if (rows.length === 0) return 0;
  let bestIndex = 0;
  let bestScore = -1;

  rows.forEach((row, index) => {
    const normalizedCells = row.map((cell) => normalizeHeaderCell(cell)).filter((cell) => cell.length > 0);
    if (normalizedCells.length === 0) return;

    const matchedGroups = PAYMENT_TABLE_HEADER_GROUPS.map((aliases) =>
      rowMatchesHeaderAlias(normalizedCells, aliases)
    );
    const score = matchedGroups.filter(Boolean).length;

    const hasDebitAccount = matchedGroups[1];
    const hasAmount = matchedGroups[2];
    const isLikelyPaymentHeader = hasAmount && (hasDebitAccount || matchedGroups[0]);
    if (!isLikelyPaymentHeader) return;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 2 ? bestIndex : 0;
}

const normalizeAmountForCompare = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    return '';
  }

  let normalized = String(value).trim();
  if (!normalized) return '';

  normalized = normalized.replace(/,/g, '');
  if (normalized.startsWith('(') && normalized.endsWith(')')) {
    normalized = `-${normalized.slice(1, -1)}`;
  }
  normalized = normalized.replace(/[^0-9.-]/g, '');

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return '';
  return parsed.toFixed(2);
};

const formatDateIso = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatExcelDateSerial = (value: unknown): string | null => {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDateIso(value);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoLike = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoLike) {
      return `${isoLike[1]}-${isoLike[2].padStart(2, '0')}-${isoLike[3].padStart(2, '0')}`;
    }

    const usLike = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usLike) {
      const mm = usLike[1].padStart(2, '0');
      const dd = usLike[2].padStart(2, '0');
      return `${usLike[3]}-${mm}-${dd}`;
    }

    const parsedDate = new Date(trimmed);
    if (!Number.isNaN(parsedDate.getTime())) return formatDateIso(parsedDate);
  }

  const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : NaN;
  if (!Number.isFinite(numeric)) return null;
  const parsed = XLSX.SSF.parse_date_code(numeric);
  if (!parsed) return null;

  const parsedDate = new Date(parsed.y, parsed.m - 1, parsed.d);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return formatDateIso(parsedDate);
};

interface SpreadsheetPreviewProps {
  url: string;
  buffer: ArrayBuffer;
  fileType: string;
  movementAmount?: string;
}

const SpreadsheetPreview: FC<SpreadsheetPreviewProps> = ({ buffer, fileType, movementAmount }) => {
  const [wb, setWb] = useState<XLSX.WorkBook | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const isExcel = ['xlsx', 'xls', 'excel'].includes(fileType);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    try {
      const book = XLSX.read(buffer, { type: 'array' });
      if (!cancelled) {
        setWb(book);
        setActiveSheet(book.SheetNames[0] ?? '');
      }
    } catch (e) {
      if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to parse spreadsheet');
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [buffer]);

  const rows = useMemo<string[][]>(() => {
    if (!wb || !activeSheet) return [];
    const ws = wb.Sheets[activeSheet];
    if (!ws) return [];
    return XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '', raw: false }) as string[][];
  }, [wb, activeSheet]);

  const nonEmptyRows = useMemo<string[][]>(() => {
    return rows.filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));
  }, [rows]);

  const nonEmptyColumnIndexes = useMemo<number[]>(() => {
    if (nonEmptyRows.length === 0) return [];
    const maxColumns = Math.max(...nonEmptyRows.map((row) => row.length));
    const indexes: number[] = [];
    for (let ci = 0; ci < maxColumns; ci += 1) {
      const hasAnyValue = nonEmptyRows.some((row) => String(row[ci] ?? '').trim() !== '');
      if (hasAnyValue) indexes.push(ci);
    }
    return indexes;
  }, [nonEmptyRows]);

  const cleanedRows = useMemo<string[][]>(() => {
    return nonEmptyRows.map((row) =>
      nonEmptyColumnIndexes.map((ci) => String(row[ci] ?? ''))
    );
  }, [nonEmptyRows, nonEmptyColumnIndexes]);

  const headerRowIndex = useMemo(() => findPaymentHeaderRowIndex(cleanedRows), [cleanedRows]);

  const valueDateColumnIndex = useMemo(() => {
    if (cleanedRows.length === 0 || headerRowIndex >= cleanedRows.length) return -1;
    const headerRow = cleanedRows[headerRowIndex] ?? [];
    return headerRow.findIndex((cell) => {
      const normalized = normalizeHeaderCell(cell);
      return normalized === 'valuedate' || normalized === 'valuedt' || normalized.includes('valuedate');
    });
  }, [cleanedRows, headerRowIndex]);

  const amountColumnIndex = useMemo(() => {
    if (cleanedRows.length === 0 || headerRowIndex >= cleanedRows.length) return -1;
    const headerRow = cleanedRows[headerRowIndex] ?? [];
    return headerRow.findIndex((cell) => {
      const normalized = normalizeHeaderCell(cell);
      return (
        normalized === 'amount' ||
        normalized === 'paymentamount' ||
        normalized === 'movementamount' ||
        normalized.includes('amount')
      );
    });
  }, [cleanedRows, headerRowIndex]);

  const normalizedMovementAmount = useMemo(
    () => normalizeAmountForCompare(movementAmount ?? ''),
    [movementAmount]
  );

  const matchingSourceRows = useMemo(() => {
    const matches = new Set<number>();
    if (!normalizedMovementAmount || amountColumnIndex < 0) return matches;

    cleanedRows.forEach((row, index) => {
      if (index <= headerRowIndex) return;
      const excelAmount = normalizeAmountForCompare(row[amountColumnIndex]);
      if (excelAmount && excelAmount === normalizedMovementAmount) {
        matches.add(index);
      }
    });
    return matches;
  }, [cleanedRows, headerRowIndex, amountColumnIndex, normalizedMovementAmount]);

  const normalizedFilter = filter.trim().toLowerCase();

  const displayedRows = useMemo<Array<{ row: string[]; sourceIndex: number }>>(() => {
    const withSourceIndex = cleanedRows.map((row, index) => ({ row, sourceIndex: index }));
    if (!normalizedFilter || cleanedRows.length === 0) return withSourceIndex;

    const prefix = withSourceIndex.slice(0, headerRowIndex + 1);
    const body = withSourceIndex.slice(headerRowIndex + 1);
    const kept = body.filter(({ row }) =>
      row.some((cell) => String(cell ?? '').toLowerCase().includes(normalizedFilter))
    );
    return [...prefix, ...kept];
  }, [cleanedRows, headerRowIndex, normalizedFilter]);

  useEffect(() => {
    setFilter('');
  }, [activeSheet]);

  const handleDownload = useCallback(() => {
    if (wb) XLSX.writeFile(wb, 'source-document.xlsx');
  }, [wb]);

  if (loading) {
    return (
      <El className="lmn-d-flex lmn-align-items-center lmn-justify-content-center" style={{ height: '100%' }}>
        <Loading tip="Loading spreadsheet..." />
      </El>
    );
  }

  if (err) {
    return <El style={{ padding: 16, color: '#e74c3c' }}>{err}</El>;
  }

  return (
    <El className="lmn-d-flex lmn-flex-column" style={{ height: '100%' }}>
      {/* Search Toolbar */}
      <El
        className="lmn-d-flex lmn-align-items-center"
        style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0', background: '#fafafa', flex: '0 0 auto', gap: 8 }}
      >
        <El style={{ position: 'relative', width: 240 }}>
          <Input
            placeholder="Filter rows..."
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            style={{ maxWidth: 240, width: '100%', paddingRight: 28 }}
          />
          {filter.trim() !== '' && (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => setFilter('')}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: '#666',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </El>
        <span style={{ flex: 1 }} />
        {isExcel && (
          <Icon
            type="file-excel"
            title="Download Excel"
            onClick={handleDownload}
            style={{ cursor: 'pointer', fontSize: 16, color: '#00247D' }}
          />
        )}
      </El>

      {/* Multi-sheet Tabs */}
      {wb && wb.SheetNames.length > 1 && (
        <El
          className="lmn-d-flex lmn-align-items-center"
          style={{ borderBottom: '1px solid #e0e0e0', background: '#fff', flex: '0 0 auto', overflowX: 'auto' }}
        >
          {wb.SheetNames.map((name) => {
            const active = name === activeSheet;
            return (
              <span
                key={name}
                onClick={() => setActiveSheet(name)}
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  borderBottom: active ? '2px solid #00247D' : '2px solid transparent',
                  color: active ? '#00247D' : '#555',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {name}
              </span>
            );
          })}
        </El>
      )}

      {/* Grid View Table */}
      <El style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
          <tbody>
            {displayedRows.map(({ row, sourceIndex }, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const isHeader = sourceIndex === headerRowIndex;
                  const Tag = isHeader ? 'th' : 'td';
                  const isTableBodyRow = sourceIndex > headerRowIndex;
                  const isMatch = isTableBodyRow && normalizedFilter !== '' && String(cell ?? '').toLowerCase().includes(normalizedFilter);
                  const isAmountMatchedRow = isTableBodyRow && matchingSourceRows.has(sourceIndex);
                  const isValueDateCell = isTableBodyRow && ci === valueDateColumnIndex;
                  const displayCell = isValueDateCell ? formatExcelDateSerial(cell) ?? cell : cell;

                  return (
                    <Tag
                      key={ci}
                      style={{
                        border: '1px solid #e0e0e0',
                        padding: '4px 8px',
                        background: isHeader ? '#00247D' : isAmountMatchedRow ? '#DDF7E3' : isMatch ? '#FFF59D' : '#fff',
                        color: isHeader ? '#fff' : '#333',
                        fontWeight: isHeader ? 600 : 400,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayCell}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </El>
    </El>
  );
};

// =========================================================
// PDF COORDINATE HIGHLIGHT ADAPTER
// =========================================================

const NO_PDF_FIELDS: CapturedField[] = [];
const PDF_HIGHLIGHT_COLOR = '#2A6B3C';
const DOCUMENT_LEVEL_WIRE_INDEX = -1;

export function toCapturedFields(
  coordinates: FieldCoordinate[],
  wireIndex: number | undefined
): CapturedField[] {
  const documentLevel = coordinates.filter((c) => c.wireIndex === DOCUMENT_LEVEL_WIRE_INDEX);
  const wireScoped = wireIndex == null ? [] : coordinates.filter((c) => c.wireIndex === wireIndex);

  const byFieldName = new Map<string, FieldCoordinate>();
  for (const coordinate of [...documentLevel, ...wireScoped]) {
    byFieldName.set(coordinate.fieldName, coordinate);
  }

  return Array.from(byFieldName.values()).map((coordinate) => ({
    id: coordinate.fieldName,
    value: coordinate.fieldName,
    page: coordinate.page,
    color: PDF_HIGHLIGHT_COLOR,
    x: coordinate.xmin,
    y: coordinate.ymin,
    width: coordinate.xmax - coordinate.xmin,
    height: coordinate.ymax - coordinate.ymin,
    normalized: true,
  }));
}

// =========================================================
// COMPONENT PROPS
// =========================================================

export interface InstructionDoc {
  documentId: string | number;
  fileName: string;
  documentType?: string;
  contentType?: string;
  [key: string]: any;
}

export interface SplitPaymentMakerModalProps {
  isOpen: boolean;
  instructionId: number;
  mode?: 'maker' | 'checker' | 'repair' | 'super-checker';
  wireIndex?: number;
  movementAmount?: string;
  documents?: InstructionDoc[];
  initialData?: any;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onClose: () => void;
  onPaymentSuccess?: (refId?: string, payload?: Pain001Model) => void;
}

// =========================================================
// SPLIT PAYMENT MAKER MODAL
// =========================================================

export const SplitPaymentMakerModal: FC<SplitPaymentMakerModalProps> = ({
  isOpen,
  instructionId,
  mode = 'maker',
  wireIndex,
  movementAmount,
  documents = [],
  initialData,
  hasPrev = false,
  hasNext = false,
  currentIndex,
  totalCount,
  onNavigate,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | number>('');
  const [source, setSource] = useState<PaymentSourceFile | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState('');
  const [coordinates, setCoordinates] = useState<FieldCoordinate[]>([]);
  const [activeFieldId] = useState<string | null>(null);
  const [scrollToken] = useState(0);

  // Unsaved Changes Navigation Guard
  const [isDirty, setIsDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<'prev' | 'next' | null>(null);

  // Default selection to PAYMENT_INSTRUCTION or first available attached document
  useEffect(() => {
    if (!isOpen) return;
    if (documents && documents.length > 0) {
      const paymentDoc = documents.find((d) => d.documentType === 'PAYMENT_INSTRUCTION');
      setSelectedDocId(paymentDoc ? paymentDoc.documentId : documents[0].documentId);
    } else {
      setSelectedDocId('');
    }
  }, [isOpen, documents]);

  // Document Fetcher: Loads selected attached document or falls back to DMC payment source
  useEffect(() => {
    if (!isOpen) return;
    let revoked: string | null = null;
    setSource(null);
    setSourceError('');
    setSourceLoading(true);

    const loadDocument = async () => {
      try {
        if (selectedDocId && typeof getDocumentPreviewBlob === 'function') {
          const docIdNum = Number(selectedDocId);
          const activeDoc = documents.find((d) => String(d.documentId) === String(selectedDocId));
          const previewUrl = await getDocumentPreviewBlob(instructionId, docIdNum);

          const fileName = activeDoc?.fileName || 'document.pdf';
          const ext = fileName.split('.').pop()?.toLowerCase() || 'pdf';
          const defaultMime = ext === 'pdf' ? 'application/pdf' : 'application/octet-stream';
          const mimeType = activeDoc?.contentType || defaultMime;

          // Fetch the ArrayBuffer from the URL for NativePdfViewer and SpreadsheetPreview
          const response = await fetch(previewUrl);
          const buffer = await response.arrayBuffer();

          setSource({
            url: previewUrl,
            buffer,
            fileName,
            fileType: ext,
            contentType: mimeType,
          });
        } else {
          const file = await getPaymentSourceFile(instructionId);
          revoked = file.url;
          setSource(file);
        }
      } catch (err) {
        setSourceError(err instanceof Error ? err.message : 'Failed to load source document');
      } finally {
        setSourceLoading(false);
      }
    };

    loadDocument();

    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [isOpen, instructionId, selectedDocId, documents]);

  // Fetch Bounding Box Coordinates
  useEffect(() => {
    if (!isOpen) {
      setCoordinates([]);
      return;
    }
    getPaymentCoordinates(instructionId)
      .then((res) => setCoordinates(res.data ?? []))
      .catch(() => setCoordinates([]));
  }, [isOpen, instructionId]);

  const pdfFields = useMemo(() => toCapturedFields(coordinates, wireIndex), [coordinates, wireIndex]);

  // Record Navigation Callbacks
  const requestNavigation = useCallback((direction: 'prev' | 'next') => {
    if (isDirty) {
      setPendingNavigation(direction);
      return;
    }
    onNavigate?.(direction);
  }, [isDirty, onNavigate]);

  const confirmNavigation = useCallback(() => {
    const direction = pendingNavigation;
    setPendingNavigation(null);
    setIsDirty(false);
    if (direction) onNavigate?.(direction);
  }, [pendingNavigation, onNavigate]);

  // Document Pane Content Resolver (Matching lines 1258-1293 of VerifyPaymentDetailModal)
  const documentContent = useMemo(() => {
    if (sourceLoading) {
      return (
        <El className="lmn-d-flex lmn-align-items-center lmn-justify-content-center" style={{ height: '100%' }}>
          <Loading tip="Loading source document..." />
        </El>
      );
    }
    if (sourceError) {
      return (
        <El
          className="lmn-d-flex lmn-flex-column lmn-align-items-center lmn-justify-content-center"
          style={{ height: '100%', color: '#e74c3c', padding: 16, textAlign: 'center' }}
        >
          <Icon type="alert-circle" style={{ fontSize: 24, marginBottom: 8 }} />
          <span>{sourceError}</span>
        </El>
      );
    }
    if (!source) {
      return (
        <El
          className="lmn-d-flex lmn-align-items-center lmn-justify-content-center"
          style={{ height: '100%', color: '#888' }}
        >
          No source document available
        </El>
      );
    }

    if (source.fileType === 'pdf') {
      return (
        <NativePdfViewer
          pdfData={source.buffer}
          pdfUrl={source.url}
          fields={pdfFields.length > 0 ? pdfFields : NO_PDF_FIELDS}
          activeFieldId={activeFieldId}
          scrollToken={scrollToken}
          filename={source.fileName}
        />
      );
    }

    if (['xlsx', 'xls', 'csv', 'excel'].includes(source.fileType)) {
      return (
        <SpreadsheetPreview
          url={source.url}
          buffer={source.buffer}
          fileType={source.fileType}
          movementAmount={movementAmount}
        />
      );
    }

    return (
      <El
        className="lmn-d-flex lmn-align-items-center lmn-justify-content-center"
        style={{ height: '100%', color: '#888' }}
      >
        Source document type is not supported for preview.
      </El>
    );
  }, [source, sourceLoading, sourceError, movementAmount, pdfFields, activeFieldId, scrollToken]);

  return (
    <>
      <Modal
        visible={isOpen}
        onCancel={onClose}
        title="Payment Verification & Authorization"
        width="92vw"
        footer={null}
      >
        {/* Main Body Split Columns */}
        <El className="lmn-d-flex" style={{ gap: 16, alignItems: 'stretch', minHeight: '74vh' }}>
          {/* Left Column: Document Pane (Matching lines 1319-1335) */}
          <El
            style={{
              flex: '0 0 46%',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '74vh',
              border: '1px solid var(--lmn-border-color, #e0e0e0)',
              borderRadius: 4,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            {/* Top-Left Document Selection Bar */}
            {documents && documents.length > 0 && (
              <El
                className="lmn-d-flex lmn-align-items-center"
                style={{
                  padding: '6px 12px',
                  background: '#f5f7fa',
                  borderBottom: '1px solid #e0e0e0',
                  gap: 8,
                }}
              >
                <Icon type="file-text" style={{ color: '#00247D', fontSize: 14 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>Document:</span>
                <Dropdown
                  value={String(selectedDocId)}
                  onChange={(val: unknown) => setSelectedDocId(String(val))}
                  style={{ flex: 1, maxWidth: 280 }}
                >
                  {documents.map((doc) => (
                    <Dropdown.Item key={String(doc.documentId)} value={String(doc.documentId)}>
                      {doc.fileName} {doc.documentType ? `(${doc.documentType})` : ''}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
              </El>
            )}

            {/* Document Render Canvas */}
            <El style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {documentContent}
            </El>
          </El>

          {/* Right Column: PaymentParent ISO 20022 Form Engine */}
          <El
            style={{
              flex: 1,
              minWidth: 0,
              height: '74vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '0 8px',
              boxSizing: 'border-box',
            }}
          >
            <PaymentParent
              mode={mode}
              initialData={initialData}
              hideTabs={false}
              onDirtyChange={(dirty: boolean) => setIsDirty(dirty)}
              onPaymentSuccess={onPaymentSuccess}
              onClose={onClose}
            />
          </El>
        </El>

        {/* Global Bottom-Center Record Flipping Bar (Matching lines 1445-1472) */}
        {onNavigate && totalCount != null && totalCount > 1 && (
          <El
            className="lmn-d-flex lmn-align-items-center"
            style={{
              justifyContent: 'center',
              gap: 12,
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Button
              color="outline"
              size="sm"
              aria-label="Previous Payment"
              title="Previous Payment"
              disabled={!hasPrev}
              onClick={() => requestNavigation('prev')}
            >
              <Icon type="left-double" /> Previous Payment
            </Button>

            {currentIndex != null && (
              <El style={{ fontSize: 12, fontWeight: 600, margin: '0 8px' }}>
                {currentIndex} / {totalCount}
              </El>
            )}

            <Button
              color="outline"
              size="sm"
              aria-label="Next Payment"
              title="Next Payment"
              disabled={!hasNext}
              onClick={() => requestNavigation('next')}
            >
              Next Payment <Icon type="right-double" />
            </Button>
          </El>
        )}
      </Modal>

      {/* Discard Confirmation Dialog (Matching lines 1475-1487) */}
      <Modal
        visible={pendingNavigation !== null}
        type="confirm"
        title="Unsaved Changes"
        applyText="Continue"
        cancelText="Cancel"
        onApply={confirmNavigation}
        onCancel={() => setPendingNavigation(null)}
        onClose={() => setPendingNavigation(null)}
        closable
      >
        <El>You have unsaved changes. Navigating will discard them. Continue?</El>
      </Modal>
    </>
  );
};

export default SplitPaymentMakerModal;