private mapApiResponse(res: any): { totalCount: number; data: any[] } {
    const profiles = res?.profiles ?? [];

    const data = profiles.map((p: any) => ({
      legalName:    p.profileName ?? '',
      ocifId:       p.proxyOcifId ?? '',
      status:       p.legalHoldStatus ? 'LEGAL HOLD' : 'N/A',
      holdName:     p.legalHoldName ?? '',
      lifecycle:    p.customerLifecycleStatus
                      ? `${p.customerLifecycleStatus} Customer`
                      : 'N/A',
      roleType:     p.roleType ?? '',
      address:      p.address ?? '',
      customerStatus: p.customerLifecycleStatus ?? '',
      isParent:     false,
      isExpanded:   false,
      children:     [],
    }));

    return {
      totalCount: data.length,
      data,
    };
  }

  // tree

  private handleResponse(res: any): void {
    this.tree = res.data as GridRow[];
    this.stampTree(this.tree, '');
    this.currentPage = 1;
    this.isLoading   = false;
    this.refresh();
  }

  // lets try below code


  // ── Maps real API shape → GridRow shape expected by handleResponse ─────────
private mapApiResponse(res: any): { totalCount: number; data: any[] } {
    const profiles = res?.profiles ?? [];
  
    const data = profiles.map((p: any) => ({
      legalName:      p.profileName ?? '',
      ocifId:         p.proxyOcifId ?? '',
      status:         p.legalHoldStatus ? 'LEGAL HOLD' : 'N/A',
      holdName:       p.legalHoldName ?? '',
      lifecycle:      p.customerLifecycleStatus ?? 'N/A',
      roleType:       p.roleType ?? '',
      address:        p.address ?? '',
      customerStatus: p.customerLifecycleStatus ?? '',
      isParent:       false,
      isExpanded:     false,
      children:       [],
    }));
  
    return { totalCount: data.length, data };
  }
  
  private handleResponse(res: any): void {
    this.tree        = res.data as GridRow[];
    this.stampTree(this.tree, '');
    this.currentPage = 1;
    this.isLoading   = false;
    this.refresh();
  }


  // in api call

  loadData(): void {
    this.isLoading = true;
    this.loadError = false;
    this.svc.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  res => this.handleResponse(this.mapApiResponse(res)),
        error: err => this.handleError(err),
      });
  }
  
  search(): void {
    const request: CustomerSearchRequest = {
      firstName: this.firstName.trim(),
      lastName:  this.lastName.trim(),
    };
    this.isLoading = true;
    this.loadError = false;
    this.svc.searchCustomers(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  res => this.handleResponse(this.mapApiResponse(res)),
        error: err => this.handleError(err),
      });
  }