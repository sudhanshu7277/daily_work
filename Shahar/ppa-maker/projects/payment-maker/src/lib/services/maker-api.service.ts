// ============================================================
// services/maker-api.service.ts
// POST API for maker form submission.
// Toggle USE_MOCK_API = false for production.
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import {
  Pain001Model,
  MakerSubmitResponse,
  PaymentComponentInput
} from '../models/pain001.model';

export const USE_MOCK_API = true; // ← flip to false in production

function generateTxnId(): string {
  return 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 9000 + 1000);
}

@Injectable({ providedIn: 'root' })
export class MakerApiService {

  constructor(private http: HttpClient) {}

  /**
   * Submit Pain001 payload to the maker API.
   * POST {input.makerSubmitUrl}
   */
  submitMakerForm(
    payload: Pain001Model,
    input: PaymentComponentInput
  ): Observable<MakerSubmitResponse> {

    if (USE_MOCK_API) {
      console.log('[MOCK] MakerApiService.submitMakerForm →', payload);
      return of({
        success:       true,
        transactionId: generateTxnId(),
        message:       'Payment instruction submitted successfully. Awaiting checker approval.',
        timestamp:     new Date().toISOString(),
        status:        'PENDING_CHECKER' as const
      }).pipe(delay(1200));
    }

    const headers = new HttpHeaders({
      'Content-Type':       'application/json',
      'X-Application-Name': input.applicationName,
      'X-Application-Module': input.applicationModule,
      ...(input.region  ? { 'X-Region': input.region } : {}),
      ...(input.headers || {})
    });

    return this.http
      .post<MakerSubmitResponse>(input.makerSubmitUrl, payload, { headers })
      .pipe(
        catchError(err =>
          throwError(() => new Error(err?.error?.message || 'Submission failed'))
        )
      );
  }
}
