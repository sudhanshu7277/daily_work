// ─────────────────────────────────────────────────────────────────────────────
// CustomerNode — one row returned by the search API.
// Parents have children; leaf nodes have an empty children array.
// ─────────────────────────────────────────────────────────────────────────────
export interface CustomerNode {
  firstName:      string;
  lastName:       string;
  legalName:      string;      // derived: firstName + ' ' + lastName
  ocifId:         string;
  status:         'LEGAL HOLD' | 'N/A';
  holdName:       string;
  lifecycle:      string;
  role:           string;
  address:        string;
  customerStatus: string;
  roleType:       string;
  isParent:       boolean;
  isExpanded:     boolean;
  children:       CustomerNode[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomerSearchRequest — POST body sent to the search endpoint.
// ─────────────────────────────────────────────────────────────────────────────
export interface CustomerSearchRequest {
  firstName: string;
  lastName:  string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomerSearchResponse — shape of the API response.
// ─────────────────────────────────────────────────────────────────────────────
export interface CustomerSearchResponse {
  data:       CustomerNode[];
  totalCount: number;
}
