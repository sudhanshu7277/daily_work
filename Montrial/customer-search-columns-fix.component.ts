// Step 1: Add Defensive Logging to LegalHoldShellComponent

loadCachedIndividualAndEntityProfiles(): void {
    const individualValues = this.sessionStorageService.getItem<any>('individualSearchResult');
    console.log('📦 Raw cached individualValues:', individualValues);
  
    if (individualValues) {
      // Handle stringified JSON, direct array, or nested object property
      const parsed = typeof individualValues === 'string' ? JSON.parse(individualValues) : individualValues;
      const list = Array.isArray(parsed) ? parsed : (parsed.data || parsed.profiles || parsed.items || []);
      
      if (list.length > 0) {
        this.customerGridData = [...list];
        console.log('✅ Updated customerGridData count:', this.customerGridData.length);
      }
    }
  
    const entityValues = this.sessionStorageService.getItem<any>('entitySearchResult');
    console.log('📦 Raw cached entityValues:', entityValues);
  
    if (entityValues) {
      const parsedEntity = typeof entityValues === 'string' ? JSON.parse(entityValues) : entityValues;
      const entityList = Array.isArray(parsedEntity) ? parsedEntity : (parsedEntity.data || parsedEntity.profiles || parsedEntity.items || []);
      
      if (entityList.length > 0) {
        this.entityGridData = [...entityList];
        console.log('✅ Updated entityGridData count:', this.entityGridData.length);
      }
    }
  
    // 🛑 CRITICAL CHECK: Ensure flags that toggle the grid view aren't hiding it
    // Check your shell component for flags like these and set them explicitly:
    this.isLoading = false; 
    this.loadError = false;
    // If you have a flag like showGrid, hasSearched, or showResultsSection, set it to true here:
    // this.hasSearched = true;
  
    this.cdr.detectChanges();
  }

  // Step 2: Check the HTML Shell Template (legal-hold-shell.component.html)

  <!-- Recommended Shell Template setup -->
<div [hidden]="isLoading || loadError">
  <app-customer-search-grid 
    *ngIf="customerGridData?.length" 
    [customerGridData]="customerGridData">
  </app-customer-search-grid>
</div>

// Step 3: Check Child Grid Template (customer-search-grid.component.html)

ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerGridData']) {
      const rawData = changes['customerGridData'].currentValue || [];
      // Ensure 'tree' or 'rowData' gets set immediately
      this.tree = [...rawData]; 
      this.rowData = [...rawData];
      this.cdr.detectChanges();
    }
  }

  //Update displayHistoryMsgOnTop() in legal-hold-shell.component.ts:

  displayHistoryMsgOnTop(msg: any): void {
    console.log('showHistoryMsg : ', msg.showHistoryMsg);
  
    if (msg.showHistoryMsg) {
      // 1. Force remove aria-hidden from app-root/DOM if a modal left it locked
      const appRoot = document.querySelector('app-root');
      if (appRoot) {
        appRoot.removeAttribute('aria-hidden');
      }
  
      // 2. Unfocus active button so DOM focus doesn't lock the app shell
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
  
      // 3. Load the cached data
      this.loadCachedIndividualAndEntityProfiles();
  
      // 4. Show banner
      this.checkInHistoryMsg = true;
  
      // 5. Force Change Detection
      this.cdr.detectChanges();
    }
  }

  // Add this check in loadCachedIndividualAndEntityProfiles():

  // If individual data is present but entity is empty, ensure the view stays on Individual tab
if (this.customerGridData?.length > 0 && (!this.entityGridData || this.entityGridData.length === 0)) {
    this.activeTab = 'INDIVIDUAL'; // or whatever property tracks your active tab
  }

  // 

  import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';

export class CustomerSearchGridComponent implements OnChanges {
  @Input() customerGridData: any[] = [];
  
  // Your grid data properties
  rowData: any[] = [];
  tree: any[] = []; // If you use tree or another structured format for AG-Grid

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerGridData']) {
      const prev = changes['customerGridData'].previousValue;
      const curr = changes['customerGridData'].currentValue;

      // 🟢 Compare references or lengths to ensure valid incoming data
      if (curr && curr !== prev) {
        console.log('🔄 customer-search-grid ngOnChanges detected data update:', curr.length);
        
        // Re-assign your rowData/tree using a fresh reference
        this.rowData = [...curr];
        this.tree = [...curr];

        // Trigger local change detection so AG-Grid immediately re-renders
        this.cdr.detectChanges();
      }
    }
  }
}