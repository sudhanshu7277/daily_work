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
} from 'ag-grid-community';

interface HierarchyNode {
  id: string;
  profileName: string;
  ocifId: string;
  legalHoldStatus: 'LEGAL HOLD' | 'N/A';
  holdName: string;
  lifecycle: string;
  role: string;
  address: string;
  children?: HierarchyNode[];
}

interface ResultsGridRow {
  id: string;
  parentId: string | null;
  rootId: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  profileName: string;
  legalName: string;
  ocifId: string;
  legalHoldStatus: 'LEGAL HOLD' | 'N/A';
  status: 'LEGAL HOLD' | 'N/A';
  holdName: string;
  lifecycle: string;
  role: string;
  address: string;
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
  @Output() selectionChanged = new EventEmitter<ResultsGridRow[]>();

  public rowData: ResultsGridRow[] = [];
  public readonly rowSelection: 'multiple' = 'multiple';
  public pendingColumnToShow = '';

  public readonly filterOptions: GridFilterOption[] = [
    { id: 'profileName', label: 'Profile Name' },
    { id: 'ocifId', label: 'Proxy OCIF ID' },
    { id: 'legalHoldStatus', label: 'Legal Hold Status' },
    { id: 'holdName', label: 'Legal Hold Name' },
    { id: 'lifecycle', label: 'Customer Lifecycle Status' },
    { id: 'role', label: 'Role Type' },
    { id: 'address', label: 'Address' },
  ];

  public visibleColumnIds = this.filterOptions.map((option) => option.id);

  public readonly defaultColDef: ColDef<ResultsGridRow> = {
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
  };

  public readonly columnDefs: ColDef<ResultsGridRow>[] = [
    {
      colId: 'select',
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      pinned: 'left',
      lockPinned: true,
      lockPosition: true,
      width: 52,
      minWidth: 52,
      maxWidth: 52,
      sortable: false,
      resizable: false,
      suppressMovable: true,
    },
    {
      colId: 'profileName',
      field: 'profileName',
      headerName: 'Profile Name',
      minWidth: 230,
      flex: 1.5,
      suppressMovable: true,
      unSortIcon: true,
      cellRenderer: (params: ICellRendererParams<ResultsGridRow>) =>
        this.renderProfileCell(params.data),
    },
    {
      colId: 'ocifId',
      field: 'ocifId',
      headerName: 'Proxy OCIF ID',
      minWidth: 150,
      flex: 1,
      suppressMovable: true,
    },
    {
      colId: 'legalHoldStatus',
      field: 'legalHoldStatus',
      headerName: 'Legal Hold Status',
      minWidth: 170,
      flex: 1,
      suppressMovable: true,
      unSortIcon: true,
      cellRenderer: (params: ICellRendererParams<ResultsGridRow, ResultsGridRow['legalHoldStatus']>) => {
        if (params.value === 'LEGAL HOLD') {
          return '<span class="rg-status-pill">LEGAL HOLD</span>';
        }

        return '<span class="rg-status-na">N/A</span>';
      },
    },
    {
      colId: 'holdName',
      field: 'holdName',
      headerName: 'Legal Hold Name',
      minWidth: 170,
      flex: 1.2,
      suppressMovable: true,
    },
    {
      colId: 'lifecycle',
      field: 'lifecycle',
      headerName: 'Customer Lifecycle Status',
      minWidth: 190,
      flex: 1.2,
      suppressMovable: true,
    },
    {
      colId: 'role',
      field: 'role',
      headerName: 'Role Type',
      minWidth: 210,
      flex: 1.4,
      suppressMovable: true,
    },
    {
      colId: 'address',
      field: 'address',
      headerName: 'Address',
      minWidth: 220,
      flex: 1.4,
      suppressMovable: true,
      cellClass: 'rg-address-cell',
    },
  ];

  public readonly getRowClass = (params: RowClassParams<ResultsGridRow>): string =>
    params.data?.hasChildren ? 'rg-parent-row' : 'rg-child-row';

  public readonly getRowId = (params: GetRowIdParams<ResultsGridRow>): string => params.data.id;

