export interface AddressLookupResponse {
    addressLine?: string[];
    streetName?: string;
    buildingNumber?: string;
    postalCode?: string;
    townName?: string;
    countrySubDivision?: string;
    state?: string;
    countryCode?: string;
  }
  
  export async function lookupDebtorAddresss(
    endpoint: string,
    request: { account: string; bic: string; countryCode: string }
  ): Promise<AddressLookupResponse> {
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const res = await fetch(`${cleanEndpoint}/debtor/address-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(body?.error || body?.message || `Debtor address lookup failed (${res.status})`);
      err.error = body;
      throw err;
    }
    return body as AddressLookupResponse;
  }
  
  export async function lookupCreditorAddesss(
    endpoint: string,
    request: { bic: string; countryCode: string; shortCode: string }
  ): Promise<AddressLookupResponse> {
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const res = await fetch(`${cleanEndpoint}/creditor/address-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(body?.error || body?.message || `Creditor address lookup failed (${res.status})`);
      err.error = body;
      throw err;
    }
    return body as AddressLookupResponse;
  }
  
  export const addressService = {
    lookupDebtorAddresss,
    lookupCreditorAddesss
  };