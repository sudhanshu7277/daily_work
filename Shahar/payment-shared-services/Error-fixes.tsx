// Update 1: Cluster Open/Closed Top Line Styles (Lines 225–246)
// Replace lines 225 to 246 (inside ::ng-deep .ag-theme-alpine.csg-grid) with:

/* --- Cluster Expanded (Open): Blue Top & Bottom Lines --- */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-bottom: 1px solid #b8d9f0 !important;
  z-index: 2 !important;

  .ag-cell {
    border-top: 2px solid $bmo-blue !important;
  }
}

.ag-row-first.row-parent-expanded {
  .ag-cell {
    border-top: 2px solid $bmo-blue !important;
  }
}

.ag-row.row-parent-expanded:hover {
  background-color: #d6ecf9 !important;
}

/* --- Cluster Collapsed (Closed): Stays Grey Line --- */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-bottom: 1px solid #e0e0e0 !important;

  .ag-cell {
    border-top: 1px solid #d8e4e6 !important;
  }
}

.ag-row-first.row-parent-collapsed {
  .ag-cell {
    border-top: none !important;
  }
}

.ag-row.row-parent-collapsed:hover {
  background-color: #f5f9fa !important;
}

/* --- Child Cluster Rows & Ending Border --- */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-bottom: 1px solid #e0e0e0 !important;
  border-top: none !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}


// Update 2: "Showing:" & Chips Row Alignment (Lines 462–495)
// Replace lines 462 to 495 with:

.chips-row {
  display: flex !important;
  align-items: flex-start !important;
  margin-bottom: 20px;
  padding-left: 0 !important;
  margin-left: 0 !important;

  .showing-label {
    width: auto !important;
    min-width: unset !important;
    max-width: unset !important;
    flex: 0 0 auto !important;

    padding: 0 !important;
    /* 6px aligns baseline with chips; 8px keeps Profile Name close */
    margin: 6px 8px 0 0 !important;

    font-size: 14px;
    font-weight: 400 !important;
    color: #1a1a1a;
    line-height: 1.2;
    white-space: nowrap;
    text-align: left;
  }

  .chips-list {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center;
    gap: 10px 8px; /* 10px vertical row spacing, 8px horizontal chip spacing */
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
}





//// Here is the exact replacement for lines 209 to 246 in multi-level-customer-grid-component.scss:



/* Base Row Styles */
.ag-row {
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;
  background-color: #ffffff;

  .ag-cell {
    display: flex !important;
    align-items: center !important;
    font-size: 13px !important;
    color: #1c2333;
    border: none !important; /* Clears rogue cell borders */
    background: transparent !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 14px !important;
    line-height: 1.5;

    &[col-id="profileName"] {
      border-right: 1px solid #d8e4e6 !important;
    }
  }
}

/* --- Cluster Collapsed (Closed): Normal Grey Divider Only --- */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* --- Cluster Expanded (Open): Blue Top & Bottom Framing --- */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-top: 2px solid $bmo-blue !important;
  border-bottom: 1px solid #b8d9f0 !important;
  z-index: 2 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* Child Cluster Rows */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-top: none !important;
  border-bottom: 1px solid #e0e0e0 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* Blue line at the bottom of the open cluster */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}

