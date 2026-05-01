import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models';

export interface DashboardSummary {
  total: number;
  counts: Record<string, number>;
  byCategory: Record<string, number>;
  byRegion: Record<string, number>;
  missingByPriority: { high: number; medium: number };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/dashboard`;

  getSummary(): Observable<DashboardSummary> {
    return this.http
      .get<ApiResponse<DashboardSummary>>(`${this.base}/summary`)
      .pipe(map((r) => r.data));
  }
}
