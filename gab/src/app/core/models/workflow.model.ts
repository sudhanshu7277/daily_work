import { InstructionStatus } from './instruction.model';

export interface WorkflowStep {
  key: InstructionStatus;
  label: string;
  shortLabel: string;
  group: 'approval' | 'payment';
}

export const APPROVAL_STEPS: WorkflowStep[] = [
  { key: 'admin-maker',           label: 'Admin Maker',           shortLabel: 'Maker',     group: 'approval' },
  { key: 'admin-checker',         label: 'Admin Checker',         shortLabel: 'Checker',   group: 'approval' },
  { key: 'signature-validation',  label: 'Signature Validation',  shortLabel: 'Signature', group: 'approval' },
  { key: 'operations-callback',   label: 'Operations Callback',   shortLabel: 'Callback',  group: 'approval' },
];

export const PAYMENT_STEPS: WorkflowStep[] = [
  { key: 'payment-pending',     label: 'Payment Pending',     shortLabel: 'Pending',  group: 'payment' },
  { key: 'payment-in-progress', label: 'Payment In Progress', shortLabel: 'Progress', group: 'payment' },
  { key: 'payment-completed',   label: 'Payment Completed',   shortLabel: 'Complete', group: 'payment' },
];

export const ALL_WORKFLOW_STEPS: WorkflowStep[] = [...APPROVAL_STEPS, ...PAYMENT_STEPS];

export type StepState = 'completed' | 'current' | 'upcoming' | 'rejected';
