/**
 * PaymentParent.tsx
 *
 * Smart wrapper for the Gab React app.
 * Manages fetching, API calls, and builds the correct input for PaymentChildForm.
 *
 * ── Maker ────────────────────────────────────────────────────
 *   <PaymentParent
 *     mode="maker"
 *     apiBaseUrl="https://api.yourdomain.com"
 *     applicationName="GabApp"
 *     applicationModule="CreditTransfer"
 *     onMakerSubmit={(out) => navigate(`/review/${out.serverResponse?.transactionId}`)}
 *   />
 *
 * ── Checker ──────────────────────────────────────────────────
 *   <PaymentParent
 *     mode="checker"
 *     transactionId="TXN-001"
 *     apiBaseUrl="https://api.yourdomain.com"
 *     dualBlindKeyFlag="Y"
 *     dualBlindKeyFields={["debtorAccountNumber", "instructedAmount"]}
 *     onCheckerApprove={handleApprove}
 *     onCheckerReject={handleReject}
 *   />
 *
 * ── Repair ───────────────────────────────────────────────────
 *   <PaymentParent
 *     mode="repair"
 *     transactionId="TXN-001"
 *     rejectedFieldList={["debtorName", "instructedAmount"]}
 *     onRepairSubmit={handleRepair}
 *   />
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PaymentChildForm } from './PaymentChildForm';
import { usePaymentApi } from './hooks/usePaymentApi';
import { createMakerInput, createCheckerInput, createRepairInput, PAYMENT_MODES, DBK_FLAG } from './paymentConstants';
import type {
  PaymentParentProps,
  PaymentComponentInput,
  PaymentComponentOutput,
  Pain001Model,
} from './payment.types';

/* ==========================================================
   INTERNAL STYLES
   ========================================================== */
const PARENT_STYLES = `
  .pp-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;gap:16px}
  .pp-spinner{width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#1a3a5c;border-radius:50%;animation:pp-spin .7s linear infinite}
  @keyframes pp-spin{to{transform:rotate(360deg)}}
  .pp-loader-text{font-size:14px;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  .pp-error-banner{margin:16px;padding:14px 16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;display:flex;align-items:flex-start;gap:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  .pp-error-icon{font-size:18px;flex-shrink:0;margin-top:1px}
  .pp-error-body{flex:1}
  .pp-error-text{font-size:13px;color:#dc2626;line-height:1.5;margin:0}
  .pp-error-retry{margin-top:8px;padding:6px 14px;border-radius:6px;border:1px solid #dc2626;background:transparent;color:#dc2626;font-size:12px;font-weight:600;cursor:pointer}
  .pp-error-retry:hover{background:#fef2f2}
`;

/* ==========================================================
   PAYMENT PARENT COMPONENT
   ========================================================== */
