// 1. Add toggleAllRows to EntityGridComponent / MultiLevelCustomerGridComponentAdd this method to entity-grid.component.ts (and multi-level-customer-grid.component.ts). It gathers all nodes across all $N$-levels and selects or unselects them in lockstep:

onHeaderCheckClick(): void {
    const all = this.allNodes(); // Recurses N-levels deep via getChildren()
    if (!all.length) return;
  
    // If all profiles are currently selected, unselect all; otherwise, select all
    const areAllSelected = all.every(n => n._selected);
    const shouldSelect = !areAllSelected;
  
    // Apply state to every node in the entire tree
    all.forEach(node => {
      node._selected = shouldSelect;
    });
  
    this.refresh();
    this.syncHeaderCheckbox();
    this.emitSelected();
  }


  // 2. Connect the Method to the Header Renderer Parameters
//In initColumns() (where columnDefs are configured for the Profile Name column), pass onHeaderCheckClick inside headerComponentParams:

this.columnDefs = [
    {
      field: 'profileName',
      headerName: 'Profile Name',
      headerComponent: EntityNameHeaderComponent,
      headerComponentParams: {
        onHeaderCheck: () => this.onHeaderCheckClick(),
        state: 'none'
      },
      cellRenderer: EntityNameCellComponent,
      cellRendererParams: {
        onCheck: (uid: string) => this.onCheckboxClick(uid),
        onToggle: (uid: string) => this.toggleExpand(uid)
      }
    },
    // ... rest of column definitions
  ];


  // 3. Ensure EntityNameHeaderComponent Invokes onHeaderCheck
//In EntityNameHeaderComponent (app-cs-name-header / EntityNameHeaderComponent), make sure the header checkbox click listener triggers params.onHeaderCheck:

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
        <span class="header-title" (click)="onSortClick($event)">
          Profile Name
        </span>
      </div>
    `
  })
  export class EntityNameHeaderComponent implements IHeaderAngularComp {
    state: 'none' | 'some' | 'all' = 'none';
    private params: any;
  
    agInit(params: IHeaderCompParams): void {
      this.params = params;
      this.state = (params as any).state ?? 'none';
    }
  
    refresh(params: IHeaderCompParams): boolean {
      this.params = params;
      this.state = (params as any).state ?? 'none';
      return true;
    }
  
    onCheckClick(e: MouseEvent): void {
      e.stopPropagation();
      if (this.params?.onHeaderCheck) {
        this.params.onHeaderCheck();
      }
    }
  
    onSortClick(e: MouseEvent): void {
      // Optional sort trigger logic
    }
  }


  