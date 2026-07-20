// Ported from address.service.ts (PaymentAddressService) — see memory:
// ss-payment-flow-validation-address-capture.md. Method name typos
// (lookupDebtorAddesss / lookupCreditorAddesss) are REAL in the source and
// are preserved deliberately here, on both the service and every call site.

export interface AddressDetailsRequest {
  account?: string;
  bic?: string;
  countryCode?: string;
  shortCode?: string; // creditor lookup only — see lookupCreditorAddress call site
}

export interface AddressDetailsResponse {
  addressLine: string[]; // array, NOT addressLine1/2 — confirmed mismatch vs Pain001Model's plain-string address fields
  addressLine1?: string;
  addressLine2?: string;
  streetName?: string;
  buildingNumber?: string;
  postalCode?: string;
  townName?: string;
  countrySubDivision?: string;
  state?: string;
  countryCode?: string;
}

/** lookupDebtorAddesss — typo preserved exactly as in the Angular source. */
export async function lookupDebtorAddesss(
  path: string,
  request: AddressDetailsRequest,
): Promise<AddressDetailsResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Debtor address lookup failed: ${response.status}`);
  }
  return response.json();
}

/** lookupCreditorAddesss — typo preserved exactly as in the Angular source. */
export async function lookupCreditorAddesss(
  path: string,
  request: AddressDetailsRequest,
): Promise<AddressDetailsResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Creditor address lookup failed: ${response.status}`);
  }
  return response.json();
}

// FIX (same integration issue as hardCapService): previously only exported
// the two loose functions. Adding a named service-object export for
// projects that import it the class-instance way
// (`addressService.lookupDebtorAddesss(...)`), plus a default export, so
// whichever import convention your project uses will resolve. The typo'd
// method names are preserved on the object too — do not "fix" them, they
// match the real Angular source.
export const addressService = { lookupDebtorAddesss, lookupCreditorAddesss };

export default addressService;
