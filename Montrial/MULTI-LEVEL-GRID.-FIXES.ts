// 1. EntityNameCellComponent (Class & Template Alignment)
//Replace EntityNameCellComponent in entity-grid.component.ts. This aligns class properties (_level, _isParent, _selected, _expanded) with the 
// //template bindings and applies dynamic padding calculated as _level * 24px.


@Component({
    selector: 'app-entity-name-cell',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.Default,
    template: `
      <div class="name-cell" [style.padding-left.px]="_level * 24">
        <span class="cb-wrap" (click)="onCheckClick($event)">
          <span class="cb-box" [class.cb-box--checked]="_selected">
            <svg *ngIf="_selected" viewBox="0 0 12 10" fill="none" width="12" height="10">
              <polyline points="1.5 4.5, 9 11, 1" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </span>
  
        <span class="name-text" [class.name-text--parent]="_isParent">
          {{ toTitleCase(name) }}
        </span>
  
        <span
          *ngIf="isSuspect"
          class="suspect-icon"
          title="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are placed on hold">
          !
        </span>
  
        <button *ngIf="_isParent" class="chevron-btn" (click)="onChevronClick($event)">
          <span class="chevron-icon" [class.chevron-icon--up]="_expanded">
            <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
              <path d="M4.5 7.5l4.5 4.5 4.5-4.5" stroke="#0079C1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
      </div>
    `,
    styles: [`
      :host { display: flex; align-items: center; width: 100%; overflow: hidden; }
      .name-cell { display: flex; align-items: center; gap: 8px; width: 100%; overflow: hidden; }
      .cb-wrap { display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; padding: 2px; }
      .cb-box {
        width: 18px; height: 18px; border-radius: 3px; border: 1.5px solid #96a6b4;
        background: #ffffff; display: flex; align-items: center; justify-content: center;
        transition: background 0.12s, border-color 0.12s; flex-shrink: 0;
      }
      .cb-wrap:hover .cb-box { border-color: #0079C1; }
      .cb-box--checked { background: #0079C1 !important; border-color: #0079C1 !important; }
      .name-text { color: #0079C1; font-size: 13px; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
      .name-text--parent { font-weight: 700; }
      .suspect-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 18px; height: 18px; border-radius: 50%; background-color: #e68a00;
        color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; cursor: pointer; margin-left: 4px;
      }
      .chevron-btn {
        background: none !important; border: none; padding: 2px; cursor: pointer;
        display: inline-flex; align-items: center; flex-shrink: 0; outline: none; margin-left: auto;
      }
      .chevron-btn:hover, .chevron-btn:focus, .chevron-btn:active { background: none !important; }
      .chevron-icon { display: inline-flex; align-items: center; transform: rotate(0deg); transition: transform 0.2s ease; }
      .chevron-icon--up { transform: rotate(180deg); }
    `]
  })
  export class EntityNameCellComponent implements ICellRendererAngularComp {
    name = '';
    _isParent = false;
    _expanded = false;
    _selected = false;
    isSuspect = false;
    _level = 0;
    private uid = '';
    private onCheck!: (uid: string) => void;
    private onToggle!: (uid: string) => void;
  
    constructor(private readonly cdr: ChangeDetectorRef) {}
  
    agInit(p: ICellRendererParams): void {
      this.sync(p);
    }
  
    refresh(p: ICellRendererParams): boolean {
      this.sync(p);
      this.cdr.detectChanges();
      return true;
    }
  
    private sync(p: ICellRendererParams): void {
      const d = p.data as EntityRowNode;
      this.name = String(p.value ?? '');
      this._isParent = !!d?._isParent;
      this._expanded = !!d?._expanded;
      this._selected = !!d?._selected;
      this.isSuspect = !!d?.isSuspect;
      this._level = d?._level ?? 0;
      this.uid = d?._uid ?? '';
      this.onCheck = (p as any).onCheck;
      this.onToggle = (p as any).onToggle;
    }
  
    toTitleCase(str: string): string {
      if (!str) return '';
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  
    onCheckClick(e: MouseEvent): void {
      e.stopPropagation();
      if (this.onCheck && this.uid) {
        this.onCheck(this.uid);
      }
    }
  
    onChevronClick(e: MouseEvent): void {
      e.stopPropagation();
      if (this.onToggle && this.uid) {
        this.onToggle(this.uid);
      }
    }
  }


  // 2. mapPlayer (Dynamic N-Level Array Normalization)
//Update mapPlayer in EntityGridComponent (entity-grid.component.ts) 
// to ensure child arrays (children or rolePlayers) are evaluated by array length rather than truthiness alone.


private mapPlayer = (p: any): any => {
    const rawChildren = (Array.isArray(p.children) && p.children.length > 0)
      ? p.children
      : ((Array.isArray(p.rolePlayers) && p.rolePlayers.length > 0) ? p.rolePlayers : []);
  
    const hasChildren = rawChildren.length > 0;
  
    return {
      profileName: this.toTitleCase(p.profileName) ?? '',
      ocifId: this.extractOcifId(p),
      status: mapLegalHoldStatusToUi(p.legalHoldStatus),
      holdName: p.holdName ?? p.legalHoldName ?? '',
      lifecycle: p.customerLifecycleStatus ?? p.lifecycle ?? 'N/A',
      roleType: p.roleType ?? p.role ?? '',
      address: typeof p.address === 'string' ? p.address : (p.address?.addressLineOne || ''),
      isSuspect: p.isSuspectProfile === 'Yes' || p.isSuspect === true,
      eDiscoveryProjectManager: p.eDiscoveryProjectManager ?? '',
      responsibleLawyerEmail: p.responsibleLawyerEmail ?? '',
      holdApplyDateTime: p.holdApplyDateTime ?? p.holdAppliedDate ?? '',
      holdReleaseDate: p.holdReleaseDate ?? '',
      
      _isParent: hasChildren,
      _expanded: false,
      _selected: false,
      
      children: rawChildren.map((rp: any) => this.mapPlayer(rp))
    };
  };


  // 3. Tree Processing (stampTree, flattenTree, onSortChanged)
//Replace these three methods in EntityGridComponent (entity-grid.component.ts). 
// Passing level + 1 directly inside the function call preserves the parent scope's 
// level variable without variable mutation across sibling iterations.


private stampTree(nodes: EntityRowNode[], parentUid: string, level = 0): void {
    nodes.forEach((node, index) => {
      node._uid = parentUid ? `${parentUid}-${index}` : `r${index}`;
      node._level = level;
      node._isParent = Array.isArray(node.children) && node.children.length > 0;
      node._expanded = node._expanded ?? false;
      node._selected = node._selected ?? false;
      node._isClusterEnd = false;
  
      if (node._isParent && node.children?.length) {
        this.stampTree(node.children, node._uid, level + 1);
      }
    });
  }
  
  private flattenTree(): EntityRowNode[] {
    const flattenedRows: EntityRowNode[] = [];
  
    const recurse = (nodes: EntityRowNode[]) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node._isClusterEnd = false;
        flattenedRows.push(node);
  
        if (node._isParent && node._expanded && node.children?.length) {
          recurse(node.children);
        }
      }
    };
  
    recurse(this.tree);
  
    for (let i = 0; i < flattenedRows.length; i++) {
      const nextIsRoot = flattenedRows[i + 1] && flattenedRows[i + 1]._level === 0;
      const isLastRow = i === flattenedRows.length - 1;
      if (nextIsRoot || isLastRow) {
        flattenedRows[i]._isClusterEnd = true;
      }
    }
  
    return flattenedRows;
  }
  
  onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState().find(s => s.sort != null);
    if (!sortState) {
      this.currentPage = 1;
      this.refresh();
      return;
    }
  
    const field = sortState.colId;
    const dir = sortState.sort as 'asc' | 'desc';
  
    const sortFn = (a: any, b: any) => {
      const valA = (a[field] ?? '').toString().toLowerCase();
      const valB = (b[field] ?? '').toString().toLowerCase();
      return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    };
  
    const sortRecursive = (nodes: EntityRowNode[]) => {
      nodes.sort(sortFn);
      nodes.forEach(n => {
        if (n._isParent && n.children?.length) {
          sortRecursive(n.children);
        }
      });
    };
  
    sortRecursive(this.tree);
    this.currentPage = 1;
    this.refresh();
  }



  ///

  export interface EntityNode {
    ocifId?: string;
    profileName?: string;
    legalHoldStatus?: 'LEGAL HOLD' | 'PROCESSING' | 'N/A' | string;
    holdName?: string;
    lifecycle?: string;
    role?: string;
    roleType?: string;
    address?: string;
    isParent?: boolean;
    isExpanded?: boolean;
    isSuspect?: boolean;
    eDiscoveryProjectManager?: string;
    responsibleLawyerEmail?: string;
    holdApplyDateTime?: string;
    holdReleaseDate?: string;
    children?: EntityNode[];
    rolePlayers?: EntityNode[];
    [key: string]: any;
  }
  
  export interface EntityRowNode extends EntityNode {
    _uid: string;
    _level: number;
    _isParent: boolean;
    _expanded: boolean;
    _selected: boolean;
    _isClusterEnd: boolean;
    children?: EntityRowNode[];
    rolePlayers?: EntityRowNode[];
  }
  
  export interface EntitySelectionEvent {
    identifier: 'entity' | 'customer';
    selected: EntityRowNode[];
    selectedRows?: EntityRowNode[];
    selectedClusters?: EntityRowNode[][];
  }
  
  export interface EntityGridResponse {
    data: EntityNode[];
    totalCount: number;
  }






  //// MORE CHANGES BASED ON MODEL


  // 1. Shared Model Contract (entity-grid.model.ts)

  export interface EntityNode {
    // Common Identifiers & Names
    ocifId?: string;
    profileName?: string;
    firstName?: string;
    lastName?: string;
    legalName?: string;
  
    // Statuses & Holds
    legalHoldStatus?: 'LEGAL HOLD' | 'PROCESSING' | 'N/A' | string;
    status?: 'LEGAL HOLD' | 'PROCESSING' | 'N/A' | string;
    customerStatus?: string;
    holdName?: string;
    lifecycle?: string;
  
    // Roles & Contact
    role?: string;
    roleType?: string;
    address?: string;
  
    // Flags & Metadata
    isParent?: boolean;
    isExpanded?: boolean;
    isSuspect?: boolean;
    eDiscoveryProjectManager?: string;
    responsibleLawyerEmail?: string;
    holdApplyDateTime?: string;
    holdReleaseDate?: string;
  
    // Recursive Tree Properties
    children?: EntityNode[];
    rolePlayers?: EntityNode[];
    [key: string]: any;
  }
  
  export interface EntityRowNode extends EntityNode {
    _uid: string;
    _level: number;
    _isParent: boolean;
    _expanded: boolean;
    _selected: boolean;
    _isClusterEnd: boolean;
    children?: EntityRowNode[];
    rolePlayers?: EntityRowNode[];
  }
  
  export interface EntitySelectionEvent {
    identifier: 'entity' | 'customer';
    selected: EntityRowNode[];
    selectedRows?: EntityRowNode[];
    selectedClusters?: EntityRowNode[][];
  }
  
  export interface EntityGridResponse {
    data: EntityNode[];
    totalCount: number;
  }


  // 2. Updates in MultiLevelCustomerGridComponent (multi-level-customer-grid.component.ts)
