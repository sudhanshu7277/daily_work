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