export const PaymentParent: React.FC<PaymentParentProps> = ({
  mode = PAYMENT_MODES.MAKER,
  transactionId = null,
  apiBaseUrl = '',
  apiHeaders = {},
  hardcapBaseUrl = '',
  applicationName = '',
  applicationModule = '',
  currency = '',
  region = '',
  hideFieldsList = [],
  rejectedFieldList = [],
  dualBlindKeyFlag = DBK_FLAG.OFF,
  dualBlindKeyFields = [],
  initialPaymentData = null,
  validationRules = null,
  onMakerSubmit,
  onCheckerApprove,
  onCheckerReject,
  onRepairSubmit,
  onError,
}) => {
  const api = usePaymentApi({ baseUrl: apiBaseUrl, headers: apiHeaders });

  const [paymentData, setPaymentData] = useState<Pain001Model | null>(initialPaymentData);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Prevents double-fetch in React StrictMode
  const hasFetched = useRef<boolean>(false);

  /* ── Fetch payment data ── */
  useEffect(() => {
    const shouldFetch =
      transactionId &&
      !initialPaymentData &&
      !hasFetched.current &&
      mode !== PAYMENT_MODES.MAKER;

    if (!shouldFetch) return;

    hasFetched.current = true;
    setIsFetching(true);
    setFetchError(null);

    api.fetchPayment(transactionId!).then(({ data, error }) => {
      setIsFetching(false);
      if (error) {
        setFetchError(`Failed to load payment data: ${error}`);
        onError?.({ type: 'fetch', message: error });
      } else if (data) {
        setPaymentData(data);
      }
    });
  }, [transactionId, mode, initialPaymentData]);

  /* ── Reset on key prop changes ── */
  useEffect(() => {
    hasFetched.current = false;
    setPaymentData(initialPaymentData ?? null);
    setFetchError(null);
  }, [transactionId, initialPaymentData]);

  /* ── Build the input for PaymentChildForm ── */
  const buildInput = useCallback((): PaymentComponentInput => {
    const base = {
      applicationName,
      applicationModule,
      currency,
      hideFieldsList,
      dualBlindKeyFlag,
      dualBlindKeyFields,
      hardcapLimitCheckBaseUrl: hardcapBaseUrl,
      validationRules,
    };

    switch (mode) {
      case PAYMENT_MODES.CHECKER:
        return createCheckerInput(paymentData, {
          ...base,
          currency: currency || paymentData?.instructedAmountCurrencyCode || '',
        });
      case PAYMENT_MODES.REPAIR:
        return createRepairInput(paymentData, rejectedFieldList, {
          ...base,
          currency: currency || paymentData?.instructedAmountCurrencyCode || '',
        });
      default:
        return createMakerInput(base);
    }
  }, [
    mode, paymentData, applicationName, applicationModule, currency,
    hideFieldsList, rejectedFieldList, dualBlindKeyFlag, dualBlindKeyFields,
    hardcapBaseUrl, validationRules,
  ]);

  /* ── onOutput → call API → fire callback ── */
  const handleOutput = useCallback(async (output: PaymentComponentOutput): Promise<void> => {
    if (mode === PAYMENT_MODES.MAKER && output.isValid) {
      if (apiBaseUrl) {
        const { data, error } = await api.submitPayment({
          ...output.paymentData,
          applicationName,
          applicationModule,
          region,
        });
        if (error) { onError?.({ type: 'submit', message: error }); return; }
        onMakerSubmit?.({ ...output, serverResponse: data ?? undefined });
      } else {
        onMakerSubmit?.(output);
      }
    }

    if (mode === PAYMENT_MODES.REPAIR && output.isValid) {
      if (apiBaseUrl && transactionId) {
        const { data, error } = await api.submitRepair(transactionId, output.paymentData);
        if (error) { onError?.({ type: 'repair', message: error }); return; }
        onRepairSubmit?.({ ...output, serverResponse: data ?? undefined });
      } else {
        onRepairSubmit?.(output);
      }
    }
  }, [mode, apiBaseUrl, transactionId, applicationName, applicationModule, region]);

  const handleApprove = useCallback(async (output: PaymentComponentOutput): Promise<void> => {
    if (apiBaseUrl && transactionId) {
      const { data, error } = await api.approvePayment(transactionId, {
        transactionId,
        dualBlindKeyResult: output.dualBlindKeyResult,
        isDualBlindKeyPassed: output.isDualBlindKeyPassed,
      });
      if (error) { onError?.({ type: 'approve', message: error }); return; }
      onCheckerApprove?.({ ...output, serverResponse: data ?? undefined });
    } else {
      onCheckerApprove?.(output);
    }
  }, [apiBaseUrl, transactionId, onCheckerApprove, onError]);

  const handleReject = useCallback(async (output: PaymentComponentOutput): Promise<void> => {
    if (apiBaseUrl && transactionId) {
      const { data, error } = await api.rejectPayment(transactionId, {
        transactionId,
        rejectedFields: rejectedFieldList,
        outputMessage: output.outputMessage,
      });
      if (error) { onError?.({ type: 'reject', message: error }); return; }
      onCheckerReject?.({ ...output, serverResponse: data ?? undefined });
    } else {
      onCheckerReject?.(output);
    }
  }, [apiBaseUrl, transactionId, rejectedFieldList, onCheckerReject, onError]);

  /* ── Render states ── */
  if (isFetching) {
    return (
      <>
        <style>{PARENT_STYLES}</style>
        <div className="pp-loader">
          <div className="pp-spinner" />
          <span className="pp-loader-text">Loading payment data…</span>
        </div>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <style>{PARENT_STYLES}</style>
        <div className="pp-error-banner">
          <span className="pp-error-icon">⚠</span>
          <div className="pp-error-body">
            <p className="pp-error-text">{fetchError}</p>
            <button
              className="pp-error-retry"
              onClick={() => {
                hasFetched.current = false;
                setFetchError(null);
                setPaymentData(null);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  if ((mode === PAYMENT_MODES.CHECKER || mode === PAYMENT_MODES.REPAIR) && !paymentData && transactionId) {
    return (
      <>
        <style>{PARENT_STYLES}</style>
        <div className="pp-loader">
          <div className="pp-spinner" />
          <span className="pp-loader-text">Preparing form…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{PARENT_STYLES}</style>
      <PaymentChildForm
        mode={mode}
        input={buildInput()}
        onOutput={handleOutput}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
};

export default PaymentParent;
