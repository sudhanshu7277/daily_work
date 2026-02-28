import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormCrudService {
  private http = inject(HttpClient);

  // Fetches data and maps it to a standard {label, value} format
  getOptions(url: string): Observable<any[]> {
    return this.http.get<any[]>(url).pipe(
      map(data => data.map(item => ({
        label: item.name || item.title || item.label,
        value: item.id || item.value
      })))
    );
  }

  postData(url: string, payload: any): Observable<any> {
    return this.http.post(url, payload);
  }
}