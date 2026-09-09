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





// LATEST FIXES


//1. In multi-level-grid.config.ts
// Increase minWidth and give profileName dynamic flex growth so 
// the column expands to fit long names at deep indentation levels:


field: 'profileName',
headerName: 'Profile Name',
minWidth: 340, // Increased from 170/260 to accommodate deep level indents
flex: 2,       // Takes available space to prevent truncation
sortable: true,
autoHeight: true,
wrapText: true,
cellStyle: {
  display: 'flex',
  alignItems: 'center',
  overflow: 'visible',
},


// 2. In name-renderers.component.ts
// Update .name-text and .name-cell inside the @Component styles (lines 48–74):

:host {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.name-text {
  color: #0079C1;
  font-size: 13px;
  font-weight: 400;
  white-space: normal;           /* Allow multi-word wrapping instead of clipping */
  word-break: break-word;        /* Wrap long continuous strings gracefully */
  line-height: 1.35;
  flex: 1 1 auto;
  min-width: 0;
}


// 3. In multi-level-customer-grid-component.scss
// Ensure AG-Grid allows dynamic vertical growth for rows that wrap without 
// overlapping neighboring columns:


/* Keep cell bounds clean while letting content breathe */
.ag-cell[col-id="profileName"] {
  display: flex !important;
  align-items: center !important;
  overflow: visible !important;
  white-space: normal !important;
  padding-right: 12px !important;
}

/* Ensure selected rows retain full dimensions and do not collapse */
.ag-row.ag-row-selected {
  .ag-cell[col-id="profileName"] {
    overflow: visible !important;
  }
}