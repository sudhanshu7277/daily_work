/* Target disabled options via aria-disabled and MDC disabled class */
.mat-mdc-option[aria-disabled="true"],
.mat-mdc-option.mdc-list-item--disabled {
  opacity: 1 !important;
  cursor: not-allowed !important;

  /* 1. Kill the grey focus/hover state layer completely */
  .mat-mdc-option-state-layer {
    background-color: transparent !important;
    opacity: 0 !important;
  }

  /* 2. Remove default MDC opacity dimming on the text */
  --mdc-list-list-item-disabled-label-text-opacity: 1 !important;

  .mdc-list-item__primary-text {
    color: #1a1a1a !important; /* Solid dark text */
    opacity: 1 !important;
    font-weight: 500 !important;
    cursor: not-allowed !important;
  }

  /* 3. Target real MDC pseudo-checkbox (solid grey box) */
  .mat-pseudo-checkbox {
    background-color: #718096 !important;
    border-color: #718096 !important;
    border-radius: 3px !important;
    opacity: 1 !important;
    cursor: not-allowed !important;

    /* 4. Sharp white checkmark tick */
    &::after {
      opacity: 1 !important;
      border-color: #ffffff !important;
      border-width: 0 2px 2px 0 !important;
    }
  }
}