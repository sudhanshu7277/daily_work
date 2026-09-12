// In multi-level-grid.config.ts
// Replace the static cellStyle: { ... } on profileName with a dynamic callback:

{
  field: 'profileName',
  headerName: 'Profile Name',
  sortable: true,
  minWidth: 170,
  width: 170,
  flex: 2,
  headerComponent: NameHeaderComponent,
  headerComponentParams: {
    onSelectAll: onHeaderCheckClick,
    state: 'none'
  },
  cellRenderer: NameCellComponent,
  cellRendererParams: {
    onCheck: onCheckboxClick,
    onToggle: toggleExpand
  },
  cellStyle: (params) => {
    const level = params.data?.level ?? params.data?._level ?? 0;
    
    // Ternary condition based on indentation level:
    // Level 0 (flat) & Level 1: strictly cap max-width to prevent selection ballooning
    // Level > 1 (deep clusters): allow natural flexible width so hierarchy is never squished
    const maxWidth = (level <= 1) ? '240px' : '100%';

    return {
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      maxWidth: maxWidth,
      boxSizing: 'border-box'
    };
  }
},

// In name-renderers.component.ts, update NameCellComponent (lines 16–17):

<div class="name-cell" 
     [style.padding-left.px]="level * 20"
     [style.max-width]="level <= 1 ? '240px' : 'none'">