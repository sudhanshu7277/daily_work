import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TabInfo {
  key: string;
  title: string;
}

@Injectable({
  providedIn: 'root' // Singleton across the app
})
export class TabStateService {
  private currentTabSubject = new BehaviorSubject<TabInfo | null>(null);
  currentTab$ = this.currentTabSubject.asObservable();

  setCurrentTab(tab: TabInfo) {
    this.currentTabSubject.next(tab);
  }

  clearCurrentTab() {
    this.currentTabSubject.next(null);
  }
}