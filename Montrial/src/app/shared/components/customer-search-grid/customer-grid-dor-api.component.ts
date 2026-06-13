import { OnChanges, SimpleChanges } from '@angular/core';

export class CustomerSearchGridComponent implements OnInit, OnDestroy, OnChanges {

  @Input() firstName = '';
  @Input() lastName  = '';

  // Receives the raw API response { profiles: [...] } from legal-hold-shell
  @Input() apiResponse: any = null;

  // ... existing code ...

  ngOnInit(): void {
    // Skip dummy/default load when real data arrives via @Input
    if (!this.apiResponse) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apiResponse'] && this.apiResponse) {
      this.isLoading = false;
      this.loadError = false;
      this.handleResponse(this.mapApiResponse(this.apiResponse));
    }
  }

  // ── Maps real API shape → GridRow shape expected by handleResponse ─────────
  private mapApiResponse(res: any): { totalCount: number; data: any[] } {
    const profiles = res?.profiles ?? [];

    const data = profiles.map((p: any) => ({
      legalName:      p.profileName ?? '',
      ocifId:         p.proxyOcifId ?? '',
      status:         p.legalHoldStatus ? 'LEGAL HOLD' : 'N/A',
      holdName:       p.legalHoldName ?? '',
      lifecycle:      p.customerLifecycleStatus
                        ? `${p.customerLifecycleStatus} Customer`
                        : 'N/A',
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
    console.log('handleResponse received:', res);
    this.tree = res.data as GridRow[];
    console.log('this.tree after assignment:', this.tree);
    this.stampTree(this.tree, '');
    this.currentPage = 1;
    this.isLoading   = false;
    this.refresh();
  }

  // ── Maps real API shape { profiles: [...] } → GridRow shape ────────────────
private mapApiResponse(res: any): { totalCount: number; data: any[] } {
    const profiles = res?.profiles ?? [];
    console.log('mapApiResponse - profiles found:', profiles);
  
    const data = profiles.map((p: any) => ({
      legalName:      p.profileName ?? '',
      ocifId:         p.proxyOcifId ?? '',
      status:         p.legalHoldStatus ? 'LEGAL HOLD' : 'N/A',
      holdName:       p.legalHoldName ?? '',
      lifecycle:      p.customerLifecycleStatus
                        ? `${p.customerLifecycleStatus} Customer`
                        : 'N/A',
      roleType:       p.roleType ?? '',
      address:        p.address ?? '',
      customerStatus: p.customerLifecycleStatus ?? '',
      isParent:       false,
      isExpanded:     false,
      children:       [],
    }));
  
    console.log('mapApiResponse - mapped data:', data);
    return { totalCount: data.length, data };
  }
}