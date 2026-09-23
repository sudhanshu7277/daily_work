// Step 1: Remove setSystemDown from auth-token.interceptor.tsIn 
// src/app/core/auth-token.interceptor.ts (image_27.png), 
// update handleHttpError so it only triggers setSystemDown 
// if the browser itself is offline (!navigator.onLine):   
// Change lines 22–29 in auth-token.interceptor.ts from:   


private handleHttpError(error: any): Observable<never> {
  if (error instanceof HttpErrorResponse) {
    // Only set system down if the browser actually lost internet connectivity
    if (!navigator.onLine) {
      this.systemStatusService.setSystemDown(true);
    }
  }
  return throwError(() => error);
}


// Step 2: Ensure SystemStatusService Exclusively Tracks Internet StatusYour 
// system-status.service.ts in image_26.png already tracks 
// window.addEventListener('offline') and ('online').   
// Make sure setSystemDown validates navigator.onLine so 
// nothing else can accidentally turn it on:


import { Injectable, signal, NgZone, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  private readonly ngZone = inject(NgZone);

  // Strictly checks whether the internet is connected
  readonly isSystemDown = signal<boolean>(!navigator.onLine);

  constructor() {
    window.addEventListener('offline', () => {
      this.ngZone.run(() => {
        this.isSystemDown.set(true);
      });
    });

    window.addEventListener('online', () => {
      this.ngZone.run(() => {
        this.isSystemDown.set(false);
      });
    });
  }

  setSystemDown(state: boolean): void {
    // Only allow setting to true if the internet is genuinely offline
    if (state && navigator.onLine) {
      return;
    }
    this.isSystemDown.set(state);
  }
}
