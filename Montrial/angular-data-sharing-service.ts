// Approach 1: Shared Service with Angular Signals (Recommended)
//Signals provide reactive state without needing manual subscriptions or cleanup.
// 1. Create the Shared Service

// shared-data.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  // Writable signal holds the internal state
  private readonly dataSignal = signal<string | null>(null);

  // Read-only signal exposed to consumers
  readonly data = this.dataSignal.asReadonly();

  updateData(newData: string): void {
    this.dataSignal.set(newData);
  }

  clearData(): void {
    this.dataSignal.set(null);
  }
}


// 2. Component A: Send Data

// component-a.component.ts
import { Component, inject } from '@angular/core';
import { SharedDataService } from './shared-data.service';

@Component({
  selector: 'app-component-a',
  standalone: true,
  template: `
    <button (click)="sendPayload()">Send Data to Component B</button>
  `
})
export class ComponentA {
  private readonly sharedService = inject(SharedDataService);

  sendPayload(): void {
    this.sharedService.updateData('Hello from Component A!');
  }
}

// 3. Component B: Receive Data

// component-b.component.ts
import { Component, inject } from '@angular/core';
import { SharedDataService } from './shared-data.service';

@Component({
  selector: 'app-component-b',
  standalone: true,
  template: `
    <div>Current Data: {{ currentData() ?? 'No data received' }}</div>
  `
})
export class ComponentB {
  private readonly sharedService = inject(SharedDataService);

  // Directly bind the read-only signal in the template
  readonly currentData = this.sharedService.data;
}


// Method 1: Template Event Binding (focus)
//The most common and direct approach binds (focus) directly in your template:

<!-- my-component.component.html -->
<input 
  type="text" 
  placeholder="Enter name" 
  (focus)="onInputFocus($event)"
  (blur)="onInputBlur($event)" />


  // my-component.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  templateUrl: './my-component.component.html'
})
export class MyComponent {
  onInputFocus(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Input focused:', inputElement.value);
  }

  onInputBlur(event: FocusEvent): void {
    console.log('Input lost focus');
  }
}


//////////

import { Component, OnInit, ChangeDetectorRef, inject, effect } from '@angular/core';

export class LegalHoldShellComponent implements OnInit {
  checkInHistoryMsg: boolean = false; // or true by default
  // ... other properties

  private readonly azureSsoService = inject(AzureSsoService);
  private readonly internalSharedService = inject(InternalSharedDataService);

  constructor(
    private actualCustServ: ActualCustomerSearchService,
    private readonly cdr: ChangeDetectorRef,
    private LegalHoldDataService: LegalHoldDataService,
    private sessionStorageService: SessionStorageService
  ) {
    // Angular effect reactively listens to signal changes across the entire lifecycle
    effect(() => {
      const data = this.internalSharedService.data();
      if (data) {
        this.checkInHistoryMsg = false; // Set banner visibility flag to false
        this.hideCheckInHistoryBanner?.(); // Call hide method if defined
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    sessionStorage.clear();
  }

  hideCheckInHistoryBanner(): void {
    this.checkInHistoryMsg = false;
  }
}