import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, Client, Country, Deal, Region, User } from '../models';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/lookups`;

  getRegions(): Observable<Region[]> {
    return this.http.get<ApiResponse<Region[]>>(`${this.base}/regions`).pipe(map((r) => r.data));
  }

  getCountries(regionId?: string): Observable<Country[]> {
    let params = new HttpParams();
    if (regionId) params = params.set('regionId', regionId);
    return this.http
      .get<ApiResponse<Country[]>>(`${this.base}/countries`, { params })
      .pipe(map((r) => r.data));
  }

  getClients(countryId?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (countryId) params = params.set('countryId', countryId);
    return this.http
      .get<ApiResponse<Client[]>>(`${this.base}/clients`, { params })
      .pipe(map((r) => r.data));
  }

  getDeals(clientId?: string): Observable<Deal[]> {
    let params = new HttpParams();
    if (clientId) params = params.set('clientId', clientId);
    return this.http
      .get<ApiResponse<Deal[]>>(`${this.base}/deals`, { params })
      .pipe(map((r) => r.data));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.base}/users`).pipe(map((r) => r.data));
  }
}
