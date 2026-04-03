// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CheckerFormComponent,
  CheckerComponentInput,
  CheckerActionResponse
} from 'payment-checker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CheckerFormComponent],
  template: `
    <pc-checker-form
      [checkerInput]="checkerInput"
      (actionCompleted)="onActionCompleted($event)"
    ></pc-checker-form>
  `
})
export class AppComponent {

  // Parent provides these — matches CheckerComponentInput interface
  checkerInput: CheckerComponentInput = {
    applicationName:   'ADR',
    applicationModule: 'ADR',
    region:            'US',
    checkerGetUrl:     '/api/v1/pain001/checker/get',    // placeholder — mocked
    checkerActionUrl:  '/api/v1/pain001/checker/action', // placeholder — mocked
    headers: {
      'X-Correlation-Id': 'demo-' + Math.random().toString(36).slice(2, 9).toUpperCase()
    }
  };

  onActionCompleted(response: CheckerActionResponse): void {
    console.log('[Demo] Checker action completed:', response);
    // Parent handles navigation / next steps here
  }
}
