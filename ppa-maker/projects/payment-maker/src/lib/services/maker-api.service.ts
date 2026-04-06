import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import {
  Pain001Model,
  MakerSubmitResponse,
  PaymentComponentInput,
  HardcapCheckRequest,
  HardcapCheckResponse
} from '../models/pain001.model';

export const USE_MOCK_API = true;

function isMock(input: PaymentComponentInput): boolean {
  return input?.useMockApi !== false;
}

const MOCK_HARDCAP_LIMIT = 5_000_000;

function generateTxnId(): string {
  return 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 9000 + 1000);
}

@Injectable({ providedIn: 'root' })
export class MakerApiService {

  constructor(private http: HttpClient) { }

  submitMakerForm(
    payload: Pain001Model,
    input: PaymentComponentInput
  ): Observable<MakerSubmitResponse> {

    if (isMock(input)) {
      console.log('[MOCK] MakerApiService.submitMakerForm →', payload);
      return of({
        success: true,
        transactionId: generateTxnId(),
        message: 'Payment instruction submitted successfully. Awaiting checker approval.',
        timestamp: new Date().toISOString(),
        status: 'PENDING_CHECKER' as const
      }).pipe(delay(1200));
    }

    const headers = this.buildHeaders(input);
    return this.http
      .post<MakerSubmitResponse>(input.makerSubmitUrl, payload, { headers })
      .pipe(
        catchError(err =>
          throwError(() => new Error(err?.error?.message || 'Submission failed'))
        )
      );
  }

  checkHardcap(
    request: HardcapCheckRequest,
    input: PaymentComponentInput
  ): Observable<HardcapCheckResponse> {

    if (isMock(input)) {
      console.log('[MOCK] MakerApiService.checkHardcap →', request);

      let response: HardcapCheckResponse;

      if (request.amount === null || request.amount === undefined || isNaN(request.amount)) {
        response = { status: 'REQUIRED', message: 'Transaction amount is required' };
      } else if (request.amount < 0) {
        response = { status: 'MIN_ERROR', message: 'Min value is 0' };
      } else if (request.amount === 0) {
        response = { status: 'REQUIRED', message: 'Transaction amount is required' };
      } else if (request.amount > MOCK_HARDCAP_LIMIT) {
        response = {
          status: 'EXCEEDED',
          message: `Value cannot be more than ${MOCK_HARDCAP_LIMIT.toLocaleString()}`,
          limit: MOCK_HARDCAP_LIMIT
        };
      } else {
        response = { status: 'PASSED', message: 'Hardcap limit check passed' };
      }

      return of(response).pipe(delay(300));
    }

    const headers = this.buildHeaders(input);
    return this.http
      .post<HardcapCheckResponse>(input.hardcapCheckUrl, request, { headers })
      .pipe(
        catchError(err =>
          throwError(() => new Error(err?.error?.message || 'Hardcap check failed'))
        )
      );
  }

  private buildHeaders(input: PaymentComponentInput): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Application-Name': input.applicationName,
      'X-Application-Module': input.applicationModule,
      ...(input.region ? { 'X-Region': input.region } : {}),
      ...(input.headers || {})
    });
  }
}
