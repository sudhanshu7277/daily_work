import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaymentRecord } from './payment-record.model';

@Injectable({
  providedIn: 'root'
})
export class Checker1Service {

  private dummyData: PaymentRecord[] = [
    {
      id: 1,
      ddaAccount: '744956',
      accountNumber: '744956',
      eventValueDate: new Date('2025-06-01'),
      paymentDate: new Date('2025-11-14'),
      paymentAmountCurrency: 'USD',
      paymentAmount: 2100000,
      statusChoice1: false,
      statusChoice2: true,
      dolNo: 'TRACAPAY',
      eventBalance: 2130000,
      netPaymentAmount: 2100000,
      realTimeBalance: 2100000,
      usdAmount: 2100000,
      issueName: 'ANND LUISA NOLAN',
    },
    {
      id: 2,
      ddaAccount: '11468186',
      accountNumber: '11468186',
      eventValueDate: new Date('2025-11-05'),
      paymentDate: new Date('2025-11-14'),
      paymentAmountCurrency: 'USD',
      paymentAmount: 10627.5,
      statusChoice1: false,
      statusChoice2: true,
      dolNo: 'PDP0005',
      eventBalance: 10627.5,
      netPaymentAmount: 10627.5,
      realTimeBalance: 10627.5,
      usdAmount: 10627.5,
      issueName: 'PAUL MICHELLE CLABAUGH',
    },
    // Add 8 more similar records with varied data and statuses
];
  
  constructor() { }

  getPayments(): Observable<PaymentRecord[]> {
    // Simulate API delay if needed
    return of(this.dummyData);
  }
}