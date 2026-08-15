// Solution 1: Use an RxJS Subject for Action Events (Recommended)
1. Update internal-shared-data.service.ts

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InternalSharedDataService {
  private readonly hideBannerSubject = new Subject<void>();
  readonly hideBanner$ = this.hideBannerSubject.asObservable();

  triggerHideBanner(): void {
    this.hideBannerSubject.next();
  }
}


// 2. Update legal-hold-shell.component.ts
Subscribe to the stream in ngOnInit():


import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';

export class LegalHoldShellComponent implements OnInit, OnDestroy {
  checkInHistoryMsg: boolean = false;
  private bannerSub?: Subscription;

  private readonly internalSharedService = inject(InternalSharedDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    sessionStorage.clear();

    // Listen to every user interaction event from other components
    this.bannerSub = this.internalSharedService.hideBanner$.subscribe(() => {
      if (this.checkInHistoryMsg) {
        this.hideCheckInHistoryBanner();
        this.cdr.detectChanges(); // Force view update
      }
    });
  }

  hideCheckInHistoryBanner(): void {
    this.checkInHistoryMsg = false;
  }

  ngOnDestroy(): void {
    this.bannerSub?.unsubscribe();
  }
}


// 3. Trigger it from search-customer.component.ts (or any interacting component)

onUserInteraction(): void {
    this.internalSharedService.triggerHideBanner();
  }


  