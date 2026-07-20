import React, { useCallback, useEffect, useState } from 'react';
import { QueueItem, fetchCheckerQueue, fetchRepairQueue } from '../services/queueService';

// ============================================================================
// RECONSTRUCTED — see queueService.ts for the full explanation of why this
// component has no source capture behind it. This renders a simple list of
// pending items and calls `onSelect(item)` when the user picks one — the
// caller (PaymentWorkflow.tsx) is responsible for feeding that item into
// PaymentParent as `initialCheckerPayload`/`initialRepairPayload`.
// ============================================================================

export interface PaymentQueueListProps {
  mode: 'checker' | 'repair';
  onSelect: (item: QueueItem) => void;
}

export default function PaymentQueueList({ mode, onSelect }: PaymentQueueListProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = mode === 'checker' ? await fetchCheckerQueue() : await fetchRepairQueue();
      setItems(result);
    } catch (err: any) {
      setError(err?.error?.error || err?.message || 'Unable to load queue');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="queue-list-state">Loading {mode} queue...</div>;
  if (error) return (
    <div className="queue-list-state">
      <div className="queue-error">{error}</div>
      <button className="btn-primary" onClick={load}>Retry</button>
    </div>
  );
  if (items.length === 0) return <div className="queue-list-state">No items pending {mode === 'checker' ? 'review' : 'repair'}.</div>;

  return (
    <div className="queue-list">
      {items.map((item) => (
        <button key={item.txnId} className="queue-list-row" onClick={() => onSelect(item)}>
          <span className="queue-list-txn">{item.txnId}</span>
          <span className="queue-list-parties">
            {item.debtorName || item.paymentDetailsRequest?.debtorName || '—'}
            {' \u2192 '}
            {item.creditorName || item.paymentDetailsRequest?.creditorName || '—'}
          </span>
          <span className="queue-list-amount">
            {item.instructedAmountCurrencyCode || item.paymentDetailsRequest?.instructedAmountCurrencyCode || ''}
            {' '}
            {item.instructedAmount ?? item.paymentDetailsRequest?.instructedAmount ?? ''}
          </span>
          <span className="queue-list-date">{item.eventRecordDate}</span>
        </button>
      ))}
    </div>
  );
}
