/* Target disabled mandatory mat-options */
.mat-mdc-option:not(.select-all-option).mat-mdc-option-disabled {
  /* 1. Prevent background wash and remove grey highlight strip */
  background-color: transparent !important;
  opacity: 1 !important;
  cursor: not-allowed !important;

  /* 2. MDC CSS Custom Properties override (prevents Material token overrides) */
  --mat-option-label-text-color: #1a1a1a !important;
  --mdc-list-list-item-disabled-label-text-color: #1a1a1a !important;
  --mat-option-disabled-state-layer-color: transparent !important;

  /* 3. Text label: solid dark text matching active options */
  .mdc-list-item__primary-text {
    color: #1a1a1a !important;
    font-weight: 500 !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
  }

  /* 4. Checkbox Container: solid medium-grey filled box */
  .mat-pseudo-checkbox,
  .mat-pseudo-checkbox-full {
    background-color: #718096 !important;
    border-color: #718096 !important;
    border-radius: 3px !important;
    opacity: 1 !important;
    cursor: not-allowed !important;

    /* 5. White Checkmark (matches lines 402-416) */
    &::after {
      opacity: 1 !important;
      border-color: #ffffff !important;
    }
  }
}