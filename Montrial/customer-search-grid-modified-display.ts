private extractOcifId(identifiers: any[]): string {
    return identifiers?.find((i: any) => i.idType === 'OCIFID')?.idValue ?? '';
  }
  
  private mapPlayer = (p: any, isChild = false) => ({
    legalName:      p.profileName ?? '',
    ocifId:         isChild ? (p.fileNetId ?? '') : this.extractOcifId(p.identifier),
    fileNetId:      isChild ? (p.fileNetId ?? '') : '',
    status:         p.legalHoldStatus || 'N/A',
    holdName:       p.legalHoldName ?? '',
    lifecycle:      p.customerLifecycleStatus ? `${p.customerLifecycleStatus} Customer` : 'N/A',
    roleType:       p.roleType ?? '',
    address:        p.address ?? '',
    customerStatus: p.customerLifecycleStatus ?? '',
    phoneNumber:              p.phoneNumber ?? '',
    legalHoldName:            p.legalHoldName ?? '',
    suspectProfile:           p.suspectProfile === 'Yes',
    isParent:   !isChild && Array.isArray(p.rolePlayers) && p.rolePlayers.length > 0,
    isExpanded: false,
    children:   isChild ? [] : (p.rolePlayers ?? []).map((rp: any) => this.mapPlayer(rp, true)),
  });
  
  private mapApiResponse(res: any): { totalCount: number; data: any[] } {
    const results = res?.searchResults ?? (Array.isArray(res) ? res : []);
    const data = results.map((p: any) => this.mapPlayer(p, false));
    return { totalCount: data.length, data };
  }