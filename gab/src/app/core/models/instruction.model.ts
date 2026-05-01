import {
  Category,
  Currency,
  ExceptionType,
  MppRequired,
  RequestType,
  SignatureStatus,
  Source,
  TransactionSystem,
} from './lookup.model';

/**
 * Lifecycle of an instruction across the GAB system.
 * Drives both the Approval (4-step) and Payment (3-step) workflows.
 */
export type InstructionStatus =
  | 'draft'                // saved, not submitted
  | 'admin-maker'          // step 1 of approval
  | 'admin-checker'        // step 2 of approval
  | 'signature-validation' // step 3 of approval
  | 'operations-callback'  // step 4 of approval
  | 'payment-pending'      // payment workflow step 1
  | 'payment-in-progress'  // payment workflow step 2
  | 'payment-completed'    // payment workflow step 3
  | 'cancelled'
  | 'rejected';

export const INSTRUCTION_STATUS_LABELS: Record<InstructionStatus, string> = {
  draft: 'Draft',
  'admin-maker': 'Admin Maker',
  'admin-checker': 'Admin Checker',
  'signature-validation': 'Signature Validation',
  'operations-callback': 'Operations Callback',
  'payment-pending': 'Payment Pending',
  'payment-in-progress': 'Payment In Progress',
  'payment-completed': 'Payment Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

// -- Sub-records --------------------------------------------------------------

export interface ClientInformation {
  regionId: string | null;
  countryId: string | null;
  clientId: string | null;
  dealId: string | null;
  contractValidationComplete: boolean;
}

export interface InstructionDetails {
  requestType: RequestType | null;
  source: Source | null;
  senderEmail?: string | null;
  primaryAssigneeId: string | null;
  backupAssigneeId?: string | null;
  category: Category | null;
  description?: string;
  relatedInstructionIds: string[];
  valueDate: string | null;       // ISO date
  dueDate: string | null;         // ISO date
  transactionDate: string | null; // ISO date
}

export interface AdditionalInformationRow {
  id: string;
  awsAccount?: string;
  debitAccountNumber?: string;
  transactionSystem?: TransactionSystem;
  currency?: Currency;
  transactionQuantity?: number;
  transactionType?: string;
  amount?: number;
}

export interface MppProcess {
  citiDirectClientProfile: {
    reviewRequired: boolean;
    note?: string;
  };
  mppRequired: MppRequired | null;
  exception: ExceptionType | null;
}

export interface InstructionAttachment {
  id: string;
  documentName: string;
  documentType: string;          // 'Issuer Services Ops', 'Keeper File Rev', ...
  region: string;
  documentDated?: string | null;
  oncUpload: boolean;
  uploadedBy: string;
  uploadedOn: string;            // ISO datetime
  url?: string;
}

export interface SignatureValidation {
  validationSource: string | null;
  status: SignatureStatus | null;
  commentType: string;           // typically 'Signature Validation'
  comment?: string;
  sequenceNumber?: string;
}

export interface CallbackEntry {
  id: string;
  contactName: string;
  contactNumber?: string;
  comment: string;
  by: string;
  at: string;                    // ISO datetime
}

export interface Comment {
  id: string;
  commentType: string;           // 'Admin Checker', 'Admin Maker', 'Operations'
  comment: string;
  commentedBy: string;
  commentedOn: string;
}

export interface WorkflowStepRecord {
  step: InstructionStatus;
  enteredAt: string;
  exitedAt?: string;
  by: string;
  comment?: string;
}

// -- The aggregate root -------------------------------------------------------

export interface PaymentInstruction {
  id: string;                    // e.g. AR_20251124_5102
  reference: string;             // human-readable display id
  status: InstructionStatus;

  clientInformation: ClientInformation;
  instructionDetails: InstructionDetails;
  additionalInformation: AdditionalInformationRow[];
  mppProcess: MppProcess;
  attachments: InstructionAttachment[];
  signatureValidation: SignatureValidation;
  callbacks: CallbackEntry[];
  comments: Comment[];
  history: WorkflowStepRecord[];

  createdBy: string;
  createdOn: string;
  updatedOn: string;
}

// -- Creation payload (only fields a Maker can set in Fig 1) ------------------

export type CreatePaymentInstructionPayload = Pick<
  PaymentInstruction,
  'clientInformation' | 'instructionDetails' | 'mppProcess'
>;

// -- Approval-step payload (Fig 3 adds Additional Information) ---------------

export interface UpdateInstructionPayload {
  clientInformation?: Partial<ClientInformation>;
  instructionDetails?: Partial<InstructionDetails>;
  additionalInformation?: AdditionalInformationRow[];
  mppProcess?: Partial<MppProcess>;
  signatureValidation?: Partial<SignatureValidation>;
}
