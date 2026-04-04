import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MakerFormComponent,
  PaymentComponentInput,
  MakerSubmitResponse
} from 'payment-maker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MakerFormComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  paymentInput: PaymentComponentInput = {
    applicationName:   'ADR',
    applicationModule: 'ADR',
    region:            'US',
    makerSubmitUrl:    '/api/v1/pain001/maker/submit',
    hardcapCheckUrl:   '/api/v1/pain001/hardcap/check',
    headers: {
      'X-Correlation-Id': this.correlationId()
    }
  };

  lastResponse: MakerSubmitResponse | null = null;

  onSubmitted(response: MakerSubmitResponse): void {
    console.log('[Demo] Maker submitted:', response);
    this.lastResponse = response;
  }

  private correlationId(): string {
    return 'demo-' + Math.random().toString(36).slice(2, 9).toUpperCase();
  }
}
