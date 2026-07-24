// The fix — guard handleResponse with a mapped data check in ngOnChanges:

ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerGridData'] && 
        this.customerGridData && 
        this.customerGridData.length) {
      this.isLoading = true;
      this.loadError = false;
      const prev = changes['customerGridData'].previousValue;
      const curr = changes['customerGridData'].currentValue;
      if (curr && curr !== prev) {
        // Map first — only proceed if mapping produces real data
        const mapped = this.mapApiResponse(this.customerGridData);
        
        if (mapped?.data?.length > 0) {
          // Real data — re-render grid
          this.handleResponse(mapped);
          this.syncColumns();
        } else {
          // Mapping produced empty — data format mismatch from session storage
          // Keep grid exactly as is, just stop loading
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }
    }
  }