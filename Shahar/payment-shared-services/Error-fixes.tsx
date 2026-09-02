ngOnChanges(changes: SimpleChanges): void {
  if (this.preserveGrid) {
    this.preserveGrid = false;
    return;
  }

  if (changes['multiLevelGridData'] && this.multiLevelGridData) {
    const prev = changes['multiLevelGridData'].previousValue;
    const curr = changes['multiLevelGridData'].currentValue;
    if (curr && curr !== prev) {
      this.isLoading = true;
      this.loadError = false;
      this.handleResponse(this.mapApiResponse(curr));
      this.syncColumns();
    }
  }
}