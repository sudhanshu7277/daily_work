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



/// final fix


/* Target disabled mandatory mat-options */
.mat-mdc-option[aria-disabled="true"],
.mat-mdc-option.mdc-list-item--disabled {
  opacity: 1 !important;
  background-color: transparent !important;
  cursor: not-allowed !important;

  /* 1. Remove the grey focus/hover state layer strip */
  .mat-mdc-option-state-layer {
    background-color: transparent !important;
    opacity: 0 !important;
  }

  /* 2. Text styling: Solid dark, high-contrast readable text */
  --mdc-list-list-item-disabled-label-text-opacity: 1 !important;

  .mdc-list-item__primary-text {
    color: #1a1a1a !important;
    font-weight: 500 !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
  }

  /* 3. Solid medium-grey checkbox box */
  .mat-pseudo-checkbox {
    background-color: #718096 !important;
    border-color: #718096 !important;
    border-radius: 3px !important;
    opacity: 1 !important;
    position: relative !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: not-allowed !important;

    /* 4. Force white checkmark tick inside disabled box */
    &::after {
      content: '' !important;
      display: block !important;
      position: absolute !important;
      left: 5px !important;
      top: 2px !important;
      width: 4px !important;
      height: 8px !important;
      border: solid #ffffff !important;
      border-width: 0 2px 2px 0 !important;
      transform: rotate(45deg) !important;
      opacity: 1 !important;
    }
  }
}