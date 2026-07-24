ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerGridData'] && 
        this.customerGridData && 
        this.customerGridData.length) {
      this.isLoading = true;
      this.loadError = false;
      const prev = changes['customerGridData'].previousValue;
      const curr = changes['customerGridData'].currentValue;
      if (curr && curr !== prev) {
        let temp = curr;
        this.customerGridData = temp;
        this.cdr.detectChanges();
      }
    }
  
    // ← ADD THIS GUARD — only run if there's actual data
    if (this.customerGridData && this.customerGridData.length) {
      this.handleResponse(this.mapApiResponse(this.customerGridData));
      this.syncColumns();
    }
  }



  // Add class property
private lastRawSearchResults: any[] = [];

// Right where you currently set customerGridData after a search
this.customerGridData = [...results];
this.lastRawSearchResults = [...results]; // ← ADD: keep raw copy
  // 


  displayHistoryMsgOnTop(msg: any): void {
    if (msg.showHistoryMsg) {
      const appRoot = document.querySelector('app-root');
      if (appRoot) appRoot.removeAttribute('aria-hidden');
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
  
      // Restore grid from last raw search — skip loadCached entirely
      if (this.lastRawSearchResults.length) {
        this.customerGridData = [...this.lastRawSearchResults];
      }
  
      this.checkInHistoryMsg = true;
      this.cdr.detectChanges();
    }
  }