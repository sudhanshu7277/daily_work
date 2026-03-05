import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DynamicCrudService {
  private http = inject(HttpClient);

  execute(config: { url: string, method: string }, payload?: any): Observable<any> {
    const method = config.method.toUpperCase();
    if (method === 'POST') return this.http.post(config.url, payload);
    if (method === 'PUT') return this.http.put(config.url, payload);
    return this.http.get(config.url, { params: payload });
  }
}