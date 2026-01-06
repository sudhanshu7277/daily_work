export interface PaymentRecord {
    id: number;
    ddaAccount: string;
    accountNumber: string;
    eventValueDate: Date;
    paymentDate: Date;
    paymentAmountCurrency: string;
    paymentAmount: number;
    statusChoice1: boolean; // Y/N represented by green/red circle
    statusChoice2: boolean;
    dolNo: string;
    eventBalance: number;
    netPaymentAmount: number;
    realTimeBalance: number;
    usdAmount: number;
    issueName: string;
    authorized?: boolean; // track if authorized
  }