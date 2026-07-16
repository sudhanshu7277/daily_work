// Updated formatAddress:

private formatAddress(address: any): string {
    if (!address) return '';
    if (typeof address === 'string') return address;
  
    // Real response: outer wrapper has a nested "address" object
    const inner = address.address ?? address;
  
    const street = inner.addressLineOne
      || [inner.streetNumber, inner.streetName, inner.streetSuffix].filter(Boolean).join(' ');
    const province = inner.provinceStateTypeValue ?? inner.province ?? '';
    const postal   = inner.zipPostalCode ?? inner.postalCode ?? '';
    const country  = inner.countryTypeValue ?? inner.country ?? '';
  
    return [street, inner.addressLineTwo, inner.city, province, postal, country]
      .filter(Boolean).join(', ');
  }

  // Problem 2: extractOcifId — ecifId is now a flat field, fileNetId is now an object

  private extractOcifId(p: any): string {
    // Real response: ecifId is a flat field
    if (p.ecifId) return p.ecifId;
    // Earlier schema: identifier array with OCIFID type
    if (Array.isArray(p.identifier)) {
      return p.identifier.find((i: any) => i.idType === 'OCIFID')?.idValue ?? '';
    }
    // fileNetId is now an object — pull identificationNumber
    if (p.fileNetId?.identificationNumber) return p.fileNetId.identificationNumber;
    return '';
  }

// Problem 3: mapPlayer — two field name fixes

private mapPlayer = (p: any): any => ({
    legalName:      p.profileName ?? '',
    ocifId:         this.extractOcifId(p),
    status:         p.legalHoldStatus || 'N/A',
    holdName:       p.holdName ?? p.legalHoldName ?? '',  // real field is holdName, not legalHoldName
    lifecycle:      p.customerLifecycleStatus ?? 'N/A',   // already "Active Customer" — don't append " Customer" again
    roleType:       p.roleType ?? '',
    address:        this.formatAddress(p.address),
    customerStatus: p.customerLifecycleStatus ?? '',
    eDiscoveryProjectManager: p.eDiscoveryProjectManager ?? '',
    responsibleLawyerEmail:   p.responsibleLawyerEmail ?? '',
    phoneNumber:    p.phoneNumber ?? '',
    holdApplyDate:  p.holdApplyDate ?? '',
    holdReleaseDate: p.holdReleaseDate ?? '',
    suspectProfile: p.suspectProfile === 'Yes',
    isParent:   Array.isArray(p.rolePlayers) && p.rolePlayers.length > 0,
    isExpanded: false,
    children:   (p.rolePlayers ?? []).map((rp: any) => this.mapPlayer(rp)),
  });


  