  private gridApi?: GridApi<ResultsGridRow>;
  private sourceTree: HierarchyNode[] = [];
  private readonly rowById = new Map<string, ResultsGridRow>();
  private readonly orderById = new Map<string, number>();
  private readonly parentById = new Map<string, string | null>();
  private readonly descendantsById = new Map<string, string[]>();
  private readonly childIdsById = new Map<string, string[]>();
  private readonly selectedIds = new Set<string>();
  private expandedIds = new Set<string>();
  private isSyncingSelection = false;
  private displayOrder = 0;

  public ngOnInit(): void {
    this.performSearch({});
  }

  public onGridReady(event: GridReadyEvent<ResultsGridRow>): void {
    this.gridApi = event.api;
    this.applyColumnVisibility();
    this.gridApi.setGridOption('rowData', this.rowData);
    this.syncVisibleSelection();
    this.gridApi.sizeColumnsToFit();
  }

  public onCellClicked(event: CellClickedEvent<ResultsGridRow>): void {
    if (!event.data) {
      return;
    }

    const target = event.event?.target as HTMLElement | null;
    const isExpandToggle = Boolean(target?.closest('[data-action="toggle-expand"]'));

    if (isExpandToggle) {
      this.toggleRowExpansion(event.data.id);
      return;
    }

    if (event.colDef.colId === 'select') {
      return;
    }

    event.node.setSelected(!event.node.isSelected());
  }

  public onRowSelected(event: RowSelectedEvent<ResultsGridRow>): void {
    if (this.isSyncingSelection || !event.data) {
      return;
    }

    this.isSyncingSelection = true;

    try {
      this.updateSelectionState(event.data.id, Boolean(event.node.isSelected()));
      this.syncVisibleSelection();
      this.emitSelectionAndLog();
    } finally {
      this.isSyncingSelection = false;
    }
  }

  public performSearch(_criteria: unknown): void {
    this.sourceTree = this.buildMockTree();
    this.rebuildIndexes();
    this.expandedIds = new Set(['corp-5', 'corp-5-role-f', 'corp-5-role-g']);
    this.selectedIds.clear();
    this.refreshVisibleRows();
    this.emitSelectionAndLog();
  }

  public deselectRow(item: Partial<ResultsGridRow>): void {
    const rowId = this.resolveRowId(item);

    if (!rowId) {
      return;
    }

    this.isSyncingSelection = true;

    try {
      this.updateSelectionState(rowId, false);
      this.syncVisibleSelection();
      this.emitSelectionAndLog();
    } finally {
      this.isSyncingSelection = false;
    }
  }

  public deselectRows(ids: string[]): void {
    this.isSyncingSelection = true;

    try {
      ids.forEach((id) => {
        if (this.rowById.has(id)) {
          this.updateSelectionState(id, false);
        }
      });
      this.syncVisibleSelection();
      this.emitSelectionAndLog();
    } finally {
      this.isSyncingSelection = false;
    }
  }

  public addPendingFilter(): void {
    const selectedFilter = this.pendingColumnToShow;

    if (!selectedFilter) {
      return;
    }

    if (!this.visibleColumnIds.includes(selectedFilter)) {
      this.visibleColumnIds = [...this.visibleColumnIds, selectedFilter];
      this.applyColumnVisibility();
    }

    this.pendingColumnToShow = '';
  }

  public removeFilter(columnId: string): void {
    this.visibleColumnIds = this.visibleColumnIds.filter((id) => id !== columnId);
    this.applyColumnVisibility();
  }

  public resetFilters(): void {
    this.visibleColumnIds = this.filterOptions.map((option) => option.id);
    this.pendingColumnToShow = '';
    this.applyColumnVisibility();
  }

  public get activeFilters(): GridFilterOption[] {
    return this.filterOptions.filter((option) => this.visibleColumnIds.includes(option.id));
  }

  public get hiddenFilters(): GridFilterOption[] {
    return this.filterOptions.filter((option) => !this.visibleColumnIds.includes(option.id));
  }

  private renderProfileCell(row: ResultsGridRow | undefined): string {
    if (!row) {
      return '';
    }

    const indent = row.depth * 24;
    const toggleMarkup = row.hasChildren
      ? `<button class="rg-chevron ${row.isExpanded ? 'expanded' : 'collapsed'}" data-action="toggle-expand" aria-label="${row.isExpanded ? 'Collapse row' : 'Expand row'}"></button>`
      : '<span class="rg-chevron-spacer"></span>';

    return `
      <div class="rg-profile-cell" style="--rg-indent:${indent}px">
        ${toggleMarkup}
        <span class="rg-profile-name">${this.escapeHtml(row.profileName)}</span>
      </div>
    `;
  }