//A. Import EntityRowNode
// At the top of multi-level-customer-grid.component.ts:

import { EntityRowNode, EntitySelectionEvent } from './entity-grid.model';


// B. Update Class Properties
// Ensure the class properties use EntityRowNode:

tree: EntityRowNode[] = [];
rowData: EntityRowNode[] = [];


// C. Update Tree & Helper Methods
//Update stampTree, flattenTree, allNodes, and findNode to strictly use EntityRowNode:


private stampTree(nodes: EntityRowNode[], parentUid: string, level = 0): void {
    if (!nodes) return;
    nodes.forEach((node, index) => {
      node._uid = parentUid ? `${parentUid}-${index}` : `r${index}`;
      node._level = level;
      node._isParent = Array.isArray(node.children) && node.children.length > 0;
      node._expanded = node._expanded ?? false;
      node._selected = node._selected ?? false;
      node._isClusterEnd = false;
  
      if (node._isParent && node.children?.length) {
        this.stampTree(node.children, node._uid, level + 1);
      }
    });
  }
  
  private flattenTree(): EntityRowNode[] {
    const flattenedRows: EntityRowNode[] = [];
  
    const recurse = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node._isClusterEnd = false;
        flattenedRows.push(node);
  
        if (node._isParent && node._expanded && node.children?.length) {
          recurse(node.children);
        }
      }
    };
  
    recurse(this.tree);
  
    for (let i = 0; i < flattenedRows.length; i++) {
      const nextIsRoot = flattenedRows[i + 1] && flattenedRows[i + 1]._level === 0;
      const isLastRow = i === flattenedRows.length - 1;
      if (nextIsRoot || isLastRow) {
        flattenedRows[i]._isClusterEnd = true;
      }
    }
  
    return flattenedRows;
  }
  
  private allNodes(): EntityRowNode[] {
    const out: EntityRowNode[] = [];
    const collect = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (const n of nodes) {
        out.push(n);
        if (n.children?.length) {
          collect(n.children);
        }
      }
    };
    collect(this.tree);
    return out;
  }
  
  private findNode(
    uid: string,
    nodes: EntityRowNode[] = this.tree,
    parent: EntityRowNode | null = null
  ): { node: EntityRowNode; parent: EntityRowNode | null } | null {
    if (!nodes) return null;
    for (const n of nodes) {
      if (n._uid === uid) return { node: n, parent };
      if (n.children?.length) {
        const res = this.findNode(uid, n.children, n);
        if (res) return res;
      }
    }
    return null;
  }


