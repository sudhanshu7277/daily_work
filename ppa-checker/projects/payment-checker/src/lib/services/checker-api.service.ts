// ============================================================
// services/checker-api.service.ts — payment-checker v1.0.0
//
// Three API calls:
//
//   1. getCheckerData()       GET  {checkerGetUrl}
//      Loads maker-submitted Pain001 data + transactionId
//
//   2. submitAmountMismatch() POST {amountMismatchUrl}
//      Called ONLY when checker modifies Transaction Amount before Approve
//      Body: { transactionId, originalAmount, modifiedAmount, formData }
//      This is the dual boundary key — both the original and modified
//      amounts are sent so the backend can log / validate the discrepancy
//
//   3. submitCheckerAction()  POST {checkerActionUrl}
//      Final approve or reject action
//      Body: { transactionId, action: 'APPROVED'|'REJECTED', formData }
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
  CheckerAmountMismatchRequest,
  CheckerAmountMismatchResponse,
  CheckerComponentInput,
  createMockCheckerGetResponse
} from '../models/pain001.model';

export const USE_MOCK_API = true; // ← flip to false in production

@Injectable({ providedIn: 'root' })
export class CheckerApiService {

  constructor(private http: HttpClient) {}

  // ── 1. GET: load maker-submitted data ────────────────────────
  // Response includes transactionId bundled with formData.
  // Component stores original instructedAmount from this response
  // to compare with any checker modification.
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

  // ── 2. POST: amount mismatch notification ────────────────────
  // Fired BEFORE submitCheckerAction() when checker has modified
  // the Transaction Amount field and clicks Approve.
  // Dual boundary key: sends both originalAmount and modifiedAmount.
  // Backend uses this to log, audit, or block the discrepancy.
  submitAmountMismatch(
    request: CheckerAmountMismatchRequest,
    input: CheckerComponentInput
  ): Observable<CheckerAmountMismatchResponse> {

    if (USE_MOCK_API) {
      console.log('[MOCK] CheckerApiService.submitAmountMismatch →', {
        transactionId:  request.transactionId,
        originalAmount: request.originalAmount,
        modifiedAmount: request.modifiedAmount
      });
      return of({
        success:       true,
        transactionId: request.transactionId,
        message:       `Amount mismatch recorded: original ${request.originalAmount}, modified ${request.modifiedAmount}`,
        timestamp:     new Date().toISOString()
      }).pipe(delay(400));
    }

    const headers = this.buildHeaders(input);
    return this.http
      .post<CheckerAmountMismatchResponse>(input.amountMismatchUrl, request, { headers })
      .pipe(
        catchError(err =>
          throwError(() => new Error(err?.error?.message || 'Amount mismatch notification failed'))
        )
      );
  }

  // ── 3. POST: approve or reject ───────────────────────────────
  // Body: { transactionId, action: 'APPROVED'|'REJECTED', formData }
  // If checker modified the amount, submitAmountMismatch() is called
  // first by the component before this method is invoked.
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
