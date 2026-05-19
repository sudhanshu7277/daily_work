/**
 * usePaymentApi.ts
 * Typed hook wrapping all Pain.001 API operations.
 */

import { useState, useCallback } from 'react';
import type {
  Pain001Model,
  SubmitPaymentResponse,
  CheckerActionResponse,
  VerifyHardCapRequest,
  VerifyHardCapResponse,
} from '../payment.types';

interface UsePaymentApiOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

interface ApprovePayload {
  transactionId: string;
  dualBlindKeyResult?: string | null;
  isDualBlindKeyPassed?: boolean;
}

interface RejectPayload {
  transactionId: string;
  rejectedFields?: string[];
  outputMessage?: string;
}

export interface UsePaymentApiReturn {
  loading: boolean;
  error: string | null;
  submitPayment: (data: Pain001Model) => Promise<ApiResult<SubmitPaymentResponse>>;
  fetchPayment: (transactionId: string) => Promise<ApiResult<Pain001Model>>;
  approvePayment: (transactionId: string, payload: ApprovePayload) => Promise<ApiResult<CheckerActionResponse>>;
  rejectPayment: (transactionId: string, payload: RejectPayload) => Promise<ApiResult<CheckerActionResponse>>;
  submitRepair: (transactionId: string, data: Pain001Model) => Promise<ApiResult<SubmitPaymentResponse>>;
  checkHardCap: (payload: VerifyHardCapRequest) => Promise<ApiResult<VerifyHardCapResponse>>;
}

export function usePaymentApi({
  baseUrl = '',
  headers = {},
}: UsePaymentApiOptions = {}): UsePaymentApiReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const request = useCallback(
    async <T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> => {
      setLoading(true);
      setError(null);
      try {
        const options: RequestInit = { method, headers: defaultHeaders };
        if (body !== undefined) options.body = JSON.stringify(body);
        const res = await fetch(`${baseUrl}${path}`, options);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error((errBody as { message?: string }).message ?? `HTTP ${res.status}: ${res.statusText}`);
        }
        const data: T = await res.json();
        return { data, error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        return { data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, JSON.stringify(headers)]
  );

  /** Maker: POST /payments/submit */
  const submitPayment = useCallback(
    (data: Pain001Model) =>
      request<SubmitPaymentResponse>('POST', '/payments/submit', data),
    [request]
  );

  /** Fetch payment by transactionId: GET /payments/:id */
  const fetchPayment = useCallback(
    (transactionId: string) =>
      request<Pain001Model>('GET', `/payments/${transactionId}`),
    [request]
  );

  /** Checker approve: POST /payments/:id/approve */
  const approvePayment = useCallback(
    (transactionId: string, payload: ApprovePayload) =>
      request<CheckerActionResponse>('POST', `/payments/${transactionId}/approve`, payload),
    [request]
  );

  /** Checker reject: POST /payments/:id/reject */
  const rejectPayment = useCallback(
    (transactionId: string, payload: RejectPayload) =>
      request<CheckerActionResponse>('POST', `/payments/${transactionId}/reject`, payload),
    [request]
  );

  /** Repair: POST /payments/:id/repair */
  const submitRepair = useCallback(
    (transactionId: string, data: Pain001Model) =>
      request<SubmitPaymentResponse>('POST', `/payments/${transactionId}/repair`, data),
    [request]
  );

  /** Hard cap: POST /hard-cap/verify */
  const checkHardCap = useCallback(
    (payload: VerifyHardCapRequest) =>
      request<VerifyHardCapResponse>('POST', '/hard-cap/verify', payload),
    [request]
  );

  return {
    loading,
    error,
    submitPayment,
    fetchPayment,
    approvePayment,
    rejectPayment,
    submitRepair,
    checkHardCap,
  };
}
