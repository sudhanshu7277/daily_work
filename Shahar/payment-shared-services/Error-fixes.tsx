// 1. Hide the Feature Shell in app.html
// Ensure app-system-failure sits directly inside 
// <main id="main-content"> and completely replaces 
// <router-outlet>, preventing feature headers from showing:


<a class="skip-link" href="#main-content">Skip to main content</a>
<app-header></app-header>

<main id="main-content" class="app-content" tabindex="-1">
  @if (systemStatus.isSystemDown()) {
    <app-system-failure></app-system-failure>
  } @else {
    <router-outlet></router-outlet>
  }
</main>


// 2. Styling Adjustments in system-failure.component.ts


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-failure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-failure-screen">
      <div class="failure-box">
        <img src="assets/maintenance-xl.svg" alt="System Error" class="failure-svg" />
        <p class="failure-text">A system error occurred. Please try again later.</p>
        <button type="button" class="btn-return" (click)="onReturn()">RETURN</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .system-failure-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: calc(100vh - 72px); /* Offsets top header */
      background-color: #f4f6f8;
      box-sizing: border-box;
      padding: 32px 16px;
    }

    .failure-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 440px;
    }

    .failure-svg {
      width: 240px;
      height: auto;
      margin-bottom: 24px;
    }

    .failure-text {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 20px 0;
      line-height: 1.4;
    }

    .btn-return {
      background-color: #0079c1;
      color: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 7px 32px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn-return:hover {
      background-color: #005a91;
    }
  `]
})
export class SystemFailureComponent {
  onReturn(): void {
    window.location.reload();
  }
}