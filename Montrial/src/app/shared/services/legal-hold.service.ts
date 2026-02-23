import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LegalHoldService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://dummyjson.com/users';

  /**
   * SEARCH / READ (POST simulation)
   * Fetches filtered data based on the payload from search components.
   */
  getProfiles(query?: string): Observable<any[]> {
    // DummyJSON uses /search?q= for filtering
    const url = query ? `${this.API_URL}/search?q=${query}` : this.API_URL;
    
    return this.http.get<any>(url).pipe(
      map(res => res.users.map((u: any) => this.transformToGridModel(u)))
    );
  }

  /**
   * CREATE (POST)
   * Used for adding new profiles manually or via Bulk Upload bridge.
   */
  addProfile(profile: any): Observable<any> {
    return this.http.post(`${this.API_URL}/add`, profile).pipe(
      map(res => this.transformToGridModel(res))
    );
  }

  /**
   * UPDATE (PUT)
   * Updates an existing profile's details globally.
   */
  updateProfile(id: string, changes: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, changes).pipe(
      map(res => this.transformToGridModel(res))
    );
  }

  /**
   * DELETE
   * Removes a profile from the database.
   */
  deleteProfile(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  /**
   * TRANSFORMATION LOGIC
   * Maps DummyJSON User model to your specific Ag-Grid Model
   * (isParent, isChild, ocifId, etc.)
   */
  private transformToGridModel(user: any): any {
    const isParent = user.id % 5 === 0; // Simulated logic for Parent rows
    
    return {
      ocifId: user.id.toString(),
      legalName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      status: user.age > 40 ? 'LEGAL HOLD' : 'ACTIVE',
      holdName: user.company?.name || 'N/A',
      lifecycle: 'Retention',
      role: user.role || 'Custodian',
      address: `${user.address?.address}, ${user.address?.city}`,
      isParent: isParent,
      isExpanded: false,
      // Create dummy children if this is a parent
      children: isParent ? [
        { 
          ocifId: `${user.id}-C1`, 
          legalName: `${user.lastName} Holdings LLC`, 
          isChild: true,
          status: 'ACTIVE' 
        },
        { 
          ocifId: `${user.id}-C2`, 
          legalName: `${user.firstName} Trust`, 
          isChild: true,
          status: 'LEGAL HOLD' 
        }
      ] : []
    };
  }
}