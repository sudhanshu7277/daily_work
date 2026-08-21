import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { PaymentParent } from '../payment/PaymentParent';
import {
  GabInstructionDocument,
  PaymentComponentOutput,
  FormFieldConfig,
  Pain001Model
} from '../../../../projects/payment-flow-ui-lib/models/models';
import './SplitPaymentMakerModal.css';

export interface SplitPaymentMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: GabInstructionDocument | null;
  previewUrl: string | null;
  previewLoading?: boolean;
  fieldConfig?: FormFieldConfig[];
  initialData?: Partial<Pain001Model> | null;
  onSubmitPayment: (output: PaymentComponentOutput) => Promise<void> | void;
}

export const SplitPaymentMakerModal: React.FC<SplitPaymentMakerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  previewUrl,
  previewLoading = false,
  fieldConfig,
  initialData,
  onSubmitPayment
}) => {
  const [outputPayload, setOutputPayload] = useState<PaymentComponentOutput | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [excelSheets, setExcelSheets] = useState<{ name: string; data: (string | number)[][] }[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState<number>(0);
  const [textContent, setTextContent] = useState<string>('');
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fileName = doc?.fileName || '';
  const contentType = doc?.contentType || '';
  const isPdf = contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');
  const isExcel = contentType.includes('sheet') || contentType.includes('excel') || /\.(xlsx|xls|csv)$/i.test(fileName);
  const isText = contentType.includes('text') || /\.(txt|sql|log|json|xml)$/i.test(fileName);
  const isImage = contentType.includes('image') || /\.(png|jpe?g|gif|webp)$/i.test(fileName);

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

  const handleSubmit = async () => {
    if (!outputPayload) return;
    try {
      setSubmitting(true);
      await onSubmitPayment(outputPayload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="split-maker-modal-overlay">
      <div className="split-maker-modal-window">
        {/* Top Header */}
        <header className="split-maker-header">
          <div className="split-maker-meta">
            <h2 className="split-maker-title">Payment Instruction Entry (Maker Mode)</h2>
            {fileName && <span className="split-maker-badge">📄 {fileName}</span>}
          </div>
          <div className="split-maker-controls">
            <button
              type="button"
              className="split-maker-btn-submit"
              disabled={!isFormValid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit Instruction'}
            </button>
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

        {/* 50/50 Body */}
        <div className="split-maker-body">
          {/* Left Panel: 50% Document Viewport */}
          <div className="split-maker-panel left-panel">
            {previewLoading || isParsingDoc ? (
              <div className="split-maker-loading">
                <div className="split-spinner"></div>
                <span>Loading document preview...</span>
              </div>
            ) : !previewUrl ? (
              <div className="split-maker-loading">
                <p>⚠️ No preview source available for this document.</p>
              </div>
            ) : isPdf ? (
              <iframe
                src={`${previewUrl}#toolbar=1&navpanes=1&statusbar=0&view=FitH`}
                title={fileName}
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
              <iframe src={previewUrl} title={fileName} className="split-doc-iframe" />
            )}
          </div>

          {/* Right Panel: 50% PaymentParent */}
          <div className="split-maker-panel right-panel">
            <div className="split-form-scroll-pane">
              <PaymentParent
                mode="maker"
                initialData={initialData}
                customFieldConfig={fieldConfig}
                onPaymentChange={(output) => setOutputPayload(output)}
                onValidityChange={(isValid) => setIsFormValid(isValid)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};