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
  isSuspect?: boolean;
  children: EntityNode[];
}

/** EntityNode enriched with view-state fields for the flat grid */
export interface EntityRowNode extends EntityNode {
  _uid: string;
  _level: number;
  _isParent: boolean;
  _expanded: boolean;
  _selected: boolean;
  _isClusterEnd: boolean;
  children: EntityRowNode[];
}

export interface EntitySelectionEvent {
  selectedRows: EntityRowNode[];
  selectedClusters: EntityRowNode[][];
}

export interface EntityGridResponse {
  data: EntityNode[];
  totalCount: number;
}
