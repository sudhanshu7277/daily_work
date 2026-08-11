// Step 1: Update toggleSelectAll in your Component (entity-grid.component.ts / multi-level-customer-grid.component.ts)
//Replace or update toggleSelectAll so it targets row selection state:


toggleSelectAll(event?: MouseEvent | boolean): void {
    if (event && typeof event === 'object' && 'stopPropagation' in event) {
      event.stopPropagation();
    }
  
    const all = this.allNodes(); // Recurses N-levels deep via getChildren()
    if (!all.length) return;
  
    // Determine target state: if every row is checked, unselect all; otherwise, select all
    const areAllSelected = all.every(n => n._selected);
    const targetState = typeof event === 'boolean' ? event : !areAllSelected;
  
    // Apply target selection state to all nodes across all N-levels
    all.forEach(node => {
      node._selected = targetState;
    });
  
    // Recompute, sync header icon, refresh grid, and emit selection
    this.syncHeaderCheckbox();
    this.refresh();
    this.emitSelected();
  }


  // Step 2: Ensure syncHeaderCheckbox Refreshes the AG Grid Header
//syncHeaderCheckbox() calculates whether all, some, or zero rows are selected across all levels and updates AG Grid's header parameters to display the blue checked state:


private syncHeaderCheckbox(): void {
    const nodes = this.allNodes();
    if (!nodes.length) return;
  
    const selCount = nodes.filter(n => n._selected).length;
    const state: 'none' | 'some' | 'all' = 
      selCount === 0 ? 'none' : selCount === nodes.length ? 'all' : 'some';
  
    if (this.columnDefs && this.columnDefs[0]) {
      this.columnDefs[0] = {
        ...this.columnDefs[0],
        headerComponentParams: {
          ...this.columnDefs[0].headerComponentParams,
          state,
          onHeaderCheck: () => this.toggleSelectAll()
        }
      };
      // Force AG Grid to update the header UI to show/hide the blue checkmark
      this.gridApi?.refreshHeader();
    }
  }


  // Step 3: Wire Header Column Defs (columnDefs)
//In your column configuration array (initColumns()):

{
    field: 'profileName',
    headerName: 'Profile Name',
    headerComponent: NameHeaderComponent,
    headerComponentParams: {
      onHeaderCheck: () => this.toggleSelectAll(),
      onSelectAll: (select: boolean) => this.toggleSelectAll(select),
      state: 'none'
    },
    cellRenderer: NameCellComponent,
    cellRendererParams: {
      onCheck: (uid: string) => this.onCheckboxClick(uid),
      onToggle: (uid: string) => this.toggleExpand(uid)
    }
  }


  /// Step 4: Header Cell Renderer Component (NameHeaderComponent)
//Ensure the header component template binds the blue styling cb-box--checked when state === 'all':


@Component({
    selector: 'app-name-header',
    standalone: true,
    imports: [CommonModule],
    template: `
      <div class="header-cell">
        <span class="cb-wrap" (click)="onCheckClick($event)">
          <span class="cb-box" [class.cb-box--checked]="state === 'all'" [class.cb-box--some]="state === 'some'">
            <svg *ngIf="state === 'all'" viewBox="0 0 12 10" fill="none" width="12" height="10">
              <polyline points="1.5 4.5, 9 11, 1" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span *ngIf="state === 'some'" class="cb-indeterminate"></span>
          </span>
        </span>
        <span class="header-title">Profile Name</span>
      </div>
    `,
    styles: [`
      .header-cell { display: flex; align-items: center; gap: 8px; }
      .cb-wrap { display: inline-flex; align-items: center; cursor: pointer; padding: 2px; }
      .cb-box {
        width: 18px; height: 18px; border-radius: 3px; border: 1.5px solid #96a6b4;
        background: #ffffff; display: flex; align-items: center; justify-content: center;
        transition: background 0.12s, border-color 0.12s; flex-shrink: 0;
      }
      .cb-box--checked, .cb-box--some {
        background: #0079C1 !important;
        border-color: #0079C1 !important;
      }
      .cb-indeterminate {
        width: 8px; height: 2px; background-color: #ffffff;
      }
      .header-title { font-weight: 700; color: #1a2533; font-size: 13px; }
    `]
  })
  export class NameHeaderComponent implements IHeaderAngularComp {
    state: 'none' | 'some' | 'all' = 'none';
    private params: any;
  
    agInit(params: IHeaderCompParams): void {
      this.sync(params);
    }
  
    refresh(params: IHeaderCompParams): boolean {
      this.sync(params);
      return true;
    }
  
    private sync(params: IHeaderCompParams): void {
      this.params = params;
      this.state = (params as any).state ?? 'none';
    }
  
    onCheckClick(e: MouseEvent): void {
      e.stopPropagation();
      if (this.params?.onHeaderCheck) {
        this.params.onHeaderCheck();
      } else if (this.params?.onSelectAll) {
        this.params.onSelectAll(this.state !== 'all');
      }
    }
  }
