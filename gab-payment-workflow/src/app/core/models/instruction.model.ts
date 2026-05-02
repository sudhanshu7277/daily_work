export interface PaymentInstruction {
    id?: string;
    referenceId?: string;
    status: 'Draft' | 'Pending Checker' | 'Signature Validation' | 'Callback' | 'Authorised';
    region: string;
    country: string;
    client: string;
    deal: string;
    contractValidationComplete: boolean;
    requestType: string;
    source: string;
    valueDate: string;
    dueDate: string;
    transactionDate: string;
    amount: number;
    currency: string;
    // Arrays for the checker/ops steps
    attachments?: DocumentAttachment[];
    comments?: InstructionComment[];
  }
  
  export interface DocumentAttachment {
    documentName: string;
    documentType: string;
    region: string;
    documentDated: string;
    dmcUpload: boolean;
    uploadedBy: string;
    uploadedOn: string;
  }
  
  export interface InstructionComment {
    commentType: string;
    comment: string;
    commentedBy: string;
    commentedOn: string;
  }