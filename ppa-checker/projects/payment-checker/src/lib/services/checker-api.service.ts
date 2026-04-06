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

export const USE_MOCK_API = true;

function isMock(input: CheckerComponentInput): boolean {
  return input?.useMockApi !== false;
}

@Injectable({ providedIn: 'root' })
export class CheckerApiService {

  constructor(private http: HttpClient) { }

  getCheckerData(
    input: CheckerComponentInput
  ): Observable<CheckerGetResponse> {

    if (isMock(input)) {
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

  submitAmountMismatch(
    request: CheckerAmountMismatchRequest,
    input: CheckerComponentInput
  ): Observable<CheckerAmountMismatchResponse> {

    if (isMock(input)) {
      console.log('[MOCK] CheckerApiService.submitAmountMismatch →', {
        transactionId: request.transactionId,
        originalAmount: request.originalAmount,
        modifiedAmount: request.modifiedAmount
      });
      return of({
        success: true,
        transactionId: request.transactionId,
        message: `Amount mismatch recorded: original ${request.originalAmount}, modified ${request.modifiedAmount}`,
        timestamp: new Date().toISOString()
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

  submitCheckerAction(
    request: CheckerActionRequest,
    input: CheckerComponentInput
  ): Observable<CheckerActionResponse> {

    if (isMock(input)) {
      console.log('[MOCK] CheckerApiService.submitCheckerAction →', request);
      const isApproved = request.action === 'APPROVED';
      return of({
        success: true,
        transactionId: request.transactionId,
        action: request.action,
        message: isApproved
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
      'Content-Type': 'application/json',
      'X-Application-Name': input.applicationName,
      'X-Application-Module': input.applicationModule,
      ...(input.region ? { 'X-Region': input.region } : {}),
      ...(input.headers || {})
    });
  }
}
