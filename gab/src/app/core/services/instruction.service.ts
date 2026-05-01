import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import {
  ApiResponse,
  CreatePaymentInstructionPayload,
  InstructionFilters,
  PaginationParams,
  PaymentInstruction,
  UpdateInstructionPayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class InstructionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/instructions`;

  list(
    filters: InstructionFilters = {},
    pagination: PaginationParams = {}
  ): Observable<{ data: PaymentInstruction[]; total: number }> {
    let params = new HttpParams();
    filters.status?.forEach((s) => (params = params.append('status', s)));
    if (filters.regionId) params = params.set('regionId', filters.regionId);
    if (filters.clientId) params = params.set('clientId', filters.clientId);
    if (filters.search) params = params.set('search', filters.search);
    if (pagination.page) params = params.set('page', pagination.page);
    if (pagination.pageSize) params = params.set('pageSize', pagination.pageSize);
    if (pagination.sortBy) params = params.set('sortBy', pagination.sortBy);
    if (pagination.sortDir) params = params.set('sortDir', pagination.sortDir);

    return this.http
      .get<ApiResponse<PaymentInstruction[]>>(this.base, { params })
      .pipe(map((r) => ({ data: r.data, total: r.meta?.total ?? r.data.length })));
  }

  getById(id: string): Observable<PaymentInstruction> {
    return this.http
      .get<ApiResponse<PaymentInstruction>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  create(payload: CreatePaymentInstructionPayload): Observable<PaymentInstruction> {
    return this.http
      .post<ApiResponse<PaymentInstruction>>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  update(id: string, payload: UpdateInstructionPayload): Observable<PaymentInstruction> {
    return this.http
      .put<ApiResponse<PaymentInstruction>>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  advance(id: string): Observable<PaymentInstruction> {
    return this.http
      .post<ApiResponse<PaymentInstruction>>(`${this.base}/${id}/advance`, {})
      .pipe(map((r) => r.data));
  }
}
