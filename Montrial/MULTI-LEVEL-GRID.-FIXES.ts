// 1. Fix toggleSelectAll & onHeaderCheckClick
//Ensure toggleSelectAll explicitly calls this.syncHeaderCheckbox() after updating node selection:

toggleSelectAll(select?: boolean): void {
    const all = this.allNodes();
    if (!all.length) return;
  
    // 1. Determine target state
    const areAllSelected = all.every(n => n._selected);
    const targetState = typeof select === 'boolean' ? select : !areAllSelected;
  
    // 2. Set _selected state on all N-level nodes
    all.forEach(node => {
      node._selected = targetState;
    });
  
    // 3. Recompute ancestors, sync header state, refresh grid, and emit event
    this.recomputeAncestors(this.tree);
    this.syncHeaderCheckbox();
    this.refresh();
    this.emitSelected();
  }
  
  onHeaderCheckClick(): void {
    this.toggleSelectAll();
  }

  // 2. Fix syncHeaderCheckbox Method
//Ensure syncHeaderCheckbox() correctly re-assigns headerComponentParams so AG Grid triggers a header re-render:

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
      // Force AG Grid to update the header component UI
      this.gridApi?.refreshHeader();
    }
  }

  // 3. Ensure onCheckboxClick Calls syncHeaderCheckbox
//When individual or cluster row checkboxes are clicked, syncHeaderCheckbox() must also be invoked so the header checkbox dynamically syncs between 'none', 'some', and 'all'

onCheckboxClick(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;
    const { node } = found;
    node._selected = !node._selected;
  
    const children = this.getChildren(node);
    if (node._isParent && children.length) {
      this.setDescendantsSelected(children, node._selected);
    }
    this.recomputeAncestors(this.tree);
  
    // Sync header state when row selection changes
    this.syncHeaderCheckbox();
    this.refresh();
    this.emitSelected();
  }


  // 4. Update Header Renderer Template & CSS (NameHeaderComponent)
//In your header cell renderer (NameHeaderComponent / EntityNameHeaderComponent), make sure the CSS includes background: #0079C1 and the template renders the <svg> checkmark when state === 'all':


@Component({
    selector: 'app-entity-name-header',
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
  export class EntityNameHeaderComponent implements IHeaderAngularComp {
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
      }
    }
  }