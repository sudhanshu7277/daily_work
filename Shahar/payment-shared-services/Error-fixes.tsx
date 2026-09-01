.mat-mdc-option:not(.select-all-option) {
  &.mat-mdc-option-disabled {
    /* 1. Prevent Material from fading out the entire row */
    opacity: 1 !important;
    background-color: #ffffff !important;
    cursor: not-allowed !important;

    /* 2. Text styling: Dark, crisp, readable */
    .mdc-list-item__primary-text,
    .mat-mdc-option-text,
    span {
      color: #212529 !important;
      font-weight: 500 !important;
      opacity: 1 !important;
      cursor: not-allowed !important;
    }

    /* 3. Checkbox container: Solid medium-grey filled box */
    .mat-pseudo-checkbox,
    .mat-pseudo-checkbox-full {
      background-color: #718096 !important; /* Solid grey fill */
      border-color: #718096 !important;
      border-radius: 3px !important;
      opacity: 1 !important;
      cursor: not-allowed !important;

      /* 4. Sharp White Checkmark (matches lines 402-416 from .is-checked) */
      &::after {
        opacity: 1 !important;
        border-color: #ffffff !important;
      }
    }
  }
}