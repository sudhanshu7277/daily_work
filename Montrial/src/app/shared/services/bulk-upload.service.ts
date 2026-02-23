import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BulkUploadService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://dummyjson.com/users/add';

  uploadProfiles(file: File): Observable<any[]> {
    // In a real app, you'd use FormData. 
    // Here we simulate the API returning processed profiles.
    return this.http.post<any>(this.API_URL, { firstName: 'Bulk', lastName: 'User' }).pipe(
      map(res => [{
        ocifId: `BULK-${Math.floor(Math.random() * 1000)}`,
        legalName: 'Imported Entity - ' + file.name,
        status: 'PENDING',
        isParent: false
      }])
    );
  }
}