// ============================================================
// services/checker-api.service.ts — payment-checker v1.0.0
//
// GET  {checkerGetUrl}              → loads maker data + transactionId
// POST {checkerActionUrl}           → approve or reject with full payload
//
// USE_MOCK_API = true  (flip to false for production)
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import {
  CheckerGetResponse,
  CheckerActionRequest,
  CheckerActionResponse,
  CheckerComponentInput,
  createMockCheckerGetResponse
} from '../models/pain001.model';

export const USE_MOCK_API = true; // ← flip to false in production

@Injectable({ providedIn: 'root' })
export class CheckerApiService {

  constructor(private http: HttpClient) {}

  // ── GET: load maker-submitted data ──────────────────────────
  // In production: GET {input.checkerGetUrl}
  // Response includes transactionId bundled with formData
  getCheckerData(
    input: CheckerComponentInput
  ): Observable<CheckerGetResponse> {

    if (USE_MOCK_API) {
      console.log('[MOCK] CheckerApiService.getCheckerData → loading mock data');
      return of(createMockCheckerGetResponse()).pipe(delay(800));
    }

    const headers = this.buildHeaders(input);
    return this.http
      .get<CheckerGetResponse>(input.checkerGetUrl, { headers })
      .pipe(
        catchError(err =>
          throwError(() => new Error(err?.error?.message || 'Failed to load checker data'))
        )
      );
  }

  // ── POST: approve or reject ──────────────────────────────────
  // Body: { transactionId, action: 'APPROVED'|'REJECTED', formData }
  // Same endpoint, action field distinguishes approve vs reject
  submitCheckerAction(
    request: CheckerActionRequest,
    input: CheckerComponentInput
  ): Observable<CheckerActionResponse> {

    if (USE_MOCK_API) {
      console.log('[MOCK] CheckerApiService.submitCheckerAction →', request);
      const isApproved = request.action === 'APPROVED';
      return of({
        success:       true,
        transactionId: request.transactionId,
        action:        request.action,
        message:       isApproved
          ? `Transaction ${request.transactionId} has been approved successfully.`
          : `Transaction ${request.transactionId} has been rejected.`,
        timestamp: new Date().toISOString()
      }).pipe(delay(1000));
    }

    const headers = this.buildHeaders(input);
    return this.http
      .post<CheckerActionResponse>(input.checkerActionUrl, request, { headers })
      .pipe(
        catchError(err =>
          throwError(() => new Error(err?.error?.message || 'Action failed'))
        )
      );
  }

  private buildHeaders(input: CheckerComponentInput): HttpHeaders {
    return new HttpHeaders({
      'Content-Type':          'application/json',
      'X-Application-Name':    input.applicationName,
      'X-Application-Module':  input.applicationModule,
      ...(input.region ? { 'X-Region': input.region } : {}),
      ...(input.headers || {})
    });
  }
}
