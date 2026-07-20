import React, { useState } from 'react';
import PaymentParent from './PaymentParent';
import PaymentQueueList from './PaymentQueueList';
import { QueueItem } from '../services/queueService';

// ============================================================================
// RECONSTRUCTED (no source capture behind this file — see queueService.ts
// for the full explanation). This is the top-level entry point tying
// together all three modes: a nav to pick New Payment / Checker Queue /
// Repair Queue, the queue list for checker/repair, and PaymentParent itself
// once an item is selected (or immediately, for a new maker payment).
//
// If GAB already has its own routing/nav for this (e.g. a real
// `authorization.component` or equivalent), use THAT to select an item and
// feed it into <PaymentParent initialCheckerPayload={...}> /
// <PaymentParent initialRepairPayload={...}> directly — this component
// exists so the three modes are reachable and demonstrable even without
// that real routing in place yet.
// ============================================================================

type View = 'maker' | 'checker-queue' | 'checker-form' | 'repair-queue' | 'repair-form';

export interface PaymentWorkflowProps {
  currentUser?: { name?: string } | null;
}

export default function PaymentWorkflow({ currentUser }: PaymentWorkflowProps) {
  const [view, setView] = useState<View>('maker');
  const [selectedCheckerItem, setSelectedCheckerItem] = useState<QueueItem | null>(null);
  const [selectedRepairItem, setSelectedRepairItem] = useState<QueueItem | null>(null);

  const goToNav = (nextView: 'maker' | 'checker-queue' | 'repair-queue') => {
    setSelectedCheckerItem(null);
    setSelectedRepairItem(null);
    setView(nextView);
  };

  return (
    <div className="payment-workflow">
      <div className="workflow-nav">
        <button className={view === 'maker' ? 'active' : ''} onClick={() => goToNav('maker')}>New Payment</button>
        <button className={view.startsWith('checker') ? 'active' : ''} onClick={() => goToNav('checker-queue')}>Checker Queue</button>
        <button className={view.startsWith('repair') ? 'active' : ''} onClick={() => goToNav('repair-queue')}>Repair Queue</button>
      </div>

      {view === 'maker' && <PaymentParent currentUser={currentUser} />}

      {view === 'checker-queue' && (
        <PaymentQueueList
          mode="checker"
          onSelect={(item) => { setSelectedCheckerItem(item); setView('checker-form'); }}
        />
      )}
      {view === 'checker-form' && selectedCheckerItem && (
        <div>
          <button className="workflow-back" onClick={() => goToNav('checker-queue')}>&larr; Back to checker queue</button>
          <PaymentParent currentUser={currentUser} initialCheckerPayload={selectedCheckerItem} />
        </div>
      )}

      {view === 'repair-queue' && (
        <PaymentQueueList
          mode="repair"
          onSelect={(item) => { setSelectedRepairItem(item); setView('repair-form'); }}
        />
      )}
      {view === 'repair-form' && selectedRepairItem && (
        <div>
          <button className="workflow-back" onClick={() => goToNav('repair-queue')}>&larr; Back to repair queue</button>
          <PaymentParent currentUser={currentUser} initialRepairPayload={selectedRepairItem.paymentDetailsRequest} />
        </div>
      )}
    </div>
  );
}
