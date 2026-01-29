//input.service.ts

// app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... other providers
  ]
};


// data.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient); // Modern way to inject
  private apiUrl = 'https://api.example.com/items';

  addItem(itemData: any): Observable<any> {
    return this.http.post(this.apiUrl, itemData);
  }
}

// app.component.ts
import { Component, inject } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <button (click)="submitData()">Send Data</button>
  `
})
export class AppComponent {
  private dataService = inject(DataService);

  submitData() {
    const payload = { name: 'New Item', price: 100 };

    this.dataService.addItem(payload).subscribe({
      next: (response) => {
        console.log('Success!', response);
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
}