  private toggleRowExpansion(rowId: string): void {
    const childIds = this.childIdsById.get(rowId) ?? [];

    if (childIds.length === 0) {
      return;
    }

    if (this.expandedIds.has(rowId)) {
      this.expandedIds.delete(rowId);
    } else {
      this.expandedIds.add(rowId);
    }

    this.refreshVisibleRows();
  }

  private refreshVisibleRows(): void {
    this.rowData = this.buildVisibleRows();

    if (!this.gridApi) {
      return;
    }

    this.gridApi.setGridOption('rowData', this.rowData);
    queueMicrotask(() => this.syncVisibleSelection());
  }

  private buildVisibleRows(): ResultsGridRow[] {
    const visibleRows: ResultsGridRow[] = [];

    const walk = (nodes: HierarchyNode[]): void => {
      nodes.forEach((node) => {
        const row = this.rowById.get(node.id);

        if (!row) {
          return;
        }

        visibleRows.push({
          ...row,
          isExpanded: this.expandedIds.has(node.id),
        });

        if (row.hasChildren && this.expandedIds.has(node.id) && node.children?.length) {
          walk(node.children);
        }
      });
    };

    walk(this.sourceTree);

    return visibleRows;
  }

  private rebuildIndexes(): void {
    this.rowById.clear();
    this.orderById.clear();
    this.parentById.clear();
    this.descendantsById.clear();
    this.childIdsById.clear();
    this.displayOrder = 0;

    this.sourceTree.forEach((rootNode) => {
      this.indexNode(rootNode, null, rootNode.id, 0);
    });
  }

  private indexNode(
    node: HierarchyNode,
    parentId: string | null,
    rootId: string,
    depth: number
  ): string[] {
    const children = node.children ?? [];
    const childIds: string[] = [];
    const descendants: string[] = [];

    const row: ResultsGridRow = {
      id: node.id,
      parentId,
      rootId,
      depth,
      hasChildren: children.length > 0,
      isExpanded: false,
      profileName: node.profileName,
      legalName: node.profileName,
      ocifId: node.ocifId,
      legalHoldStatus: node.legalHoldStatus,
      status: node.legalHoldStatus,
      holdName: node.holdName,
      lifecycle: node.lifecycle,
      role: node.role,
      address: node.address,
    };

    this.rowById.set(node.id, row);
    this.parentById.set(node.id, parentId);
    this.orderById.set(node.id, this.displayOrder);
    this.displayOrder += 1;

    children.forEach((child) => {
      childIds.push(child.id);
      const nestedDescendants = this.indexNode(child, node.id, rootId, depth + 1);
      descendants.push(child.id, ...nestedDescendants);
    });

    this.childIdsById.set(node.id, childIds);
    this.descendantsById.set(node.id, descendants);

    return descendants;
  }

  private updateSelectionState(rowId: string, isSelected: boolean): void {
    if (isSelected) {
      this.selectedIds.add(rowId);
    } else {
      this.selectedIds.delete(rowId);
    }

    const descendants = this.descendantsById.get(rowId) ?? [];
    descendants.forEach((descendantId) => {
      if (isSelected) {
        this.selectedIds.add(descendantId);
      } else {
        this.selectedIds.delete(descendantId);
      }
    });

    this.syncAncestorSelection(rowId);
  }

  private syncAncestorSelection(startingRowId: string): void {
    let parentId = this.parentById.get(startingRowId) ?? null;

    while (parentId) {
      const descendantIds = this.descendantsById.get(parentId) ?? [];
      const allDescendantsSelected =
        descendantIds.length > 0 &&
        descendantIds.every((descendantId) => this.selectedIds.has(descendantId));

      if (allDescendantsSelected) {
        this.selectedIds.add(parentId);
      } else {
        this.selectedIds.delete(parentId);
      }

      parentId = this.parentById.get(parentId) ?? null;
    }
  }

