// File: name-renderers.component.ts
// In name-renderers.component.ts, look at the styles block for 
// NameCellComponent (lines 48–83 in your screenshots).

// Replace lines 48–83 with:


:host {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.cb-wrap {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 2px;
}

.cb-box {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1.5px solid #96a6b4;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, border-color 0.12s;
  flex-shrink: 0;
}

.cb-wrap:hover .cb-box { border-color: #0079C1; }
.cb-box--checked { background: #0079C1 !important; border-color: #0079C1 !important; }

.name-text {
  color: #0079C1;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
  flex: 1 1 auto;
  min-width: 0;
}

.name-text--parent {
  font-weight: 600;
}


// File: multi-level-customer-grid.component.scss
// Add these rules to lock the cell bounds so row selection and checkbox 
// toggling cannot expand the column width:

/* Keep Profile Name cell bound strictly to its column box */
.ag-cell[col-id="profileName"] {
  max-width: 100% !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
}

/* Ensure AG Grid's selection highlight class does not alter box-sizing or dimensions */
.ag-row-selected .ag-cell[col-id="profileName"] {
  max-width: 100% !important;
  box-sizing: border-box !important;
}