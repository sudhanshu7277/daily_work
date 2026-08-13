// Typo names (lookupDebtorAddesss / lookupCreditorAddesss) preserved
// exactly — PaymentChild.tsx calls these exact names, and "faithful port"
// means matching the real source, typos included.

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

/** Called as: addressService.lookupDebtorAddesss(endpoint, { account, bic, countryCode }) */
export async function lookupDebtorAddesss(
  endpoint: string,
  request: { account: string; bic: string; countryCode: string }
): Promise<AddressLookupResponse> {
  const res = await fetch(`${endpoint}/debtor/address-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((body && (body.error || body.message)) || `Debtor address lookup failed (${res.status})`);
    err.error = body;
    throw err;
  }
  return body as AddressLookupResponse;
}

/** Called as: addressService.lookupCreditorAddesss(endpoint, { bic, countryCode, shortCode }) */
export async function lookupCreditorAddesss(
  endpoint: string,
  request: { bic: string; countryCode: string; shortCode: string }
): Promise<AddressLookupResponse> {
  const res = await fetch(`${endpoint}/creditor/address-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((body && (body.error || body.message)) || `Creditor address lookup failed (${res.status})`);
    err.error = body;
    throw err;
  }
  return body as AddressLookupResponse;
}
