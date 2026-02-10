import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Checker1Service {
  getLargeDataset(): Observable<any[]> {
    const records = [];
    for (let i = 1; i <= 1000; i++) {
      records.push({
        id: `TXN-${1000 + i}`,
        ddaAccount: `DDA-${Math.floor(Math.random() * 90000) + 10000}`,
        valueDate: new Date(2026, 1, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        ccy: ['USD', 'EUR', 'GBP', 'CAD'][Math.floor(Math.random() * 4)],
        amount: Math.random() * 1000000
      });
    }
    // Simulate a 1.5s network delay
    return of(records).pipe(delay(1500));
  }
}