import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  RowClassParams,
  RowSelectedEvent,
  SelectionColumnDef,
} from 'ag-grid-community';

interface ResultsGridInputNode {
  id: string;
  profileName: string;
  ocifId: string;
  legalHoldStatus: 'LEGAL HOLD' | 'N/A';
  holdName: string;
  lifecycle: string;
  role: string;
  address: string;
  isParent?: boolean;
  isExpanded?: boolean;
  children?: ResultsGridInputNode[];
}

interface ResultsGridNode {
  id: string;
  profileName: string;
  legalName: string;
  ocifId: string;
  legalHoldStatus: 'LEGAL HOLD' | 'N/A';
  status: 'LEGAL HOLD' | 'N/A';
  holdName: string;
  lifecycle: string;
  role: string;
  address: string;
  isParent: boolean;
  isExpanded: boolean;
  level: number;
  parentId: string | null;
  rootId: string;
  children: ResultsGridNode[];
}

interface GridFilterOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<ResultsGridNode[]>();

  private gridApi!: GridApi<ResultsGridNode>;
  private isSyncing = false;

  public rowData: ResultsGridNode[] = [];
  public pendingColumnToShow = '';

  public readonly rowSelection = {
    mode: 'multiRow' as const,
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false,
    selectAll: 'all' as const,
  };

  public readonly selectionColumnDef: SelectionColumnDef = {
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    pinned: 'left',
    sortable: false,
    resizable: false,
    suppressHeaderMenuButton: true,
  };

  public readonly defaultColDef: ColDef<ResultsGridNode> = {
    sortable: false,
    resizable: true,
    suppressHeaderMenuButton: true,
  };

  public readonly filterOptions: GridFilterOption[] = [
    { id: 'profileName', label: 'Profile Name' },
    { id: 'ocifId', label: 'Proxy OCIF ID' },
    { id: 'legalHoldStatus', label: 'Legal Hold Status' },
    { id: 'holdName', label: 'Legal Hold Name' },
    { id: 'lifecycle', label: 'Customer Lifecycle Status' },
    { id: 'role', label: 'Role Type' },
    { id: 'address', label: 'Address' },
  ];

  public visibleColumnIds = this.filterOptions.map((item) => item.id);

  public readonly columnDefs: ColDef<ResultsGridNode>[] = [
    {
      field: 'profileName',
      headerName: 'Profile Name',
      minWidth: 260,
      flex: 1.6,
      sortable: true,
      unSortIcon: true,
      cellRenderer: (params: ICellRendererParams<ResultsGridNode>) => this.profileNameRenderer(params),
    },
    { field: 'ocifId', headerName: 'Proxy OCIF ID', minWidth: 145, flex: 1 },
    {
      field: 'legalHoldStatus',
      headerName: 'Legal Hold Status',
      minWidth: 170,
      flex: 1,
      sortable: true,
      unSortIcon: true,
      cellRenderer: (params: ICellRendererParams<ResultsGridNode, ResultsGridNode['legalHoldStatus']>) =>
        params.value === 'LEGAL HOLD'
          ? '<span class="status-pill-blue">LEGAL HOLD</span>'
          : '<span class="status-na">N/A</span>',
    },
    { field: 'holdName', headerName: 'Legal Hold Name', minWidth: 175, flex: 1.2 },
    { field: 'lifecycle', headerName: 'Customer Lifecycle Status', minWidth: 190, flex: 1.3 },
    { field: 'role', headerName: 'Role Type', minWidth: 205, flex: 1.3 },
    { field: 'address', headerName: 'Address', minWidth: 220, flex: 1.5, cellClass: 'address-cell' },
  ];

  public readonly getRowId = (params: GetRowIdParams<ResultsGridNode>): string => params.data.id;

  public readonly getRowClass = (params: RowClassParams<ResultsGridNode>): string => {
    if (!params.data) {
      return '';
    }

    const classes: string[] = [];

    if (params.data.isParent && params.data.isExpanded) {
      classes.push('blue-sandwich-parent');
    }

    if (params.data.level > 0) {
      classes.push('is-child-row');
    }

    const nextNode = params.api.getDisplayedRowAtIndex((params.node?.rowIndex ?? -1) + 1);
    const closesCluster = params.data.level > 0 && (!nextNode || nextNode.data?.rootId !== params.data.rootId);
    if (closesCluster) {
      classes.push('sandwich-bottom-border');
    }

    return classes.join(' ');
  };

  private masterData: ResultsGridNode[] = [];
  private readonly selectedIds = new Set<string>();
  private readonly nodeById = new Map<string, ResultsGridNode>();
  private readonly parentById = new Map<string, string | null>();
  private readonly descendantsById = new Map<string, string[]>();
  private readonly displayOrderById = new Map<string, number>();
  private displayOrderCounter = 0;

  public ngOnInit(): void {
    this.performSearch({});
  }

  public onGridReady(params: GridReadyEvent<ResultsGridNode>): void {
    this.gridApi = params.api;
    this.applyColumnVisibility();
    this.gridApi.setGridOption('rowData', this.rowData);
    this.withSelectionSync(() => this.syncGridSelectionToState());
    this.gridApi.sizeColumnsToFit();
  }

  public onCellClicked(params: CellClickedEvent<ResultsGridNode>): void {
    if (!params.data) {
      return;
    }

    const target = params.event?.target as HTMLElement | null;
    const clickedChevron = Boolean(target?.closest('[data-action="toggle-expand"]'));

    if (clickedChevron && params.colDef.field === 'profileName' && params.data.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.refreshGrid();
      return;
    }

    if (!params.colDef.field) {
      return;
    }

    params.node.setSelected(!params.node.isSelected());
  }

  public onRowSelected(event: RowSelectedEvent<ResultsGridNode>): void {
    if (this.isSyncing || !event.data) {
      return;
    }

    this.withSelectionSync(() => {
      this.updateClusterSelection(event.data.id, Boolean(event.node.isSelected()));
      this.syncGridSelectionToState();
    });
  }

  public onSelectionChanged(): void {
    if (this.isSyncing) {
      return;
    }

    this.emitSelectedData();
  }

  public performSearch(_criteria: unknown): void {
    this.initializeMasterData();
    this.selectedIds.clear();
    this.refreshGrid();
    this.emitSelectedData();
  }

  public deselectRow(item: Partial<ResultsGridNode>): void {
    const rowId = this.resolveSelectedRowId(item);
    if (!rowId) {
      return;
    }

    this.withSelectionSync(() => {
      this.updateClusterSelection(rowId, false);
      this.syncGridSelectionToState();
    });

    this.emitSelectedData();
  }

  public deselectRows(ids: string[]): void {
    this.withSelectionSync(() => {
      ids.forEach((id) => {
        if (this.nodeById.has(id)) {
          this.updateClusterSelection(id, false);
        }
      });

      this.syncGridSelectionToState();
    });

    this.emitSelectedData();
  }

  public addPendingFilter(): void {
    if (!this.pendingColumnToShow) {
      return;
    }

    if (!this.visibleColumnIds.includes(this.pendingColumnToShow)) {
      this.visibleColumnIds = [...this.visibleColumnIds, this.pendingColumnToShow];
      this.applyColumnVisibility();
    }

    this.pendingColumnToShow = '';
  }

  public removeFilter(columnId: string): void {
    this.visibleColumnIds = this.visibleColumnIds.filter((id) => id !== columnId);
    this.applyColumnVisibility();
  }

  public resetFilters(): void {
    this.visibleColumnIds = this.filterOptions.map((item) => item.id);
    this.pendingColumnToShow = '';
    this.applyColumnVisibility();
  }

  public get activeFilters(): GridFilterOption[] {
    return this.filterOptions.filter((item) => this.visibleColumnIds.includes(item.id));
  }

  public get hiddenFilters(): GridFilterOption[] {
    return this.filterOptions.filter((item) => !this.visibleColumnIds.includes(item.id));
  }

  // Converts Tree -> Flat list for AG Grid rendering.
  private flatten(data: ResultsGridNode[]): ResultsGridNode[] {
    const result: ResultsGridNode[] = [];

    data.forEach((item) => {
      result.push(item);
      if (item.isParent && item.isExpanded && item.children.length > 0) {
        result.push(...this.flatten(item.children));
      }
    });

    return result;
  }

  private refreshGrid(): void {
    this.rowData = [...this.flatten(this.masterData)];

    if (!this.gridApi) {
      return;
    }

    this.gridApi.setGridOption('rowData', this.rowData);

    queueMicrotask(() => {
      this.withSelectionSync(() => this.syncGridSelectionToState());
    });
  }

  private profileNameRenderer(params: ICellRendererParams<ResultsGridNode>): string {
    const row = params.data;
    if (!row) {
      return '';
    }

    const indent = row.level * 24;
    const depthLines = Array.from({ length: row.level })
      .map((_, index) => `<div class="depth-line" style="left:${index * 24 + 12}px"></div>`)
      .join('');

    const chevron = row.isParent
      ? `<span class="bmo-thin-carrot ${row.isExpanded ? 'up' : 'down'}" data-action="toggle-expand"></span>`
      : '<span class="bmo-thin-carrot-spacer"></span>';

    return `
      <div class="name-cell-wrapper" style="padding-left:${indent}px">
        ${depthLines}
        <span class="profile-text">${this.escapeHtml(row.profileName)}</span>
        ${chevron}
      </div>
    `;
  }

  private updateClusterSelection(rowId: string, shouldSelect: boolean): void {
    this.applyRowAndDescendantsSelection(rowId, shouldSelect);
    this.syncAncestorSelection(rowId);
  }

  private applyRowAndDescendantsSelection(rowId: string, shouldSelect: boolean): void {
    const allIds = [rowId, ...(this.descendantsById.get(rowId) ?? [])];

    allIds.forEach((id) => {
      if (shouldSelect) {
        this.selectedIds.add(id);
      } else {
        this.selectedIds.delete(id);
      }
    });
  }

  private syncAncestorSelection(startRowId: string): void {
    let parentId = this.parentById.get(startRowId) ?? null;

    while (parentId) {
      const descendants = this.descendantsById.get(parentId) ?? [];
      const shouldParentBeSelected =
        descendants.length > 0 && descendants.every((descendantId) => this.selectedIds.has(descendantId));

      if (shouldParentBeSelected) {
        this.selectedIds.add(parentId);
      } else {
        this.selectedIds.delete(parentId);
      }

      parentId = this.parentById.get(parentId) ?? null;
    }
  }

  private syncGridSelectionToState(): void {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.forEachNode((node) => {
      const rowId = node.data?.id;
      if (!rowId) {
        return;
      }

      const shouldSelect = this.selectedIds.has(rowId);
      if (node.isSelected() !== shouldSelect) {
        node.setSelected(shouldSelect, false);
      }
    });
  }

  private emitSelectedData(): void {
    const selectedRows = Array.from(this.selectedIds)
      .map((id) => this.nodeById.get(id))
      .filter((node): node is ResultsGridNode => Boolean(node))
      .sort((left, right) => {
        const leftOrder = this.displayOrderById.get(left.id) ?? 0;
        const rightOrder = this.displayOrderById.get(right.id) ?? 0;
        return leftOrder - rightOrder;
      })
      .map((node) => ({ ...node }));

    this.selectionChanged.emit(selectedRows);
    console.log('Results grid selected data:', selectedRows);
  }

  private applyColumnVisibility(): void {
    if (!this.gridApi) {
      return;
    }

    const visible = new Set(this.visibleColumnIds);
    this.filterOptions.forEach((item) => {
      this.gridApi.setColumnsVisible([item.id], visible.has(item.id));
    });
  }

  private resolveSelectedRowId(item: Partial<ResultsGridNode>): string | null {
    if (item.id && this.nodeById.has(item.id)) {
      return item.id;
    }

    const selectedCandidate = Array.from(this.selectedIds).find((selectedId) => {
      const row = this.nodeById.get(selectedId);
      if (!row) {
        return false;
      }

      const byName = !item.legalName || row.legalName === item.legalName;
      const byProfileName = !item.profileName || row.profileName === item.profileName;
      const byOcif = !item.ocifId || row.ocifId === item.ocifId;
      return byName && byProfileName && byOcif;
    });

    return selectedCandidate ?? null;
  }

  private withSelectionSync(action: () => void): void {
    this.isSyncing = true;
    try {
      action();
    } finally {
      this.isSyncing = false;
    }
  }

  private initializeMasterData(): void {
    this.nodeById.clear();
    this.parentById.clear();
    this.descendantsById.clear();
    this.displayOrderById.clear();
    this.displayOrderCounter = 0;

    this.masterData = this.normalizeNodes(this.buildMasterData(), null, null, 0);
  }

  private normalizeNodes(
    sourceNodes: ResultsGridInputNode[],
    parentId: string | null,
    rootId: string | null,
    level: number
  ): ResultsGridNode[] {
    return sourceNodes.map((sourceNode) => {
      const normalizedNode: ResultsGridNode = {
        id: sourceNode.id,
        profileName: sourceNode.profileName,
        legalName: sourceNode.profileName,
        ocifId: sourceNode.ocifId,
        legalHoldStatus: sourceNode.legalHoldStatus,
        status: sourceNode.legalHoldStatus,
        holdName: sourceNode.holdName,
        lifecycle: sourceNode.lifecycle,
        role: sourceNode.role,
        address: sourceNode.address,
        isParent: Boolean(sourceNode.isParent),
        isExpanded: Boolean(sourceNode.isExpanded),
        level,
        parentId,
        rootId: rootId ?? sourceNode.id,
        children: [],
      };

      this.nodeById.set(normalizedNode.id, normalizedNode);
      this.parentById.set(normalizedNode.id, parentId);
      this.displayOrderById.set(normalizedNode.id, this.displayOrderCounter++);

      normalizedNode.children = this.normalizeNodes(
        sourceNode.children ?? [],
        normalizedNode.id,
        normalizedNode.rootId,
        level + 1
      );

      normalizedNode.isParent = normalizedNode.isParent || normalizedNode.children.length > 0;

      const descendants = normalizedNode.children.flatMap((child) => [
        child.id,
        ...(this.descendantsById.get(child.id) ?? []),
      ]);

      this.descendantsById.set(normalizedNode.id, descendants);

      return normalizedNode;
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private buildMasterData(): ResultsGridInputNode[] {
    const commonAddress = '33 Dundas St W, Toronto, ON M5G 2C3';

    return [
      {
        id: 'corp-2',
        profileName: 'Corp 2',
        ocifId: '1000-12345',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: commonAddress,
        isParent: true,
        isExpanded: true,
      },
      {
        id: 'corp-3',
        profileName: 'Corp 3',
        ocifId: '1000-12345',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: commonAddress,
        isParent: true,
        isExpanded: true,
      },
      {
        id: 'corp-4',
        profileName: 'Corp 4',
        ocifId: '1000-12345',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: commonAddress,
        isParent: true,
        isExpanded: true,
      },
      {
        id: 'corp-5',
        profileName: 'Corp 5',
        ocifId: '1000-12345',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: commonAddress,
        isParent: true,
        isExpanded: true,
        children: [
          {
            id: 'corp-5-role-f',
            profileName: 'Role Player F',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: commonAddress,
            isParent: true,
            isExpanded: true,
            children: [
              {
                id: 'corp-5-role-f-l2',
                profileName: 'Role Player F - Level 2',
                ocifId: '1000-12345',
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Owner of F Sub Entity',
                address: commonAddress,
              },
            ],
          },
          this.buildDeepNestedBranch(8, commonAddress),
          {
            id: 'corp-5-role-d',
            profileName: 'Role Player D',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: commonAddress,
          },
          {
            id: 'corp-5-role-e',
            profileName: 'Role Player E',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: commonAddress,
          },
          {
            id: 'corp-5-role-a',
            profileName: 'Role Player A',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Owner of ABC Ltd.',
            address: commonAddress,
          },
          {
            id: 'corp-5-role-b',
            profileName: 'Role Player B',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: commonAddress,
          },
          {
            id: 'corp-5-role-c',
            profileName: 'Role Player C',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: commonAddress,
          },
        ],
      },
    ];
  }

  private buildDeepNestedBranch(depth: number, commonAddress: string): ResultsGridInputNode {
    const root: ResultsGridInputNode = {
      id: 'corp-5-role-g',
      profileName: 'Role Player G',
      ocifId: '1000-12345',
      legalHoldStatus: 'N/A',
      holdName: '',
      lifecycle: 'Active Customer',
      role: 'Authorized Signatory of ABC Ltd.',
      address: commonAddress,
      isParent: true,
      isExpanded: true,
      children: [],
    };

    let cursor = root;
    for (let level = 2; level <= depth; level += 1) {
      const child: ResultsGridInputNode = {
        id: `corp-5-role-g-l${level}`,
        profileName: `Role Player G - Level ${level}`,
        ocifId: '1000-12345',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: level % 2 === 0 ? 'Authorized Delegate' : 'Owner of Nested Entity',
        address: commonAddress,
        isParent: level < depth,
        isExpanded: level < 4,
        children: [],
      };

      cursor.children = [child];
      cursor = child;
    }

    return root;
  }
}
