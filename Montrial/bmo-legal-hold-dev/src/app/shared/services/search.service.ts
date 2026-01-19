import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  results = signal<any[]>([]);
  selectedProfiles = signal<any[]>([]);
  activeFilters = signal<string[]>(['File Net ID', 'Legal Hold Status', 'Legal Hold Name', 'Customer Lifecycle Status', 'Role Type', 'Address']);

  performSearch(criteria: any) {
    // Dummy Data with multiple "Jane Doe" records to test sorting and selection
    const dummyData = [
      { legalName: 'Jane Doe', ocifId: '1000-12345', status: 'LEGAL HOLD', holdName: 'Legal Hold Re Placeholder', lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
      { legalName: 'Jane Doe', ocifId: '1000-54321', status: 'LEGAL HOLD', holdName: 'Legal Hold Re Placeholder', lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W, Toronto, ON M5G 2C3' },
      { legalName: 'John Smith', ocifId: '2000-11111', status: 'RELEASED', holdName: 'Project Delta', lifecycle: 'Active Customer', role: 'Owner', address: '50 Bay St, Toronto, ON M5J 2L2' }
    ];
    this.results.set(dummyData);
  }

  resetFilters() {
    this.activeFilters.set([]);
  }
}