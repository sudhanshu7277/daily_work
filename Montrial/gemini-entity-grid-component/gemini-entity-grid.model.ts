export interface EntityNode {
  ocifId?: string;
  profileName?: string;
  legalHoldStatus?: 'LEGAL HOLD' | 'N/A';
  holdName?: string;
  lifecycle?: string;
  role?: string;
  address?: string;
  isParent?: boolean;
  isExpanded?: boolean;
  isSuspect?: boolean;
  children?: EntityNode[];
  [key: string]: any;
}

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
  identifier: 'entity';
  selected: EntityRowNode[];
  selectedRows?: EntityRowNode[];
  selectedClusters?: EntityRowNode[][];
}

export interface EntityGridResponse {
  data: EntityNode[];
  totalCount: number;
}