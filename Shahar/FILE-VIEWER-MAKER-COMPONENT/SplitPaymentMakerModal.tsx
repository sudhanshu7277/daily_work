//2. SplitPaymentMakerModal.tsx


import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { PaymentParent } from './PaymentParent';
import { Pain001Model } from '../types/models';
import { GabInstructionDocument } from '@/types/instruction.types';
import './SplitPaymentMakerModal.css';

export interface SplitPaymentMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: GabInstructionDocument | null;
  documents?: GabInstructionDocument[];
  onSelectDocument?: (doc: GabInstructionDocument) => Promise<void> | void;
  previewUrl: string | null;
  previewLoading?: boolean;
  mode?: 'maker' | 'checker' | 'repair';
  initialData?: Partial<Pain001Model> | null;
  onPaymentSuccess?: (referenceId: string, payload: Pain001Model) => void;
}

export const SplitPaymentMakerModal: React.FC<SplitPaymentMakerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  documents = [],
  onSelectDocument,
  previewUrl,
  previewLoading = false,
  mode = 'maker',
  initialData,
  onPaymentSuccess
}) => {
  const [currentDoc, setCurrentDoc] = useState<GabInstructionDocument | null>(doc);
  const [excelSheets, setExcelSheets] = useState<{ name: string; data: (string | number)[][] }[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState<number>(0);
  const [textContent, setTextContent] = useState<string>('');
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);

  useEffect(() => {
    setCurrentDoc(doc);
  }, [doc]);

  const fileName = currentDoc?.fileName || '';
  const contentType = currentDoc?.contentType || '';
  const isPdf = contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');
  const isExcel = contentType.includes('sheet') || contentType.includes('excel') || /\.(xlsx|xls|csv)$/i.test(fileName);
  const isText = contentType.includes('text') || /\.(txt|sql|log|json|xml)$/i.test(fileName);
  const isImage = contentType.includes('image') || /\.(png|jpe?g|gif|webp)$/i.test(fileName);

  // Parse Excel / Text Blobs
  useEffect(() => {
    if (!isOpen || !previewUrl) return;

    if (isExcel) {
      setIsParsingDoc(true);
      fetch(previewUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const workbook = XLSX.read(buffer, { type: 'array' });
          const sheets = workbook.SheetNames.map((name) => ({
            name,
            data: XLSX.utils.sheet_to_json<(string | number)[]>(workbook.Sheets[name], { header: 1, defval: '' })
          }));
          setExcelSheets(sheets);
        })
        .catch((err) => console.error('Failed to parse Excel buffer:', err))
        .finally(() => setIsParsingDoc(false));
    } else if (isText) {
      setIsParsingDoc(true);
      fetch(previewUrl)
        .then((res) => res.text())
        .then((txt) => setTextContent(txt))
        .catch((err) => console.error('Failed to parse text buffer:', err))
        .finally(() => setIsParsingDoc(false));
    }
  }, [isOpen, previewUrl, isExcel, isText]);

  // Lock background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getHeaderMeta = () => {
    switch (mode) {
      case 'checker':
        return { title: 'Payment Verification & Authorization (Checker Mode)', color: '#0369a1', badgeColor: '#0284c7' };
      case 'repair':
        return { title: 'Payment Correction & Resubmission (Repair Mode)', color: '#92400e', badgeColor: '#b45309' };
      default:
        return { title: 'Payment Instruction Entry (Maker Mode)', color: '#002d72', badgeColor: '#004b99' };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="split-maker-modal-overlay">
      <div className="split-maker-modal-window">
        {/* Top Header Bar */}
        <header className="split-maker-header" style={{ backgroundColor: headerMeta.color }}>
          <div className="split-maker-meta">
            <h2 className="split-maker-title">{headerMeta.title}</h2>
            {documents && documents.length > 1 ? (
              <select
                className="split-doc-dropdown"
                style={{ backgroundColor: headerMeta.badgeColor }}
                value={currentDoc?.documentId}
                onChange={async (e) => {
                  const selected = documents.find((d) => String(d.documentId) === e.target.value);
                  if (selected) {
                    setCurrentDoc(selected);
                    if (onSelectDocument) {
                      await onSelectDocument(selected);
                    }
                  }
                }}
              >
                {documents.map((d) => (
                  <option key={d.documentId} value={d.documentId}>
                    📄 {d.fileName}
                  </option>
                ))}
              </select>
            ) : (
              fileName && (
                <span className="split-maker-badge" style={{ backgroundColor: headerMeta.badgeColor }}>
                  📄 {fileName}
                </span>
              )
            )}
          </div>
          <div className="split-maker-controls">
            <button
              type="button"
              className="split-maker-btn-close"
              onClick={onClose}
              title="Close Modal"
            >
              ✕
            </button>
          </div>
        </header>

        {/* 50% : 50% Split Layout */}
        <div className="split-maker-body">
          {/* Left Panel: 50% Document Viewer */}
          <div className="split-maker-panel left-panel">
            {previewLoading || isParsingDoc ? (
              <div className="split-maker-loading">
                <div className="split-spinner"></div>
                <span>Loading document stream...</span>
              </div>
            ) : !previewUrl ? (
              <div className="split-maker-loading">
                <p style={{ color: '#94a3b8', fontSize: 13 }}>
                  📄 No preview stream available for {fileName || 'this instruction'}.
                </p>
              </div>
            ) : isPdf ? (
              <iframe
                src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                title={fileName || 'Document Preview'}
                className="split-doc-iframe"
              />
            ) : isImage ? (
              <div className="split-image-container">
                <img src={previewUrl} alt={fileName} className="split-doc-img" />
              </div>
            ) : isText ? (
              <div className="split-text-container">
                <pre><code>{textContent}</code></pre>
              </div>
            ) : isExcel ? (
              <div className="split-excel-wrapper">
                {excelSheets.length > 1 && (
                  <div className="split-excel-tabs">
                    {excelSheets.map((sheet, idx) => (
                      <button
                        key={sheet.name}
                        type="button"
                        className={`split-excel-tab-btn ${activeSheetIdx === idx ? 'active' : ''}`}
                        onClick={() => setActiveSheetIdx(idx)}
                      >
                        {sheet.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="split-excel-table-scroll">
                  <table className="split-excel-table">
                    <tbody>
                      {excelSheets[activeSheetIdx]?.data.map((row, rIdx) => (
                        <tr key={`r-${rIdx}`}>
                          <td className="split-excel-row-num">{rIdx + 1}</td>
                          {row.map((cell, cIdx) => (
                            <td key={`c-${rIdx}-${cIdx}`}>{cell !== '' ? String(cell) : '\u00A0'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <iframe src={previewUrl} title={fileName || 'Document'} className="split-doc-iframe" />
            )}
          </div>

          {/* Right Panel: 50% PaymentParent */}
          <div className="split-maker-panel right-panel">
            <div className="split-form-scroll-pane">
              <PaymentParent
                mode={mode}
                initialData={initialData}
                hideTabs={true}
                onPaymentSuccess={(refId, payload) => {
                  if (onPaymentSuccess) {
                    onPaymentSuccess(refId, payload);
                  }
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};