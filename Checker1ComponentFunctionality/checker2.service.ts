import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PaymentRecord {
  id: number;
  ddaAccount: string;
  accountNumber: string;
  eventValueDate: Date;
  paymentDate: Date;
  paymentAmountCurrency: string;
  paymentAmount: number;
  statusChoice1: boolean;
  statusChoice2: boolean;
  dolNo: string;
  eventBalance: number;
  netPaymentAmount: number;
  realTimeBalance: number;
  usdAmount: number;
  issueName: string;
  authorized?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Checker1Service {
  private dummyData: PaymentRecord[] = [
    // same dummy data as previously provided
  ];

  constructor() {}

  getPayments(): Observable<PaymentRecord[]> {
    return of(this.dummyData);
  }
}