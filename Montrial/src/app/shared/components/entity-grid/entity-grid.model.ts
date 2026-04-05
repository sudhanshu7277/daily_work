export interface EntityNode {
  ocifId: string;
  profileName: string;
  legalHoldStatus: 'LEGAL HOLD' | 'N/A';
  holdName: string;
  lifecycle: string;
  role: string;
  address: string;
  isParent: boolean;
  isExpanded: boolean;
  children: EntityNode[];
}

export interface EntityGridResponse {
  data: EntityNode[];
  totalCount: number;
}