  private syncVisibleSelection(): void {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.forEachNode((node) => {
      const rowId = node.data?.id;

      if (!rowId) {
        return;
      }

      const shouldBeSelected = this.selectedIds.has(rowId);

      if (node.isSelected() !== shouldBeSelected) {
        node.setSelected(shouldBeSelected, false);
      }
    });
  }

  private emitSelectionAndLog(): void {
    const selectedRows = Array.from(this.selectedIds)
      .map((id) => this.rowById.get(id))
      .filter((row): row is ResultsGridRow => Boolean(row))
      .sort((left, right) => (this.orderById.get(left.id) ?? 0) - (this.orderById.get(right.id) ?? 0))
      .map((row) => ({ ...row }));

    this.selectionChanged.emit(selectedRows);
    console.log('Results grid selected data:', selectedRows);
  }

  private resolveRowId(item: Partial<ResultsGridRow>): string | null {
    if (item.id && this.rowById.has(item.id)) {
      return item.id;
    }

    const selectedCandidate = Array.from(this.selectedIds).find((selectedId) => {
      const row = this.rowById.get(selectedId);

      if (!row) {
        return false;
      }

      const legalNameMatches = !item.legalName || row.legalName === item.legalName;
      const profileNameMatches = !item.profileName || row.profileName === item.profileName;
      const ocifMatches = !item.ocifId || row.ocifId === item.ocifId;

      return legalNameMatches && profileNameMatches && ocifMatches;
    });

    return selectedCandidate ?? null;
  }

  private applyColumnVisibility(): void {
    if (!this.gridApi) {
      return;
    }

    const visible = new Set(this.visibleColumnIds);

    this.filterOptions.forEach((option) => {
      this.gridApi?.setColumnsVisible([option.id], visible.has(option.id));
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

  private buildMockTree(): HierarchyNode[] {
    return [
      {
        id: 'corp-2',
        profileName: 'Corp 2',
        ocifId: '1000-12345',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        children: [
          {
            id: 'corp-2-rp-a',
            profileName: 'Role Player A',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
        ],
      },
      {
        id: 'corp-3',
        profileName: 'Corp 3',
        ocifId: '1000-12345',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        children: [
          {
            id: 'corp-3-rp-a',
            profileName: 'Role Player A',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
        ],
      },
      {
        id: 'corp-4',
        profileName: 'Corp 4',
        ocifId: '1000-12345',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        children: [
          {
            id: 'corp-4-rp-a',
            profileName: 'Role Player A',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
        ],
      },
      {
        id: 'corp-5',
        profileName: 'Corp 5',
        ocifId: '1000-12345',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        children: [
          {
            id: 'corp-5-role-f',
            profileName: 'Role Player F',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            children: [
              {
                id: 'corp-5-role-f-l2',
                profileName: 'Role Player F - Level 2',
                ocifId: '1000-12345',
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Owner of F Sub Entity',
                address: '33 Dundas St W, Toronto, ON M5G 2C3',
              },
            ],
          },
          {
            id: 'corp-5-role-g',
            profileName: 'Role Player G',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            children: [
              {
                id: 'corp-5-role-g-l2',
                profileName: 'Role Player G - Level 2',
                ocifId: '1000-12345',
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Delegate',
                address: '33 Dundas St W, Toronto, ON M5G 2C3',
                children: [
                  {
                    id: 'corp-5-role-g-l3',
                    profileName: 'Role Player G - Level 3',
                    ocifId: '1000-12345',
                    legalHoldStatus: 'N/A',
                    holdName: '',
                    lifecycle: 'Active Customer',
                    role: 'Authorized Delegate',
                    address: '33 Dundas St W, Toronto, ON M5G 2C3',
                  },
                ],
              },
            ],
          },
          {
            id: 'corp-5-role-d',
            profileName: 'Role Player D',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
          {
            id: 'corp-5-role-e',
            profileName: 'Role Player E',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
          {
            id: 'corp-5-role-a',
            profileName: 'Role Player A',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Owner of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
          {
            id: 'corp-5-role-b',
            profileName: 'Role Player B',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
          {
            id: 'corp-5-role-c',
            profileName: 'Role Player C',
            ocifId: '1000-12345',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
          },
        ],
      },
    ];
  }
}
