import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BulkUploadService {
  private http = inject(HttpClient);
  // Using dummyjson's add user endpoint
  private readonly API_URL = 'https://dummyjson.com/users/add';

  uploadProfiles(file: File): Observable<any[]> {
    // In a real scenario, use FormData:
    // const formData = new FormData();
    // formData.append('file', file);
    
    return this.http.post<any>(this.API_URL, { 
      firstName: 'Imported', 
      lastName: file.name 
    }).pipe(
      delay(1000), // Simulate network lag
      map(res => [{
        ocifId: `UP-${res.id}-${Math.floor(Math.random() * 1000)}`,
        legalName: `Bulk: ${file.name} - ${res.firstName}`,
        status: 'ACTIVE',
        isParent: false,
        children: []
      }])
    );
  }
}