// In multi-level-customer-grid-component.scss
// Replace lines 452–460 (inside ::ng-deep .bmo-custom-dropdown-panel) with:


.mat-mdc-option:not(.select-all-option).mat-mdc-option-disabled {
  /* 1. Remove the grey background & prevent opacity dimming on the row */
  background-color: transparent !important;
  opacity: 1 !important;
  cursor: not-allowed !important;

  /* 2. Text styling: Solid dark, high-contrast text */
  .mdc-list-item__primary-text {
    color: #1a1a1a !important;
    font-weight: 500 !important;
    opacity: 1 !important;
  }

  /* 3. Checkbox container: Solid medium-grey filled box */
  .mat-pseudo-checkbox {
    background-color: #718096 !important;
    border-color: #718096 !important;
    opacity: 1 !important;

    /* 4. Sharp white checkmark matching your active checks */
    &::after {
      opacity: 1 !important;
      border-color: #ffffff !important;
    }
  }
}


