::ng-deep {
  /* AG-Grid Theme Variable */
  .ag-root-wrapper {
    --ag-scrollbar-size: 16px !important;
  }

  /* Override AG-Grid inline styles on scroll containers */
  .ag-body-vertical-scroll,
  .ag-body-vertical-scroll-viewport,
  .ag-body-vertical-scroll-container {
    width: 16px !important;
    min-width: 16px !important;
    max-width: 16px !important;
  }

  /* WebKit (Chrome / Edge / Safari) */
  .ag-body-vertical-scroll-viewport {
    &::-webkit-scrollbar {
      width: 16px !important;
    }

    &::-webkit-scrollbar-track {
      background-color: #e5e5e5 !important;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #4a4a4a !important; /* Dark grey */
      border-radius: 8px !important;
      border: 3px solid #e5e5e5 !important; /* Clean padding around thumb */

      &:hover {
        background-color: #2b2b2b !important; /* Darker grey on hover */
      }
    }
  }

  /* Firefox */
  .ag-body-vertical-scroll-viewport {
    scrollbar-width: auto;
    scrollbar-color: #4a4a4a #e5e5e5;
  }
}