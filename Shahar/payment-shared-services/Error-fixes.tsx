// In multi-level-customer-grid-component.scss, the exact clean fix used across the codebase to override AG Grid's scrollbar width and styling is:

/* Target the grid root and custom scrollbar size */
.ag-root-wrapper {
  --ag-scrollbar-size: 8px;

  /* Force scroll viewport to custom width */
  .ag-body-vertical-scroll-viewport {
    &::-webkit-scrollbar {
      width: 8px !important;
    }

    &::-webkit-scrollbar-track {
      background-color: #f1f1f1 !important;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c1c1c1 !important;
      border-radius: 4px !important;

      &:hover {
        background-color: #999999 !important;
      }
    }
  }

  /* Firefox */
  .ag-body-vertical-scroll-viewport {
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f1f1f1;
  }
}