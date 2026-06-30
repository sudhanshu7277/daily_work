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


  // LATEST CUSTOMER GRID RESPONSE MAPPER

  private extractOcifId(p: any): string {
    if (Array.isArray(p.identifier)) {
      return p.identifier.find((i: any) => i.idType === 'OCIFID')?.idValue ?? '';
    }
    return p.fileNetId ?? p.ocifId ?? ''; // fallback for the old flat-fileNetId child shape
  }
  
  private formatAddress(address: any): string {
    const a = Array.isArray(address) ? address[0] : address;
    if (!a) return '';
    if (typeof a === 'string') return a; // backward-compat with the flat-string shape
    const street = a.addressLineOne || [a.streetNumber, a.streetName].filter(Boolean).join(' ');
    return [street, a.addressLineTwo, a.city, a.province, a.postalCode, a.country].filter(Boolean).join(', ');
  }
  
  private mapPlayer = (p: any): any => ({
    legalName:      p.profileName ?? '',
    ocifId:         this.extractOcifId(p),
    status:         p.legalHoldStatus || 'N/A',
    holdName:       p.legalHoldName ?? '',   // not in this schema — will render blank, see note
    lifecycle:      p.customerLifecycleStatus ? `${p.customerLifecycleStatus} Customer` : 'N/A',
    roleType:       p.roleType ?? '',        // not in this schema — will render blank, see note
    address:        this.formatAddress(p.address),
    customerStatus: p.customerLifecycleStatus ?? '',
    // carried, no columns yet (per your earlier call)
    firstName: p.firstName ?? '', lastName: p.lastName ?? '', dateOfBirth: p.dateOfBirth ?? '',
    emailAddress: p.emailAddress ?? '', phoneNumber: p.phoneNumber ?? '', partyType: p.partyType ?? '',
    eDiscoveryProjectManager: p.eDiscoveryProjectManager ?? '',
    responsibleLawyerEmail:   p.responsibleLawyerEmail ?? '',
    holdId: p.holdId ?? '', holdsIdPk: p.holdsIdPk ?? '',
    holdApplyDate: p.holdApplyDate ?? '', holdReleaseDate: p.holdReleaseDate ?? '', holdLastUpdateDate: p.holdLastUpdateDate ?? '',
    suspectProfile: p.suspectProfile === 'Yes',
    isParent:   Array.isArray(p.rolePlayers) && p.rolePlayers.length > 0,
    isExpanded: false,
    children:   (p.rolePlayers ?? []).map((rp: any) => this.mapPlayer(rp)),
  });
  
  private mapApiResponse(res: any): { totalCount: number; data: any[] } {
    const results = res?.searchResult ?? res?.searchResults ?? (Array.isArray(res) ? res : []);
    const data = results.map((p: any) => this.mapPlayer(p));
    return { totalCount: data.length, data };
  }