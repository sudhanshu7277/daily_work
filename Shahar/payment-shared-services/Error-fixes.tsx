//1. In name-renderers.component.ts
//Look at lines 48–52 and lines 65–74 (image 51 & 52):

Find:

:host { display: flex; align-items: center; width: 100%; }
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}


// Replace with:

:host { 
  display: flex; 
  align-items: center; 
  width: 100%; 
  max-width: 100%;
  overflow: hidden; 
}
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

// And in .name-text (lines 65–73):
//Make sure flex shrink and ellipsis truncation are strictly enforced:

.name-text {
  color: #0079C1;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
  min-width: 0;
}


// 2. In multi-level-customer-grid.component.scss
//Add these rules to keep AG-Grid's cells clipped to their exact column boundaries during re-rendering:


/* Prevent profileName cell from overflowing into adjacent columns */
.ag-cell[col-id="profileName"] {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  contain: paint;
}

/* Ensure row selection does not alter flex/display geometry */
.ag-row.ag-row-selected {
  .ag-cell {
    overflow: hidden !important;
  }
}


// 3. In multi-level-grid.config.ts
// On the profileName column definition (lines 69–85):
// Add cellStyle:


cellStyle: {
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
},